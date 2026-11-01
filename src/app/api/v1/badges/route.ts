// GET /api/v1/badges — list all badges + earned status for the user
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { ok, unauthorized } from '@/lib/api'

export async function GET() {
  const payload = await getAuthUser()
  if (!payload) return unauthorized()

  const [badges, earned] = await Promise.all([
    db.badge.findMany({ orderBy: { points: 'asc' } }),
    db.userBadge.findMany({ where: { userId: payload.sub }, include: { badge: true } })
  ])
  const earnedCodes = new Set(earned.map(e => e.badge.code))

  return ok({
    badges: badges.map(b => ({
      id: b.id,
      code: b.code,
      name: b.name,
      description: b.description,
      icon: b.icon,
      color: b.color,
      criteria: b.criteria,
      points: b.points,
      earned: earnedCodes.has(b.code),
      earnedAt: earned.find(e => e.badge.code === b.code)?.awardedAt.toISOString()
    })),
    earnedCount: earned.length
  })
}
