import { NextRequest, NextResponse } from 'next/server';
import { ensService, createApiRoute } from '@modules/crypto';

const apiRoute = createApiRoute(
  {
    cacheName: 'ens',
    rateLimit: { windowMs: 60 * 1000, maxRequests: 60 },
    cache: { ttl: 300, enabled: true }
  },
  async (cacheKey) => ensService.lookup(cacheKey.replace('lookup:', ''))
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ input: string }> }
) {
  const { input } = await params;
  
  if (!input) {
    return NextResponse.json(
      { error: 'Input parameter is required' },
      { status: 400 }
    );
  }

  const result = await apiRoute(request, `lookup:${input.toLowerCase()}`);
  
  if (result.error) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status, headers: result.headers }
    );
  }

  return NextResponse.json(result.data, { headers: result.headers });
}
