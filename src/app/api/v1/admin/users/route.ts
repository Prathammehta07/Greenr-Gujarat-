// GET /api/v1/admin/users — list users (admin only)
// PATCH /api/v1/admin/users — update user role/active status
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, audit } from '@/lib/auth'
import { ok, err, unauthorized, forbidden } from '@/lib/api'

export async function GET(req: NextRequest) {
  const payload = await getAuthUser()
  if (!payload) return unauthorized()
  if (payload.role !== 'ADMIN') return forbidden()

  const { searchParams } = new URL(req.url)
  const role = searchParams.get('role')
  const q = searchParams.get('q')

  const where: Record<string, unknown> = {}
  if (role) where.role = role
  if (q) where.OR = [{ name: { contains: q } }, { email: { contains: q } }]

  const users = await db.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: {
      id: true, email: true, name: true, role: true, isDemo: true, isActive: true,
      createdAt: true, preferredLang: true, consentPublic: true,
      profile: { include: { district: { select: { name: true } } } }
    }
  })

  return ok({
    users: users.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      isDemo: u.isDemo,
      isActive: u.isActive,
      preferredLang: u.preferredLang,
      district: u.profile?.district?.name,
      createdAt: u.createdAt.toISOString()
    }))
  })
}

export async function PATCH(req: NextRequest) {
  const payload = await getAuthUser()
  if (!payload) return unauthorized()
  if (payload.role !== 'ADMIN') return forbidden()

  const body = await req.json().catch(() => null)
  if (!body?.userId) return err('userId is required')

  const target = await db.user.findUnique({ where: { id: body.userId } })
  if (!target) return err('User not found', 404)

  // cannot demote self
  if (body.userId === payload.sub && body.role && body.role !== 'ADMIN') {
    return err('You cannot remove your own admin role', 400)
  }

  const data: Record<string, unknown> = {}
  if (body.role && ['CITIZEN', 'MODERATOR', 'ADMIN'].includes(body.role)) data.role = body.role
  if (body.isActive !== undefined) data.isActive = Boolean(body.isActive)

  const updated = await db.user.update({ where: { id: body.userId }, data })
  await audit('USER_UPDATED', 'USER', payload.sub, body.userId, JSON.stringify(data))

  return ok({ user: { id: updated.id, role: updated.role, isActive: updated.isActive } })
}
