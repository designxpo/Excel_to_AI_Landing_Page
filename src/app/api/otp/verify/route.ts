import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { addRegistration } from '@/lib/db';

const LSQ_ACCESS = process.env.LSQ_ACCESS || 'u$rfdb83f05f0b66fc1db816ac810a2e0d3';
const LSQ_SECRET = process.env.LSQ_SECRET || '5d1e931f0b5e3bbbdf4bfa24a3486e133c46cbb4';

async function updateLeadSquaredToVerified(phone: string) {
  try {
    const searchUrl = `https://api-in21.leadsquared.com/v2/LeadManagement.svc/RetrieveLeadByPhoneNumber?accessKey=${LSQ_ACCESS}&secretKey=${LSQ_SECRET}&phone=${encodeURIComponent(phone)}`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (searchRes.ok && searchData && searchData.length > 0) {
      const prospectId = searchData[0].ProspectID;
      const updateUrl = `https://api-in21.leadsquared.com/v2/LeadManagement.svc/Lead.Update?accessKey=${LSQ_ACCESS}&secretKey=${LSQ_SECRET}&leadId=${prospectId}`;
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
    const { token, otp_entered, mobile } = await req.json();

    if (!token || !otp_entered) {
      return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
    }

    const hmacSecret = process.env.OTP_HMAC_SECRET || 'secret';
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
    const { expiry, hmac, fullName, email, phone, city, typeFilter } = decoded;

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
    addRegistration({
      fullName,
      email,
      phone,
      status: decoded.status || 'Verified',
      city
    });

    return NextResponse.json({ success: true, verified: true });

  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
