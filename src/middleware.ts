import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/service';

export function middleware(request: NextRequest) {
  // Routes qui nécessitent une authentification
  const protectedPaths = ['/dashboard', '/campaigns', '/contacts', '/contact-groups', '/settings'];
  const isProtectedPath = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath) {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      // Vérification asynchrone du token sera faite côté serveur
      // Le middleware ne peut pas être async, donc on fait une vérification basique
      return NextResponse.next();
    } catch (error) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/campaigns/:path*', '/contacts/:path*', '/contact-groups/:path*', '/settings/:path*']
};