import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const ADMIN_ROLE = 'admin';

// Các route public không cần auth
const PUBLIC_PATHS = ['login', 'register', 'forgot-password', 'reset-password'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Bỏ qua các route public
  if (PUBLIC_PATHS.some((publicPath) => pathname.startsWith(`/${publicPath}`))) {
    return NextResponse.next();
  }

  // Nếu là route admin → kiểm tra accessToken + role
  if (pathname.startsWith('/admin')) {
    const token = req.cookies.get('accessToken')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'defaultSecret');
      const { payload } = await jwtVerify(token, secret);

      const role = payload.role;

      if (role !== ADMIN_ROLE) {
        console.log('⛔ Sai role:', role);
        return NextResponse.redirect(new URL('/403', req.url));
      }
    } catch (err) {
      console.error('JWT Verify Error:', err);
      console.log('⛔ Không có accessToken → redirect login');
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return NextResponse.next();
}

// Chỉ áp dụng middleware cho /admin/*
export const config = {
  matcher: ['/admin/:path*', '/login', '/register', '/forgot-password', '/reset-password'],
};