import { RateLimitConfig } from './types';

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
  
  // If no entry or window has expired, reset
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
  
  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      resetTime: entry.resetTime,
      remaining: 0
    };
  }
  
  // Increment count
  entry.count++;
  rateLimitStore.set(key, entry);
  
  return {
    allowed: true,
    resetTime: entry.resetTime,
    remaining: config.maxRequests - entry.count
  };
}

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now >= entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean every minute
