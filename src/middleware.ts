import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Allow access to search page and API routes without authentication
  if (pathname.startsWith('/search') || pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Check if user is authenticated via cookie
  const isAuthenticated = request.cookies.get('dashboard-auth')?.value === 'authenticated';

  // If not authenticated and not on login page, redirect to login
  if (!isAuthenticated && !pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If authenticated and on login page, redirect to search
  if (isAuthenticated && pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/search', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

