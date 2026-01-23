import { NextResponse } from 'next/server';
import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;
    const userRole = req.auth?.user?.role;

    // Define protected route patterns
    const isAdminRoute = nextUrl.pathname.startsWith('/admin');
    const isBuyerRoute = nextUrl.pathname.startsWith('/buyer');
    const isAuthRoute = nextUrl.pathname === '/login' || nextUrl.pathname === '/signup';
    const isApiRoute = nextUrl.pathname.startsWith('/api');

    // Allow API routes to handle their own auth
    if (isApiRoute) {
        return NextResponse.next();
    }

    // Redirect logged-in users away from auth pages
    if (isAuthRoute && isLoggedIn) {
        if (userRole === 'ADMIN') {
            return NextResponse.redirect(new URL('/admin', nextUrl));
        }
        return NextResponse.redirect(new URL('/buyer', nextUrl));
    }

    // Protect admin routes
    if (isAdminRoute) {
        if (!isLoggedIn) {
            return NextResponse.redirect(new URL('/login', nextUrl));
        }
        if (userRole !== 'ADMIN') {
            return NextResponse.redirect(new URL('/buyer', nextUrl));
        }
    }

    // Protect buyer routes
    if (isBuyerRoute) {
        if (!isLoggedIn) {
            return NextResponse.redirect(new URL('/login', nextUrl));
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        // Match all routes except static files and api
        '/((?!_next/static|_next/image|favicon.ico|public).*)',
    ],
};
