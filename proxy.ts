import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const token = req.auth; 
  const path = req.nextUrl.pathname;

  if (path === '/') {
    if (!token) return NextResponse.redirect(new URL('/login', req.url));
    
    if (token.role === 'ADMIN') return NextResponse.redirect(new URL('/admin/dashboard', req.url));
    if (token.role === 'COORDINATOR') return NextResponse.redirect(new URL('/coordinator/dashboard', req.url));
    
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  if (path.startsWith('/admin') && token?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  if (path.startsWith('/coordinator') && token?.role !== 'COORDINATOR') {
     return NextResponse.redirect(new URL('/dashboard', req.url));
  }
});

export const config = {
  matcher: ['/', '/dashboard/:path*', '/admin/:path*', '/coordinator/:path*']
};
