import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { addRegistration } from '@/lib/db';
import { sendMetaCapiEvent, extractClientContext } from '@/lib/meta';

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

async function updateLeadSquaredToVerified(phone: string) {
  try {
    const access = requireEnv('LSQ_ACCESS');
    const secret = requireEnv('LSQ_SECRET');
    const searchUrl = `https://api-in21.leadsquared.com/v2/LeadManagement.svc/RetrieveLeadByPhoneNumber?accessKey=${access}&secretKey=${secret}&phone=${encodeURIComponent(phone)}`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (searchRes.ok && searchData && searchData.length > 0) {
      const prospectId = searchData[0].ProspectID;
      const updateUrl = `https://api-in21.leadsquared.com/v2/LeadManagement.svc/Lead.Update?accessKey=${access}&secretKey=${secret}&leadId=${prospectId}`;
      await fetch(updateUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([{ Attribute: 'mx_OTP_Status', Value: 'Verified' }])
      });
    }
  } catch (err) {
    console.error('[Verify LSQ] Error:', err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, otp_entered, eventId: incomingEventId, fbp, fbc, landingPageUrl } = body;

    if (!token || !otp_entered) {
      return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
    }

    const hmacSecret = requireEnv('OTP_HMAC_SECRET');
    if (hmacSecret.length < 32) throw new Error('OTP_HMAC_SECRET must be at least 32 chars');
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
    const { expiry, hmac, fullName, email, phone, city, zoomJoinUrl } = decoded;

    // 1. Check Expiry
    if (Date.now() > expiry) {
      return NextResponse.json({ success: false, error: 'OTP expired' }, { status: 400 });
    }

    // 2. Validate HMAC
    const expectedHmac = crypto.createHmac('sha256', hmacSecret).update(`${phone}:${otp_entered}:${expiry}`).digest('hex');
    if (hmac !== expectedHmac) {
      return NextResponse.json({ success: false, error: 'Invalid OTP' }, { status: 400 });
    }

    // 3. Update External Systems
    await updateLeadSquaredToVerified(phone);

    // 4. Save to Local DB (for Admin Portal)
    await addRegistration({
      fullName,
      email,
      phone,
      status: decoded.status || 'Verified',
      city
    });

    // 5. Fire Meta CAPI CompleteRegistration (deduped against browser pixel via eventId)
    const { ip, userAgent } = extractClientContext(req);
    const nameParts = (fullName || '').split(' ').filter(Boolean);
    const firstName = nameParts[0] || fullName || '';
    const lastName = nameParts.slice(1).join(' ');
    const completeEventId: string = (typeof incomingEventId === 'string' && incomingEventId)
      ? incomingEventId
      : crypto.randomUUID();

    // Awaited (not fire-and-forget) — on Vercel serverless, the function
    // instance terminates immediately after the response is returned, which
    // can kill an unawaited Promise before the CAPI fetch completes.
    try {
      const result = await sendMetaCapiEvent({
        eventName: 'CompleteRegistration',
        eventId: completeEventId,
        eventSourceUrl: landingPageUrl,
        userData: {
          email,
          phone,
          firstName,
          lastName,
          city,
          country: 'in',
          clientIp: ip,
          clientUserAgent: userAgent,
          fbp,
          fbc,
          externalId: email,
        },
        customData: {
          status: 'Verified',
        },
      });
      if (!result.ok) console.error('[Meta CAPI CompleteRegistration] Failed:', result.error);
    } catch (err) {
      console.error('[Meta CAPI CompleteRegistration] Threw:', err);
    }

    return NextResponse.json({
      success: true,
      verified: true,
      zoomJoinUrl: zoomJoinUrl || '',
      completeEventId,
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
