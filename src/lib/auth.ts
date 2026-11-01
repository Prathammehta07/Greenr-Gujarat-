import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { db } from './db'

const JWT_SECRET = process.env.JWT_SECRET || 'green-gujarat-dev-secret-change-me-min-32-characters-long'
const ACCESS_EXPIRES = Number(process.env.JWT_ACCESS_EXPIRES || 900) // 15m
const REFRESH_EXPIRES = Number(process.env.JWT_REFRESH_EXPIRES || 604800) // 7d

export interface JwtPayload {
  sub: string
  email: string
  role: string
  name: string
  type: 'access' | 'refresh'
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10)
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}

export function signAccessToken(payload: Omit<JwtPayload, 'type'>): string {
  return jwt.sign({ ...payload, type: 'access' }, JWT_SECRET, { expiresIn: ACCESS_EXPIRES })
}

export function signRefreshToken(payload: Omit<JwtPayload, 'type'>): string {
  return jwt.sign({ ...payload, type: 'refresh' }, JWT_SECRET, { expiresIn: REFRESH_EXPIRES })
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload
    return decoded
  } catch {
    return null
  }
}

// Server-side helper: get the current authenticated user from cookies
export async function getAuthUser(): Promise<JwtPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('gg_access_token')?.value
  if (!token) return null
  const payload = verifyToken(token)
  if (!payload || payload.type !== 'access') return null
  // verify user still exists & active
  const user = await db.user.findUnique({ where: { id: payload.sub } })
  if (!user || !user.isActive) return null
  return payload
}

export async function requireRole(roles: string[]): Promise<{ user: JwtPayload; error?: never } | { error: string; user?: never }> {
  const user = await getAuthUser()
  if (!user) return { error: 'UNAUTHORIZED' }
  if (!roles.includes(user.role)) return { error: 'FORBIDDEN' }
  return { user }
}

export async function audit(action: string, resource: string, actorId?: string, resourceId?: string, details?: string, ip?: string) {
  try {
    await db.auditLog.create({
      data: { action, resource, resourceId, actorId, details, ipAddress: ip || null }
    })
  } catch {
    // audit failures should never break user flows
  }
}
