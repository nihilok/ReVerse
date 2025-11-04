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
     * @param status - HTTP status code (100-599)
     */
    logResponse: (status: number) => {
      // Validate status code is in valid HTTP range
      if (status < 100 || status > 599) {
        throw new Error(`Invalid HTTP status code: ${status}`);
      }
      
      const duration = Date.now() - startTime;
      debugLog('RESPONSE', `${method} ${path} - ${duration}ms`, {
        duration,
        status,
      });
    },
  };
}
