import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIP } from '@/app/lib/rateLimit';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

const MAX_DOMAINS = 25;
const RATE_LIMIT = 100;
// Upstream latency is usually ~1s but occasionally stalls past 10s, which would
// otherwise take the whole batch down with it
const UPSTREAM_TIMEOUT = 6000;
const CACHE_HEADER = 'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800';

export const maxDuration = 20;

const isValidDomain = (domain: string) => domain.length <= 253 && /^[a-z0-9.-]+$/i.test(domain);

async function fetchStatus(domain: string, apiKey: string) {
  const url = `https://api.fastly.com/domain-management/v1/tools/status?domain=${encodeURIComponent(domain)}`;
  const response = await fetch(url, {
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT),
    headers: {
      'Fastly-Key': apiKey,
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Fastly API error: ${response.status}`);
  }

  return response.json();
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const single = searchParams.get('domain');
    const batch = searchParams.get('domains');

    const domains = (batch ?? single ?? '')
      .split(',')
      .map(domain => domain.trim())
      .filter(Boolean);

    if (domains.length === 0) {
      return NextResponse.json(
        { error: 'Domain parameter is required' },
        { status: 400 }
      );
    }

    if (domains.length > MAX_DOMAINS || !domains.every(isValidDomain)) {
      return NextResponse.json(
        { error: 'Invalid domain format' },
        { status: 400 }
      );
    }

    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(clientIP, {
      windowMs: 60000,
      maxRequests: RATE_LIMIT,
      cost: domains.length
    });

    const headers: Record<string, string> = {
      'Cache-Control': CACHE_HEADER,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'X-RateLimit-Limit': String(RATE_LIMIT),
      'X-RateLimit-Remaining': String(rateLimit.remaining),
      'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString()
    };

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            ...headers,
            'Cache-Control': 'no-store',
            'Retry-After': String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000))
          }
        }
      );
    }

    const apiKey = process.env.FASTLY_API_TOKEN;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }

    let failed = false;

    const entries = await Promise.all(domains.map(async domain => {
      try {
        return [domain, await fetchStatus(domain, apiKey)] as const;
      } catch (error) {
        console.error(`Domain status check failed for ${domain}:`, error);
        failed = true;
        return [domain, { domain, status: 'unknown', zone: domain.split('.').pop() ?? '' }] as const;
      }
    }));

    // Don't let a transient upstream failure sit in the CDN cache for a day
    if (failed) headers['Cache-Control'] = 'public, max-age=60, s-maxage=60';

    if (!batch) {
      return NextResponse.json(entries[0][1], { headers });
    }

    return NextResponse.json({ statuses: Object.fromEntries(entries) }, { headers });
  } catch (error) {
    console.error('Domain status check failed:', error);
    return NextResponse.json(
      { error: 'Domain status check failed' },
      { status: 500 }
    );
  }
}
