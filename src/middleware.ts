import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { debugLog } from '@/lib/debug';

export function middleware(request: NextRequest) {
  debugLog('REQUEST', `${request.method} ${request.nextUrl.pathname}`, {
    method: request.method,
    path: request.nextUrl.pathname,
    query: Object.fromEntries(request.nextUrl.searchParams),
    headers: {
      'user-agent': request.headers.get('user-agent'),
      'content-type': request.headers.get('content-type'),
    },
  });

  // Note: Response logging is done in individual API route handlers
  // NextResponse.next() returns immediately (before route handlers execute)
  // so we can't log actual response status codes here
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all API routes
    '/api/:path*',
    // Match all pages except static files and images
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
