import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export interface SessionData {
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

export async function getSession() {
  const cookieStore = await cookies()
  const session = await getIronSession<SessionData>(cookieStore, sessionConfig)
  
  if (!session.isLoggedIn) {
    session.isLoggedIn = false
  }
  
  return session
}

export async function requireUserId() {
  const session = await getSession()
  if (!session.isLoggedIn || !session.userId) {
    throw new Error('Unauthorized')
  }
  return session.userId
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return bcrypt.compare(password, hashedPassword)
}

export async function loginUser(username: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { username }
  })
  
  if (!user || !await verifyPassword(password, user.password)) {
    return null
  }
  
  const session = await getSession()
  session.userId = user.id
  session.username = user.username
  session.isLoggedIn = true
  await session.save()
  
  return user
}

export async function logoutUser() {
  const session = await getSession()
  session.destroy()
}
