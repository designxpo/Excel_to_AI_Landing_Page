import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { listAdminUsers, getAdminByEmail, createAdminUser } from '@/lib/db';
import { verifyAdminSession } from '@/lib/auth';
import { assertSameOrigin } from '@/lib/security';

async function requireAdmin(): Promise<{ ok: false } | { ok: true; sub: string }> {
  const token = (await cookies()).get('admin_session')?.value;
  const session = await verifyAdminSession(token);
  if (!session) return { ok: false };
  return { ok: true, sub: session.sub };
}

function generatePassword(length = 20): string {
  // base64url-ish, stripped of confusable chars
  return crypto
    .randomBytes(length * 2)
    .toString('base64')
    .replace(/[+/=]/g, '')
    .replace(/[O0Il1]/g, '')
    .slice(0, length);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return new NextResponse('Unauthorized', { status: 401 });
  try {
    return NextResponse.json(await listAdminUsers());
  } catch (err) {
    console.error('[Team GET] error:', err);
    return NextResponse.json({ error: 'Failed to load admins' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const origin = assertSameOrigin(request);
  if (!origin.ok) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const auth = await requireAdmin();
  if (!auth.ok) return new NextResponse('Unauthorized', { status: 401 });

  try {
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const name = typeof body.name === 'string' ? body.name.trim() : '';

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const existing = await getAdminByEmail(email);
    if (existing) {
      return NextResponse.json({ error: 'An admin with this email already exists' }, { status: 409 });
    }

    const password = generatePassword(20);
    const passwordHash = await bcrypt.hash(password, 10);
    const created = await createAdminUser({
      email,
      name: name || null,
      passwordHash,
      createdBy: auth.sub,
    });

    // Password is returned ONCE here. We never store the plaintext.
    return NextResponse.json({ admin: created, password });
  } catch (err) {
    console.error('[Team POST] error:', err);
    return NextResponse.json({ error: 'Failed to create admin' }, { status: 500 });
  }
}
