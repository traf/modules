import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { checkRateLimit, getClientIP } from '@/app/lib/rateLimit';

const execAsync = promisify(exec);

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

    // Escape domain to prevent command injection
    const escapedDomain = domain.replace(/[^a-z0-9.-]/gi, '');
    
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('WHOIS lookup timeout')), 5000);
    });

    const whoisPromise = execAsync(`whois ${escapedDomain}`);
    
    const { stdout } = await Promise.race([whoisPromise, timeoutPromise]);
    
    const registrar = extractField(stdout, ['Registrar:', 'registrar:']);
    const createdDate = extractField(stdout, ['Creation Date:', 'Created Date:', 'created:']);
    const expirationDate = extractField(stdout, ['Registry Expiry Date:', 'Expiration Date:', 'Expiry Date:', 'expires:']);
    const updatedDate = extractField(stdout, ['Updated Date:', 'Last Updated:', 'updated:']);
    const nameServers = extractNameServers(stdout);
    const status = extractMultipleFields(stdout, ['Domain Status:', 'status:']);
    const registrantOrg = extractField(stdout, ['Registrant Organization:', 'Registrant:', 'org:']);

    const data = {
      domain,
      registrar,
      created_date: createdDate,
      expiration_date: expirationDate,
      updated_date: updatedDate,
      name_servers: nameServers,
      status,
      registrant_organization: registrantOrg,
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

function extractField(text: string, patterns: string[]): string | undefined {
  for (const pattern of patterns) {
    const regex = new RegExp(`${pattern}\\s*(.+)`, 'i');
    const match = text.match(regex);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return undefined;
}

function extractMultipleFields(text: string, patterns: string[]): string[] | undefined {
  const results: string[] = [];
  for (const pattern of patterns) {
    const regex = new RegExp(`${pattern}\\s*(.+)`, 'gi');
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (match[1]) {
        results.push(match[1].trim());
      }
    }
  }
  return results.length > 0 ? results : undefined;
}

function extractNameServers(text: string): string[] | undefined {
  const nameServers: string[] = [];
  const patterns = ['Name Server:', 'nserver:', 'Nameserver:'];
  const excludePatterns = [
    'gtld-servers',
    'root-servers', 
    '.arpa',
    'verisign',
    'icann'
  ];
  
  for (const pattern of patterns) {
    const regex = new RegExp(`${pattern}\\s*(.+)`, 'gi');
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (match[1]) {
        const ns = match[1].trim().toLowerCase();
        // Only take the domain part, stop at space or IP address
        const cleanNs = ns.split(/\s+/)[0];
        
        // Filter out infrastructure servers and invalid entries
        const shouldExclude = excludePatterns.some(pattern => cleanNs.includes(pattern)) ||
                             cleanNs.match(/^\d+\.\d+\.\d+/) || // IPv4
                             cleanNs.match(/^[0-9a-f:]+$/) || // IPv6
                             cleanNs.length < 4 || // Too short
                             !cleanNs.includes('.'); // Must have at least one dot
        
        if (!shouldExclude) {
          nameServers.push(cleanNs);
        }
      }
    }
  }
  
  // If we didn't find any nameservers with the standard patterns, return undefined
  return nameServers.length > 0 ? [...new Set(nameServers)] : undefined;
}
