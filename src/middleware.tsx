import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const isUserPath = request.nextUrl.pathname.startsWith('/user');

    // If trying to access user routes without token, redirect to login
    if (isUserPath && !token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // If logged in and trying to access login/register, redirect to root
    if (token && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register')) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/user/:path*', '/login', '/register'],
};