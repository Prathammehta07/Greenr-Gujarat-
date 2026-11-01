// GET /api/v1/missions — list missions (optionally filtered by category)
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { ok, unauthorized } from '@/lib/api'

export async function GET(req: NextRequest) {
  const payload = await getAuthUser()
  if (!payload) return unauthorized()

  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')

  const where: Record<string, unknown> = { isActive: true }
  if (category && category !== 'ALL') where.category = category

  const missions = await db.mission.findMany({
    where,
    orderBy: [{ category: 'asc' }, { points: 'desc' }]
  })

  // attach the current user's submission status
  const submissions = await db.missionSubmission.findMany({
    where: { userId: payload.sub },
    select: { missionId: true, status: true, id: true }
  })
  const subMap = new Map(submissions.map(s => [s.missionId, s]))

  return ok({
    missions: missions.map(m => ({
      id: m.id,
      title: m.title,
      description: m.description,
      instructions: m.instructions,
      category: m.category,
      difficulty: m.difficulty,
      points: m.points,
      requiresEvidence: m.requiresEvidence,
      evidenceType: m.evidenceType,
      estimatedCo2Kg: m.estimatedCo2Kg,
      startDate: m.startDate,
      endDate: m.endDate,
      submission: subMap.get(m.id) || null
    }))
  })
}
