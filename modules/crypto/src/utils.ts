import NodeCache from 'node-cache';

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export interface CacheConfig {
  ttl: number;
  enabled: boolean;
}

// Cache utilities
const caches = new Map<string, NodeCache>();

export function getCache(module: string, config: CacheConfig): NodeCache {
  if (!caches.has(module)) {
    caches.set(module, new NodeCache({ 
      stdTTL: config.ttl,
      checkperiod: Math.max(config.ttl * 0.2, 60)
    }));
  }
  return caches.get(module)!;
}

// Rate limiting utilities
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; resetTime?: number; remaining?: number } {
  const now = Date.now();
  const key = identifier;
  
  const entry = rateLimitStore.get(key);
  
  if (!entry || now >= entry.resetTime) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + config.windowMs
    };
    rateLimitStore.set(key, newEntry);
    
    return {
      allowed: true,
      resetTime: newEntry.resetTime,
      remaining: config.maxRequests - 1
    };
  }
  
  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      resetTime: entry.resetTime,
      remaining: 0
    };
  }
  
  entry.count++;
  rateLimitStore.set(key, entry);
  
  return {
    allowed: true,
    resetTime: entry.resetTime,
    remaining: config.maxRequests - entry.count
  };
}

// Cleanup expired entries
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now >= entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000);

// Utility function used by API routes
export function getClientIP(request: { headers: { get: (name: string) => string | null } }): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const remoteAddr = request.headers.get('remote-addr');
  
  if (forwarded) return forwarded.split(',')[0].trim();
  if (realIP) return realIP;
  if (remoteAddr) return remoteAddr;
  return 'unknown';
}