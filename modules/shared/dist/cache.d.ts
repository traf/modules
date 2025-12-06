import NodeCache from 'node-cache';
import { CacheConfig } from './types';
export declare function getCache(module: string, config: CacheConfig): NodeCache;
export declare function getCachedValue<T>(cache: NodeCache, key: string): T | undefined;
export declare function setCachedValue<T>(cache: NodeCache, key: string, value: T): void;
