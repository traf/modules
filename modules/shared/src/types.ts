export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export interface CacheConfig {
  ttl: number;
  enabled: boolean;
}