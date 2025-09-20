import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '../../../lib/shared/rate-limit';
import { getCache, getCachedValue, setCachedValue } from '../../../lib/shared/cache';
import { moduleConfigs } from '../../../config/modules';

// Cache for symbol-to-coinID mapping to avoid repeated searches
const symbolCache = new Map<string, { id: string; name: string; timestamp: number }>();
const SYMBOL_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

async function fetchCryptoPrice(symbol: string) {
  try {
    const upperSymbol = symbol.toUpperCase();
    const lowerSymbol = symbol.toLowerCase();
    
    // Check if we have a cached coin ID for this symbol
    const cached = symbolCache.get(lowerSymbol);
    let coinId: string;
    let coinName: string;
    
    if (cached && (Date.now() - cached.timestamp) < SYMBOL_CACHE_TTL) {
      coinId = cached.id;
      coinName = cached.name;
    } else {
      // Search for the coin by symbol (only when not cached)
      const searchResponse = await fetch(
        `https://api.coingecko.com/api/v3/search?query=${symbol}`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; PriceBot/1.0)'
          },
          signal: AbortSignal.timeout(5000) // 5 second timeout
        }
      );
      
      if (!searchResponse.ok) {
        throw new Error('Search API error');
      }
      
      const searchData = await searchResponse.json();
      const coin = searchData.coins?.find((c: { symbol?: string; id: string; name: string }) => 
        c.symbol?.toLowerCase() === lowerSymbol
      );
      
      if (!coin) {
        throw new Error('Cryptocurrency not found');
      }
      
      coinId = coin.id;
      coinName = coin.name;
      
      // Cache the symbol-to-ID mapping
      symbolCache.set(lowerSymbol, { 
        id: coinId, 
        name: coinName, 
        timestamp: Date.now() 
      });
    }
    
    // Get the price using the coin ID
    const priceResponse = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; PriceBot/1.0)'
        },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      }
    );
    
    if (!priceResponse.ok) {
      throw new Error('Price API error');
    }
    
    const priceData = await priceResponse.json();
    const coinPrice = priceData[coinId];
    
    if (!coinPrice) {
      throw new Error('Price data not available');
    }
    
    return {
      name: coinName,
      ticker: upperSymbol,
      price: coinPrice.usd < 1 ? coinPrice.usd.toString() : coinPrice.usd.toFixed(2)
    };
  } catch (error) {
    throw new Error(`Failed to fetch crypto price: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

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

    // Fetch crypto price data
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
