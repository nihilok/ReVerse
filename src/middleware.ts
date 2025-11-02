import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { debugLog } from '@/lib/debug';

export function middleware(request: NextRequest) {
  const start = Date.now();
  
  debugLog('REQUEST', `${request.method} ${request.nextUrl.pathname}`, {
    method: request.method,
    path: request.nextUrl.pathname,
    query: Object.fromEntries(request.nextUrl.searchParams),
    headers: {
      'user-agent': request.headers.get('user-agent'),
      'content-type': request.headers.get('content-type'),
    },
  });

  const response = NextResponse.next();
  
  const duration = Date.now() - start;
  debugLog('RESPONSE', `${request.method} ${request.nextUrl.pathname} - ${duration}ms`, {
    duration,
    status: response.status,
  });

  return response;
}

export const config = {
  matcher: [
    // Match all API routes
    '/api/:path*',
    // Match all pages except static files and images
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
