import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  // In Auth.js v5, req.auth is the Session object!
  // So the role is located inside req.auth.user.role
  const user = req.auth?.user as any;
  const role = user?.role;
  const path = req.nextUrl.pathname;

  // 1. Root page routing
  if (path === '/') {
    if (!user) return NextResponse.redirect(new URL('/login', req.url));
    
    if (role === 'ADMIN') return NextResponse.redirect(new URL('/admin/dashboard', req.url));
    if (role === 'COORDINATOR') return NextResponse.redirect(new URL('/coordinator/dashboard', req.url));
    
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // 2. Prevent logged-in users from seeing the login/signup pages
  if ((path === '/login' || path === '/signup') && user) {
    if (role === 'ADMIN') return NextResponse.redirect(new URL('/admin/dashboard', req.url));
    if (role === 'COORDINATOR') return NextResponse.redirect(new URL('/coordinator/dashboard', req.url));
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // 3. Security guards for specific folders
  if (path.startsWith('/admin') && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  if (path.startsWith('/coordinator') && role !== 'COORDINATOR') {
     return NextResponse.redirect(new URL('/dashboard', req.url));
  }
});

export const config = {
  matcher: ['/', '/login', '/signup', '/dashboard/:path*', '/admin/:path*', '/coordinator/:path*']
};
