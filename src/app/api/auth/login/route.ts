import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { signAdminSession } from '@/lib/auth';
import { assertSameOrigin } from '@/lib/security';

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

function timingSafeEqualStr(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

export async function POST(request: Request) {
  const origin = assertSameOrigin(request);
  if (!origin.ok) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { username, password } = await request.json();

    if (typeof username !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ success: false, error: 'Bad request' }, { status: 400 });
    }

    const validUser = requireEnv('ADMIN_USER');
    const validPassword = requireEnv('ADMIN_PASSWORD');

    const userOk = timingSafeEqualStr(username, validUser);
    const passOk = timingSafeEqualStr(password, validPassword);

    if (!userOk || !passOk) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    const ttlSeconds = 60 * 60 * 24;
    const token = await signAdminSession(validUser, ttlSeconds);

    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: 'admin_session',
      value: token,
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: ttlSeconds,
    });
    return response;
  } catch (error) {
    console.error('[Login] error:', error);
    return NextResponse.json({ success: false, error: 'Bad request' }, { status: 400 });
  }
}
