"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRateLimit = checkRateLimit;
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
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
        if (now >= entry.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}, 60000);
