import { NextRequest, NextResponse } from 'next/server';
import { fetchCryptoPrice, createApiRoute } from '@modules/crypto';

const apiRoute = createApiRoute(
  {
    cacheName: 'price',
    rateLimit: { windowMs: 60 * 1000, maxRequests: 50 },
    cache: { ttl: 30, enabled: true }
  },
  async (cacheKey) => {
    const symbol = cacheKey.replace('lookup:', '');
    return await fetchCryptoPrice(symbol);
  }
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;

  if (!symbol) {
    return NextResponse.json(
      { error: 'Symbol parameter is required' },
      { status: 400 }
    );
  }

  const cacheKey = `lookup:${symbol.toLowerCase()}`;
  const result = await apiRoute(request, cacheKey);

  return NextResponse.json(
    result.error ? { error: result.error } : result.data,
    { status: result.status, headers: result.headers }
  );
}
