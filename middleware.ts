import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files, Next.js internals, and favicon
  // BUT allow /icons routes to go through our API
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    (pathname.includes('.') && !pathname.startsWith('/icons/')) ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Root path - serve the main page
  if (pathname === '/') {
    return NextResponse.next();
  }

  // For module paths like /ens/something, rewrite to app route
  const pathSegments = pathname.split('/').filter(Boolean);
  
  if (pathSegments.length >= 2) {
    const [module, ...rest] = pathSegments;
    
    // Rewrite module routes to their app directory equivalents
    // e.g., /ens/vitalik.eth -> /ens/vitalik.eth (handled by app/ens/[input]/route.ts)
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
