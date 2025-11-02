/**
 * Debug logging utility
 * Controlled by DEBUG environment variable
 */

const DEBUG = process.env.DEBUG === 'true';

export function debugLog(category: string, message: string, data?: unknown) {
  if (!DEBUG) return;
  
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${category}] ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
}

export function debugError(category: string, message: string, error: unknown) {
  if (!DEBUG) return;
  
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] [${category}] ERROR: ${message}`);
  console.error(error);
}

export const isDebugEnabled = () => DEBUG;
