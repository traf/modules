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

// API route wrapper
export interface ApiRouteConfig {
  cacheName: string;
  rateLimit: RateLimitConfig;
  cache: CacheConfig;
}

export function createApiRoute<T>(
  config: ApiRouteConfig,
  handler: (cacheKey: string) => Promise<T | null>
) {
  const cache = getCache(config.cacheName, config.cache);

  return async (request: { headers: { get: (name: string) => string | null } }, cacheKey: string) => {
    const clientIP = getClientIP(request);

    // Rate limiting
    const rateLimitResult = checkRateLimit(clientIP, config.rateLimit);
    const rateLimitHeaders = {
      'X-RateLimit-Limit': config.rateLimit.maxRequests.toString(),
      'X-RateLimit-Remaining': rateLimitResult.remaining?.toString() || '0',
      'X-RateLimit-Reset': new Date(rateLimitResult.resetTime!).toISOString()
    };

    if (!rateLimitResult.allowed) {
      return {
        status: 429,
        error: 'Rate limit exceeded',
        headers: rateLimitHeaders
      };
    }

    // Check cache
    if (config.cache.enabled) {
      const cached = cache.get(cacheKey);
      if (cached) {
        return {
          status: 200,
          data: cached,
          headers: { ...rateLimitHeaders, 'X-Cache': 'HIT' }
        };
      }
    }

    try {
      const result = await handler(cacheKey);

      if (!result) {
        return {
          status: 404,
          error: 'Not found',
          headers: rateLimitHeaders
        };
      }

      // Cache result
      if (config.cache.enabled) {
        cache.set(cacheKey, result);
      }

      return {
        status: 200,
        data: result,
        headers: { ...rateLimitHeaders, 'X-Cache': 'MISS' }
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : 'Internal server error',
        headers: rateLimitHeaders
      };
    }
  };
}