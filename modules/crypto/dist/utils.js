"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCache = getCache;
exports.checkRateLimit = checkRateLimit;
exports.getClientIP = getClientIP;
const node_cache_1 = __importDefault(require("node-cache"));
// Cache utilities
const caches = new Map();
function getCache(module, config) {
    if (!caches.has(module)) {
        caches.set(module, new node_cache_1.default({
            stdTTL: config.ttl,
            checkperiod: Math.max(config.ttl * 0.2, 60)
        }));
    }
    return caches.get(module);
}
const rateLimitStore = new Map();
function checkRateLimit(identifier, config) {
    const now = Date.now();
    const key = identifier;
    const entry = rateLimitStore.get(key);
    if (!entry || now >= entry.resetTime) {
        const newEntry = {
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
function getClientIP(request) {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const remoteAddr = request.headers.get('remote-addr');
    if (forwarded)
        return forwarded.split(',')[0].trim();
    if (realIP)
        return realIP;
    if (remoteAddr)
        return remoteAddr;
    return 'unknown';
}
