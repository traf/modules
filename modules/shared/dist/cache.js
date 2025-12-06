"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCache = getCache;
exports.getCachedValue = getCachedValue;
exports.setCachedValue = setCachedValue;
const node_cache_1 = __importDefault(require("node-cache"));
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
function getCachedValue(cache, key) {
    return cache.get(key);
}
function setCachedValue(cache, key, value) {
    cache.set(key, value);
}
