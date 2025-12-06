import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@modules/shared';
import { getCache, getCachedValue, setCachedValue } from '@modules/shared';
import { moduleConfigs } from '@config/modules';

import { fetchCryptoPrice } from '@modules/crypto';

const MODULE_NAME = 'price';
const config = moduleConfigs[MODULE_NAME];
const cache = getCache(MODULE_NAME, config.cache);

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const remoteAddr = request.headers.get('remote-addr');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (remoteAddr) {
    return remoteAddr;
  }
  return 'unknown';
}

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
      const cached = getCachedValue(cache, cacheKey);
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
      setCachedValue(cache, cacheKey, result);
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
    console.error('Price API error:', error);
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
