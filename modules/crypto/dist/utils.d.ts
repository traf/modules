import NodeCache from 'node-cache';
export interface RateLimitConfig {
    windowMs: number;
    maxRequests: number;
}
export interface CacheConfig {
    ttl: number;
    enabled: boolean;
}
export declare function getCache(module: string, config: CacheConfig): NodeCache;
export declare function checkRateLimit(identifier: string, config: RateLimitConfig): {
    allowed: boolean;
    resetTime?: number;
    remaining?: number;
};
export declare function getClientIP(request: {
    headers: {
        get: (name: string) => string | null;
    };
}): string;
