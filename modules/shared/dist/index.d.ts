export * from './cache';
export * from './rate-limit';
export * from './types';
export * from './colors';
export declare function getClientIP(request: {
    headers: {
        get: (name: string) => string | null;
    };
}): string;
