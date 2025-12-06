export interface RateLimitConfig {
    windowMs: number;
    maxRequests: number;
}
export interface CacheConfig {
    ttl: number;
    enabled: boolean;
}
export interface ModuleConfig {
    name: string;
    rateLimit: RateLimitConfig;
    cache: CacheConfig;
}
