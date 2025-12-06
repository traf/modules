import NodeCache from 'node-cache';
import { CacheConfig } from './types';

const caches = new Map<string, NodeCache>();

export function getCache(module: string, config: CacheConfig): NodeCache {
  if (!caches.has(module)) {
    caches.set(module, new NodeCache({ 
      stdTTL: config.ttl,
      checkperiod: Math.max(config.ttl * 0.2, 60)
    }));
  }
  return caches.get(module)!;
}