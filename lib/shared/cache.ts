import NodeCache from 'node-cache';
import { CacheConfig } from './types';

const caches = new Map<string, NodeCache>();

export function getCache(module: string, config: CacheConfig): NodeCache {
  if (!caches.has(module)) {
    caches.set(module, new NodeCache({ 
      stdTTL: config.ttl,
      checkperiod: Math.max(config.ttl * 0.2, 60) // Check expired keys every 20% of TTL or 60s min
    }));
  }
  return caches.get(module)!;
}

export function getCachedValue<T>(
  cache: NodeCache,
  key: string
): T | undefined {
  return cache.get<T>(key);
}

export function setCachedValue<T>(
  cache: NodeCache,
  key: string,
  value: T
): void {
  cache.set(key, value);
}
