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
  // Future modules:
  // price: {
  //   name: 'price',
  //   rateLimit: {
  //     windowMs: 60 * 1000,
  //     maxRequests: 100
  //   },
  //   cache: {
  //     ttl: 30, // 30 seconds - prices change frequently
  //     enabled: true
  //   }
  // }
};
