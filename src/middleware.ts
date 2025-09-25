import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getIronSession } from 'iron-session'

interface SessionData {
  userId?: string
  username?: string
  isLoggedIn: boolean
}

const sessionConfig = {
  password: process.env.SESSION_SECRET || 'your-session-secret-key-min-32-characters',
  cookieName: 'invoice-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
}

const publicRoutes = [
  '/login',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/users', // Allow user creation for initial setup
]

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Allow access to public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  try {
    const response = NextResponse.next()
    const session = await getIronSession<SessionData>(request, response, sessionConfig)

    // Check if user is authenticated
    if (!session.isLoggedIn) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    // If there's a database connection error or other issues during setup,
    // still redirect to login where they can see the error
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|.*\.(?:png|jpg|jpeg|gif|svg|ico|css|js|map)$).*)',
  ],
}
