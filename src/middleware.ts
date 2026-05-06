import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl;

  const isAdminRoute = url.pathname.startsWith('/admin') && !url.pathname.startsWith('/admin/login');
  const isSettingsApi = url.pathname.startsWith('/api/settings');
  const isGetRegistrationsApi = url.pathname.startsWith('/api/register') && req.method === 'GET';

  if (isAdminRoute || isSettingsApi || isGetRegistrationsApi) {
    const sessionCookie = req.cookies.get('admin_session');

    if (!sessionCookie || sessionCookie.value !== 'authenticated') {
      if (isSettingsApi || isGetRegistrationsApi) {
        return new NextResponse('Unauthorized', { status: 401 });
      }
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/settings/:path*', '/api/register'],
};
