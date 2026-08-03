interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup expired entries every minute
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now >= entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000);

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  // Requests that fan out to multiple upstream calls should cost more than one
  cost?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

export function checkRateLimit(identifier: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const cost = config.cost ?? 1;
  const entry = rateLimitStore.get(identifier);

  if (!entry || now >= entry.resetTime) {
    const newEntry: RateLimitEntry = {
      count: cost,
      resetTime: now + config.windowMs
    };
    rateLimitStore.set(identifier, newEntry);

    return {
      allowed: true,
      remaining: Math.max(config.maxRequests - cost, 0),
      resetTime: newEntry.resetTime
    };
  }

  if (entry.count + cost > config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime
    };
  }

  entry.count += cost;
  rateLimitStore.set(identifier, entry);

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime
  };
}

export function getClientIP(request: { headers: Headers }): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');

  if (cfConnectingIP) return cfConnectingIP;
  if (forwarded) return forwarded.split(',')[0].trim();
  if (realIP) return realIP;
  return 'unknown';
}
