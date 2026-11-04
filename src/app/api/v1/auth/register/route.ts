// POST /api/v1/auth/register
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, signAccessToken, signRefreshToken, audit } from '@/lib/auth'
import { ok, err, rateLimit, getClientIp } from '@/lib/api'

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (!rateLimit(ip)) return err('Too many requests', 429)

  const body = await req.json().catch(() => null)
  if (!body) return err('Invalid JSON')

  const { name, email, password, districtId, preferredLang, consentPublic } = body
  if (!name || !email || !password) return err('Name, email and password are required')
  if (password.length < 8) return err('Password must be at least 8 characters')
  if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) return err('Invalid email')

  const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } })
  if (existing) return err('Email already registered', 409)

  let district: { id: string; name: string } | null = null
  if (districtId) {
    district = await db.district.findUnique({ where: { id: districtId } })
    if (!district) return err('Invalid district')
  }

  const passwordHash = await hashPassword(password)
  const user = await db.user.create({
    data: {
      email: email.toLowerCase(),
      name,
      passwordHash,
      role: 'CITIZEN',
      preferredLang: preferredLang || 'en',
      consentPublic: Boolean(consentPublic),
      publicName: consentPublic ? name.split(' ')[0] + '_' + Math.random().toString(36).slice(2, 6) : null,
      profile: { create: { districtId: district?.id || null } }
    },
    include: { profile: true }
  })

  await audit('USER_REGISTERED', 'USER', user.id, user.id, JSON.stringify({ email: user.email, district: district?.name }))

  const access = signAccessToken({ sub: user.id, email: user.email, role: user.role, name: user.name })
  const refresh = signRefreshToken({ sub: user.id, email: user.email, role: user.role, name: user.name })

  const res = ok({
    user: {
      id: user.id, email: user.email, name: user.name,
      role: user.role, preferredLang: user.preferredLang, isDemo: user.isDemo,
    },
    token: access, refreshToken: refresh,
  }, 201)

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
