import { auth } from './auth';
import { NextResponse } from 'next/server';

export const proxy = auth((req) => {
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;
  const url = req.nextUrl.clone();
  const accessToken = req.cookies.get(process.env.NODE_ENV === 'production' ? '__Secure-authjs.session-token' : 'authjs.session-token')?.value;

  if (isLoggedIn && !accessToken) {
    const response = NextResponse.next();

    response.cookies.delete('authjs.session-token');
    response.cookies.delete('__Secure-authjs.session-token');
    response.cookies.delete('next-auth.session-token');
    response.cookies.delete('__Secure-next-auth.session-token');

    return response;
  }

  if (url.pathname.startsWith('/admin') && role !== 'ADMIN' && role !== 'SUPERUSER') {
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login|assets).*)'],
};