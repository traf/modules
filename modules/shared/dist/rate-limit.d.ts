import { RateLimitConfig } from './types';
export declare function checkRateLimit(identifier: string, config: RateLimitConfig): {
    allowed: boolean;
    resetTime?: number;
    remaining?: number;
};
