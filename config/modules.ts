import { ModuleConfig } from '@modules/shared';

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
      maxRequests: 50 // Reduced from 100 to protect API key
    },
    cache: {
      ttl: 30, // Increased cache time to reduce API calls
      enabled: true
    }
  }
};
