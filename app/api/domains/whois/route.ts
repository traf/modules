import { NextRequest, NextResponse } from 'next/server';
import { whoisDomain } from 'whoiser';
import { checkRateLimit, getClientIP } from '@/app/lib/rateLimit';

type WhoisDataRecord = {
  [key: string]: string | string[] | undefined;
};

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

export async function GET(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(`whois-${clientIP}`, {
      windowMs: 60000, // 1 minute
      maxRequests: 20 // Lower limit for expensive operation
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '20',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
            'Retry-After': String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000))
          }
        }
      );
    }

    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');

    if (!domain || domain.trim().length === 0) {
      return NextResponse.json(
        { error: 'Domain parameter is required' },
        { status: 400 }
      );
    }

    if (domain.length > 253 || !/^[a-z0-9.-]+$/i.test(domain)) {
      return NextResponse.json(
        { error: 'Invalid domain format' },
        { status: 400 }
      );
    }

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('WHOIS lookup timeout')), 10000);
    });

    const whoisPromise = whoisDomain(domain, { follow: 2, timeout: 10000 });
    
    const result = await Promise.race([whoisPromise, timeoutPromise]);
    
    const whoisData = result && typeof result === 'object' ? Object.values(result)[0] : null;

    if (!whoisData) {
      return NextResponse.json(
        { error: 'WHOIS data not available for this domain' },
        { status: 404 }
      );
    }

    const getValue = (key: string): string | undefined => {
      const value = whoisData[key];
      return typeof value === 'string' ? value : Array.isArray(value) ? value[0] : undefined;
    };

    const data = {
      domain,
      registrar: getValue('Registrar') || getValue('registrar'),
      created_date: getValue('Creation Date') || getValue('Created Date') || getValue('created'),
      expiration_date: getValue('Registry Expiry Date') || getValue('Expiration Date') || getValue('Expiry Date') || getValue('expires'),
      updated_date: getValue('Updated Date') || getValue('Last Updated') || getValue('updated'),
      name_servers: extractNameServersFromData(whoisData),
      status: extractStatusFromData(whoisData),
      registrant_organization: getValue('Registrant Organization') || getValue('Registrant') || getValue('org'),
    };

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=3600, must-revalidate',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'X-RateLimit-Limit': '20',
        'X-RateLimit-Remaining': String(rateLimit.remaining),
        'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString()
      },
    });
  } catch (error) {
    console.error('WHOIS lookup failed:', error);
    return NextResponse.json(
      { error: 'WHOIS lookup failed' },
      { status: 500 }
    );
  }
}

function extractNameServersFromData(data: WhoisDataRecord): string[] | undefined {
  const nameServers: string[] = [];
  const excludePatterns = [
    'gtld-servers',
    'root-servers', 
    '.arpa',
    'verisign',
    'icann'
  ];

  const nsFields = ['Name Server', 'nserver', 'Nameserver', 'nameserver'];
  
  for (const field of nsFields) {
    const value = data[field];
    if (value) {
      const values = Array.isArray(value) ? value : [value];
      for (const ns of values) {
        if (typeof ns === 'string') {
          const cleanNs = ns.trim().toLowerCase().split(/\s+/)[0];
          
          const shouldExclude = excludePatterns.some(pattern => cleanNs.includes(pattern)) ||
                               cleanNs.match(/^\d+\.\d+\.\d+/) || // IPv4
                               cleanNs.match(/^[0-9a-f:]+$/) || // IPv6
                               cleanNs.length < 4 ||
                               !cleanNs.includes('.');
          
          if (!shouldExclude) {
            nameServers.push(cleanNs);
          }
        }
      }
    }
  }
  
  return nameServers.length > 0 ? [...new Set(nameServers)] : undefined;
}

function extractStatusFromData(data: WhoisDataRecord): string[] | undefined {
  const statusFields = ['Domain Status', 'status', 'Status'];
  
  for (const field of statusFields) {
    const value = data[field];
    if (value) {
      const values = Array.isArray(value) ? value : [value];
      const statuses = values
        .filter((v: string | string[]): v is string => typeof v === 'string' && v.trim().length > 0)
        .map((v: string) => v.trim());
      
      if (statuses.length > 0) {
        return statuses;
      }
    }
  }
  
  return undefined;
}
