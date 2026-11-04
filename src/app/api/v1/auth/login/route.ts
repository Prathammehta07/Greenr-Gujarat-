// POST /api/v1/auth/login
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword, signAccessToken, signRefreshToken, audit } from '@/lib/auth'
import { ok, err, rateLimit, getClientIp } from '@/lib/api'

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (!rateLimit(ip)) return err('Too many requests', 429)

  const body = await req.json().catch(() => null)
  if (!body) return err('Invalid JSON')

  const { email, password } = body
  if (!email || !password) return err('Email and password are required')

  const user = await db.user.findUnique({ where: { email: email.toLowerCase() } })
  if (!user || !user.isActive) return err('Invalid credentials', 401)

  const valid = await verifyPassword(password, user.passwordHash)
  if (!valid) return err('Invalid credentials', 401)

  await audit('USER_LOGIN', 'USER', user.id, user.id, undefined, ip)

  const access = signAccessToken({ sub: user.id, email: user.email, role: user.role, name: user.name })
  const refresh = signRefreshToken({ sub: user.id, email: user.email, role: user.role, name: user.name })

  const res = ok({
    user: {
      id: user.id, email: user.email, name: user.name,
      role: user.role, preferredLang: user.preferredLang, isDemo: user.isDemo,
    },
    token: access, refreshToken: refresh,
  })
  res.cookies.set('gg_access_token', access, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', maxAge: Number(process.env.JWT_ACCESS_EXPIRES || 900), path: '/',
  })
  res.cookies.set('gg_refresh_token', refresh, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', maxAge: Number(process.env.JWT_REFRESH_EXPIRES || 604800), path: '/',
  })
  return res
}
