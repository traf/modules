import { NextRequest, NextResponse } from 'next/server';
import { ensService } from '@modules/crypto';
import { checkRateLimit, getCache, getClientIP } from '@modules/shared';

const config = {
  rateLimit: { windowMs: 60 * 1000, maxRequests: 60 },
  cache: { ttl: 300, enabled: true }
};
const cache = getCache('ens', config.cache);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ input: string }> }
) {
  const clientIP = getClientIP(request);
  
  // Rate limiting
  const rateLimitResult = checkRateLimit(clientIP, config.rateLimit);
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': config.rateLimit.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(rateLimitResult.resetTime!).toISOString()
        }
      }
    );
  }

  const { input } = await params;
  
  if (!input) {
    return NextResponse.json(
      { error: 'Input parameter is required' },
      { status: 400 }
    );
  }

  // Check cache first
  const cacheKey = `lookup:${input.toLowerCase()}`;
  if (config.cache.enabled) {
    const cached = cache.get(cacheKey);
    if (cached) {
      return NextResponse.json(
        cached,
        {
          headers: {
            'X-Cache': 'HIT',
            'X-RateLimit-Limit': config.rateLimit.maxRequests.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining?.toString() || '0',
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime!).toISOString()
          }
        }
      );
    }
  }

  try {
    const result = await ensService.lookup(input);
    
    if (!result) {
      return NextResponse.json(
        { error: 'Invalid input or no data found' },
        { 
          status: 404,
          headers: {
            'X-RateLimit-Limit': config.rateLimit.maxRequests.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining?.toString() || '0',
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime!).toISOString()
          }
        }
      );
    }

    // Cache the result
    if (config.cache.enabled) {
      cache.set(cacheKey, result);
    }

    return NextResponse.json(
      result,
      {
        headers: {
          'X-Cache': 'MISS',
          'X-RateLimit-Limit': config.rateLimit.maxRequests.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining?.toString() || '0',
          'X-RateLimit-Reset': new Date(rateLimitResult.resetTime!).toISOString()
        }
      }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { 
        status: 500,
        headers: {
          'X-RateLimit-Limit': config.rateLimit.maxRequests.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining?.toString() || '0',
          'X-RateLimit-Reset': new Date(rateLimitResult.resetTime!).toISOString()
        }
      }
    );
  }
}
