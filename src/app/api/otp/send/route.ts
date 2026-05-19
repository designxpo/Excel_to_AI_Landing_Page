import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { registerWebinarParticipant, type ZoomRegistrationResult } from '@/lib/zoom';
import { sendMetaCapiEvent, extractClientContext } from '@/lib/meta';

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

function lsqCaptureUrl(): string {
  return `https://api-in21.leadsquared.com/v2/LeadManagement.svc/Lead.Capture?accessKey=${requireEnv('LSQ_ACCESS')}&secretKey=${requireEnv('LSQ_SECRET')}`;
}

// --- Google Sheets Helpers ---
let sheetsTokenCache: { token: string; expiresAt: number } | null = null;
async function getGoogleSheetsToken(clientEmail: string, privateKey: string): Promise<string> {
  if (sheetsTokenCache && Date.now() < sheetsTokenCache.expiresAt) return sheetsTokenCache.token;
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };
  const b64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const b64Payload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signatureInput = `${b64Header}.${b64Payload}`;
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signatureInput);
  sign.end();
  let formattedKey = privateKey.replace(/\\n/g, '\n');
  if (formattedKey.startsWith('"') && formattedKey.endsWith('"')) formattedKey = formattedKey.slice(1, -1);
  const signature = sign.sign(formattedKey, 'base64url');
  const jwt = `${signatureInput}.${signature}`;
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  });
  const data = await res.json();
  if (!res.ok) throw new Error('Failed Google Sheets Auth');
  sheetsTokenCache = { token: data.access_token, expiresAt: Date.now() + (data.expires_in - 300) * 1000 };
  return sheetsTokenCache.token;
}

async function pushToGoogleSheets(body: any, cleanPhone: string, otpStatus: string, zoomJoinUrl: string, zoomSyncStatus: string) {
  try {
    const sheetId = process.env.GOOGLE_SHEET_ID;
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const key = process.env.GOOGLE_PRIVATE_KEY;
    if (!sheetId || !email || !key) return;

    const token = await getGoogleSheetsToken(email, key);
    const row = [
      new Date().toISOString(),
      body.fullName || '',
      body.email || '',
      cleanPhone,
      body.city || '',
      body.sourceName || 'ExcelToAI_Masterclass',
      body.typeFilter || 'PPC_Masterclass',
      body.utm_source || '',
      body.utm_medium || '',
      body.utm_campaign || '',
      body.utm_term || '',
      body.gclid || '',
      body.behaviour?.time_on_page_seconds || '',
      body.behaviour?.max_scroll_pct || '',
      body.behaviour?.form_completion_seconds || '',
      body.referrer || '',
      otpStatus,            // Column Q
      zoomJoinUrl,          // Column R
      zoomSyncStatus,       // Column S
      body.referralSource || '' // Column T — "How did you hear about this masterclass?"
    ];

    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/NextJS!A:T:append?valueInputOption=USER_ENTERED`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: [row] })
    });
  } catch (err) {
    console.error('[Sheets] Error:', err);
  }
}

async function sendWhatsAppOtp(phone: string, otp: string): Promise<boolean> {
  const waAccessToken = process.env.META_WA_ACCESS_TOKEN;
  const waPhoneId = process.env.META_WA_PHONE_NUMBER_ID;
  if (!waAccessToken || !waPhoneId) return false;

  try {
    const waRes = await fetch(`https://graph.facebook.com/v17.0/${waPhoneId}/messages`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${waAccessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: `91${phone}`,
        type: 'template',
        template: {
          name: 'form_otp',
          language: { code: 'en_US' },
          components: [{ type: 'body', parameters: [{ type: 'text', text: otp }] }],
        },
      }),
    });
    return waRes.ok;
  } catch (err) {
    console.error('[WhatsApp] Error:', err);
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, email, phone, city, typeFilter } = body;

    if (!fullName || !email || !phone) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Generate OTP & HMAC
    const otp = String(crypto.randomInt(1000, 9999));
    const expiry = Date.now() + 10 * 60 * 1000;
    const hmacSecret = requireEnv('OTP_HMAC_SECRET');
    if (hmacSecret.length < 32) throw new Error('OTP_HMAC_SECRET must be at least 32 chars');
    const hmac = crypto.createHmac('sha256', hmacSecret).update(`${phone}:${otp}:${expiry}`).digest('hex');

    const nameParts = (fullName || '').split(' ').filter(Boolean);
    const firstName = nameParts[0] || fullName || '';
    const lastName = nameParts.slice(1).join(' ');

    // 2. Run WhatsApp + Zoom registration in parallel
    const [waSuccess, zoomResult]: [boolean, ZoomRegistrationResult] = await Promise.all([
      sendWhatsAppOtp(phone, otp),
      registerWebinarParticipant({
        email,
        firstName,
        lastName,
        phone,
        city,
      }),
    ]);

    const otpStatus = waSuccess ? 'Unverified' : 'Fallback';
    const zoomJoinUrl = zoomResult.ok ? zoomResult.joinUrl : '';
    const zoomSyncStatus = zoomResult.ok ? 'Success' : 'Failed';
    const zoomSyncError = zoomResult.ok
      ? ''
      : `${new Date().toISOString()} | ${zoomResult.error}`;

    if (!zoomResult.ok) {
      console.error('[Zoom] Sync failed:', zoomResult.error);
    }

    // 3. Build OTP token (now includes Zoom URL so /verify can return it to client)
    const token = Buffer.from(JSON.stringify({
      expiry, hmac, fullName, email, phone, city, typeFilter,
      zoomJoinUrl,
    })).toString('base64');

    // 4. LeadSquared submission
    // TEMP: dedicated Zoom + Referral fields are unavailable in LSQ (custom-field limit
    // reached on the account). We bundle everything into a single configurable notes
    // field (LSQ_NOTES_FIELD_NAME, default mx_Notes). When dedicated fields are created
    // later, switch this back to individual attributes.
    const notesLines: string[] = [
      `Zoom Status: ${zoomSyncStatus}`,
      zoomJoinUrl ? `Zoom Join URL: ${zoomJoinUrl}` : null,
      zoomSyncError ? `Zoom Error: ${zoomSyncError}` : null,
      body.referralSource ? `Referral Source: ${body.referralSource}` : null,
      `Registered: ${new Date().toISOString()}`,
    ].filter((line): line is string => line !== null);
    const notesBlob = notesLines.join('\n');
    const notesFieldName = process.env.LSQ_NOTES_FIELD_NAME || 'mx_Notes';

    const lsqPayload = [
      { Attribute: 'FirstName', Value: firstName },
      { Attribute: 'LastName', Value: lastName },
      { Attribute: 'EmailAddress', Value: email },
      { Attribute: 'Phone', Value: phone },
      { Attribute: 'mx_City_name', Value: city },
      { Attribute: 'Source', Value: typeFilter || 'PPC_Masterclass' },
      { Attribute: 'mx_GCLID', Value: body.gclid || '' },
      { Attribute: 'mx_OTP_Status', Value: otpStatus },
      { Attribute: notesFieldName, Value: notesBlob },
    ];

    // 5. Push to LSQ + Sheets + Meta CAPI in parallel (all fire-and-forget; failures logged but don't block)
    const { ip, userAgent } = extractClientContext(req);
    const leadEventId: string = (body.eventId && typeof body.eventId === 'string')
      ? body.eventId
      : crypto.randomUUID();

    await Promise.allSettled([
      fetch(lsqCaptureUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lsqPayload),
      }).then(res => {
        if (!res.ok) console.error('[LSQ] Capture failed:', res.status);
      }),
      pushToGoogleSheets(body, phone, otpStatus, zoomJoinUrl, zoomSyncStatus),
      sendMetaCapiEvent({
        eventName: 'Lead',
        eventId: leadEventId,
        eventSourceUrl: body.landingPageUrl,
        userData: {
          email,
          phone,
          firstName,
          lastName,
          city,
          country: 'in',
          clientIp: ip,
          clientUserAgent: userAgent,
          fbp: body.fbp,
          fbc: body.fbc,
          externalId: email,
        },
        customData: {
          source: typeFilter || 'PPC_Masterclass',
          gclid: body.gclid || undefined,
        },
      }).then(result => {
        if (!result.ok) console.error('[Meta CAPI Lead] Failed:', result.error);
      }),
    ]);

    return NextResponse.json({
      success: true,
      token,
      fallback: !waSuccess,
      zoomJoinUrl,
      zoomSynced: zoomResult.ok,
      leadEventId,
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
