import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { signAdminSession } from '@/lib/auth';
import { assertSameOrigin } from '@/lib/security';

type AdminCredential = { user: string; password: string };

// Load the full list of admin credentials. Supports two formats:
//   1. ADMIN_CREDENTIALS — JSON array: [{"user":"a","password":"b"}, ...]
//   2. Legacy ADMIN_USER + ADMIN_PASSWORD — single credential
// Both may coexist; entries are merged and de-duplicated by user.
function loadAdminCredentials(): AdminCredential[] {
  const list: AdminCredential[] = [];
  const raw = process.env.ADMIN_CREDENTIALS;
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (item && typeof item.user === 'string' && typeof item.password === 'string') {
            list.push({ user: item.user, password: item.password });
          }
        }
      }
    } catch (err) {
      console.error('[Login] ADMIN_CREDENTIALS is not valid JSON:', err);
    }
  }
  const legacyUser = process.env.ADMIN_USER;
  const legacyPass = process.env.ADMIN_PASSWORD;
  if (legacyUser && legacyPass && !list.some((c) => c.user === legacyUser)) {
    list.push({ user: legacyUser, password: legacyPass });
  }
  return list;
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

    const credentials = loadAdminCredentials();
    if (credentials.length === 0) {
      throw new Error('No admin credentials configured (set ADMIN_CREDENTIALS or ADMIN_USER/ADMIN_PASSWORD)');
    }

    // Check every credential without short-circuiting to keep timing uniform.
    let matched: AdminCredential | null = null;
    for (const cred of credentials) {
      const userOk = timingSafeEqualStr(username, cred.user);
      const passOk = timingSafeEqualStr(password, cred.password);
      if (userOk && passOk) matched = cred;
    }

    if (!matched) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    const ttlSeconds = 60 * 60 * 24;
    const token = await signAdminSession(matched.user, ttlSeconds);

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
