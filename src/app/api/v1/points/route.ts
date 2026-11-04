// GET /api/v1/points — current user's points transaction ledger
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { ok, unauthorized } from '@/lib/api'

export async function GET(req: NextRequest) {
  const payload = await getAuthUser()
  if (!payload) return unauthorized()

  const { searchParams } = new URL(req.url)
  const limit = Math.min(Number(searchParams.get('limit')) || 50, 200)

  const transactions = await db.greenPoints.findMany({
    where: { userId: payload.sub },
    orderBy: { createdAt: 'desc' },
    take: limit
  })

  const balance = transactions[0]?.balanceAfter ?? 0
  const totalAwarded = transactions.filter(t => t.points > 0).reduce((s, t) => s + t.points, 0)
  const totalReversed = transactions.filter(t => t.points < 0).reduce((s, t) => s + Math.abs(t.points), 0)

  return ok({
    balance,
    totalAwarded,
    totalReversed,
    transactions: transactions.map(t => ({
      id: t.id,
      points: t.points,
      reason: t.reason,
      sourceType: t.sourceType,
      sourceId: t.sourceId,
      balanceAfter: t.balanceAfter,
      timestamp: t.createdAt.toISOString()
    }))
  })
}
