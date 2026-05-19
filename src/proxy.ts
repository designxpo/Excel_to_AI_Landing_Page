import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAdminSession } from '@/lib/auth';

export async function proxy(req: NextRequest) {
  const url = req.nextUrl;

  const isAdminRoute = url.pathname.startsWith('/admin') && !url.pathname.startsWith('/admin/login');
  const isSettingsApi = url.pathname.startsWith('/api/settings');
  const isGetRegistrationsApi = url.pathname.startsWith('/api/register') && req.method === 'GET';
  const isFaqsWrite = url.pathname.startsWith('/api/faqs') && req.method !== 'GET';

  if (!(isAdminRoute || isSettingsApi || isGetRegistrationsApi || isFaqsWrite)) {
    return NextResponse.next();
  }

  const token = req.cookies.get('admin_session')?.value;
  const session = await verifyAdminSession(token);

  if (!session) {
    if (isSettingsApi || isGetRegistrationsApi || isFaqsWrite) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/settings/:path*', '/api/register', '/api/faqs'],
};
