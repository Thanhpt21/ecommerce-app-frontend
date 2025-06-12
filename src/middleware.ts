import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { i18n } from '../next-i18next.config'

const ADMIN_ROLE = 'admin'

// Một số route public không cần auth
const PUBLIC_PATHS = ['login', 'register', 'forgot-password', 'reset-password']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 1. Tự động redirect nếu thiếu locale
  const hasLocale = i18n.locales.some((locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`)
  if (!hasLocale) {
    const locale = i18n.defaultLocale
    return NextResponse.redirect(new URL(`/${locale}${pathname}`, req.url))
  }

  const locale = pathname.split('/')[1] // vi, en, etc.
  const pathWithoutLocale = pathname.replace(`/${locale}`, '')

  // 2. Bỏ qua các route public
  if (PUBLIC_PATHS.some((publicPath) => pathWithoutLocale.startsWith(`/${publicPath}`))) {
    return NextResponse.next()
  }

  // 3. Nếu là route admin → kiểm tra accessToken + role
  if (pathname.startsWith(`/${locale}/admin`)) {
    const token = req.cookies.get('accessToken')?.value

    if (!token) {
      return NextResponse.redirect(new URL(`/${locale}/login`, req.url))
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'defaultSecret')
      const { payload } = await jwtVerify(token, secret)

      const role = payload.role

      if (role !== ADMIN_ROLE) {
          console.log('⛔ Sai role:', role)
        return NextResponse.redirect(new URL(`/${locale}/403`, req.url))
      }
    } catch (err) {
      console.error('JWT Verify Error:', err)
         console.log('⛔ Không có accessToken → redirect login')
      return NextResponse.redirect(new URL(`/${locale}/login`, req.url))
    }
  }

  return NextResponse.next()
}

// ✅ Chỉ áp dụng middleware cho /vi/admin/*
export const config = {
  matcher: ['/:locale/admin/:path*']
}