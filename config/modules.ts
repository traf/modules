import { ModuleConfig } from '../lib/shared/types';

export const moduleConfigs: Record<string, ModuleConfig> = {
  ens: {
    name: 'ens',
    rateLimit: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 60 // 60 requests per minute
    },
    cache: {
      ttl: 300, // 5 minutes - ENS records don't change often
      enabled: true
    }
  },
  price: {
    name: 'price',
    rateLimit: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 100 // 100 requests per minute
    },
    cache: {
      ttl: 10,
      enabled: true
    }
  }
};
