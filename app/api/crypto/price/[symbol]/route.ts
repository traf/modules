import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getCache, getClientIP } from '@modules/crypto/src/utils';
import { fetchCryptoPrice } from '@modules/crypto';

const config = {
  rateLimit: { windowMs: 60 * 1000, maxRequests: 50 },
  cache: { ttl: 30, enabled: true }
};
const cache = getCache('price', config.cache);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
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

  try {
    const { symbol } = await params;

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol parameter is required' },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = `lookup:${symbol.toLowerCase()}`;
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

    let result;
    try {
      result = await fetchCryptoPrice(symbol);
    } catch {
      return NextResponse.json(
        {
          error: 'Cryptocurrency not found',
          message: `Unable to find price data for symbol: ${symbol}. Only cryptocurrency symbols are supported.`
        },
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
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
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
