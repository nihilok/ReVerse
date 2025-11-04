import { NextRequest } from 'next/server';
import { debugLog } from './debug';

/**
 * Helper for API route response logging
 * Captures request metadata and returns a function to log the response
 */
export function createApiLogger(request: NextRequest) {
  const startTime = Date.now();
  const method = request.method;
  const path = request.nextUrl.pathname;

  return {
    /**
     * Log the response with the given status code
     */
    logResponse: (status: number) => {
      const duration = Date.now() - startTime;
      debugLog('RESPONSE', `${method} ${path} - ${duration}ms`, {
        duration,
        status,
      });
    },
  };
}
