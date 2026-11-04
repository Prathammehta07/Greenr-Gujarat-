// Admin: audit logs
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { ok, unauthorized, forbidden } from '@/lib/api'

export async function GET(req: NextRequest) {
  const payload = await getAuthUser()
  if (!payload) return unauthorized()
  if (payload.role !== 'ADMIN') return forbidden()

  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action')
  const limit = Math.min(Number(searchParams.get('limit')) || 100, 500)

  const where: Record<string, unknown> = {}
  if (action) where.action = action

  const logs = await db.auditLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: { actor: { select: { name: true, email: true } } }
  })

  return ok({
    logs: logs.map(l => ({
      id: l.id,
      action: l.action,
      resource: l.resource,
      resourceId: l.resourceId,
      actor: l.actor?.name || 'system',
      actorEmail: l.actor?.email,
      details: l.details,
      ipAddress: l.ipAddress,
      timestamp: l.createdAt.toISOString()
    }))
  })
}
