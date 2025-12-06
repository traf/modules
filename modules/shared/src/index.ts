export * from './cache';
export * from './rate-limit';
export * from './types';
export * from './colors';

// Utility function used by multiple API routes
export function getClientIP(request: { headers: { get: (name: string) => string | null } }): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const remoteAddr = request.headers.get('remote-addr');
  
  if (forwarded) return forwarded.split(',')[0].trim();
  if (realIP) return realIP;
  if (remoteAddr) return remoteAddr;
  return 'unknown';
}