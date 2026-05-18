import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const LSQ_ACCESS = process.env.LSQ_ACCESS || 'u$rfdb83f05f0b66fc1db816ac810a2e0d3';
const LSQ_SECRET = process.env.LSQ_SECRET || '5d1e931f0b5e3bbbdf4bfa24a3486e133c46cbb4';
const CRM_WEBHOOK_URL = `https://api-in21.leadsquared.com/v2/LeadManagement.svc/Lead.Capture?accessKey=${LSQ_ACCESS}&secretKey=${LSQ_SECRET}`;

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

async function pushToGoogleSheets(body: any, cleanPhone: string, otpStatus: string) {
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
      otpStatus // Column Q
    ];
    
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/NextJS!A:Q:append?valueInputOption=USER_ENTERED`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: [row] })
    });
  } catch (err) {
    console.error('[Sheets] Error:', err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, email, phone, city, typeFilter } = body;
    
    // 1. Generate OTP & Token
    const otp = String(crypto.randomInt(1000, 9999));
    const expiry = Date.now() + 10 * 60 * 1000;
    const hmacSecret = process.env.OTP_HMAC_SECRET || 'secret';
    const hmac = crypto.createHmac('sha256', hmacSecret).update(`${phone}:${otp}:${expiry}`).digest('hex');
    
    const token = Buffer.from(JSON.stringify({ 
      expiry, hmac, fullName, email, phone, city, typeFilter 
    })).toString('base64');

    // 2. WhatsApp OTP
    let waSuccess = false;
    const waAccessToken = process.env.META_WA_ACCESS_TOKEN;
    const waPhoneId = process.env.META_WA_PHONE_NUMBER_ID;

    if (waAccessToken && waPhoneId) {
      const waRes = await fetch(`https://graph.facebook.com/v17.0/${waPhoneId}/messages`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${waAccessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: `91${phone}`, // Hardcoded India for now as per previous context
          type: 'template',
          template: {
            name: 'form_otp',
            language: { code: 'en_US' },
            components: [{ type: 'body', parameters: [{ type: 'text', text: otp }] }],
          },
        }),
      });
      waSuccess = waRes.ok;
    }

    const otpStatus = waSuccess ? 'Unverified' : 'Fallback';

    // 3. LeadSquared Submission
    const nameParts = (fullName || '').split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    const lsqPayload = [
      { Attribute: 'FirstName', Value: firstName },
      { Attribute: 'LastName', Value: lastName },
      { Attribute: 'EmailAddress', Value: email },
      { Attribute: 'Phone', Value: phone },
      { Attribute: 'mx_City_name', Value: city },
      { Attribute: 'Source', Value: typeFilter || 'PPC_Masterclass' },
      { Attribute: 'mx_GCLID', Value: body.gclid || '' },
      { Attribute: 'mx_OTP_Status', Value: otpStatus }
    ];

    await fetch(CRM_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lsqPayload)
    });

    // 4. Google Sheets
    await pushToGoogleSheets(body, phone, otpStatus);

    return NextResponse.json({ success: true, token, fallback: !waSuccess });

  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
