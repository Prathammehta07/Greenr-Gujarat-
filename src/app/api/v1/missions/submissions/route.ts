// POST /api/v1/missions/submissions — submit mission evidence
// GET  /api/v1/missions/submissions — list user's submissions
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, audit } from '@/lib/auth'
import { ok, err, unauthorized } from '@/lib/api'

export async function GET(req: NextRequest) {
  const payload = await getAuthUser()
  if (!payload) return unauthorized()
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  const where: Record<string, unknown> = { userId: payload.sub }
  if (status) where.status = status

  const submissions = await db.missionSubmission.findMany({
    where,
    include: { mission: true },
    orderBy: { createdAt: 'desc' }
  })

  return ok({
    submissions: submissions.map(s => ({
      id: s.id,
      missionId: s.missionId,
      title: s.mission.title,
      category: s.mission.category,
      points: s.mission.points,
      status: s.status,
      evidenceText: s.evidenceText,
      evidenceFile: s.evidenceFile,
      reviewNote: s.reviewNote,
      awardedPoints: s.awardedPoints,
      createdAt: s.createdAt.toISOString(),
      reviewedAt: s.reviewedAt?.toISOString()
    }))
  })
}

export async function POST(req: NextRequest) {
  const payload = await getAuthUser()
  if (!payload) return unauthorized()

  const body = await req.json().catch(() => null)
  if (!body?.missionId) return err('missionId is required')

  const mission = await db.mission.findUnique({ where: { id: body.missionId } })
  if (!mission || !mission.isActive) return err('Mission not found or inactive', 404)

  // prevent duplicate submissions
  const existing = await db.missionSubmission.findUnique({
    where: { userId_missionId: { userId: payload.sub, missionId: mission.id } }
  })
  if (existing && existing.status !== 'REJECTED') {
    return err('You have already submitted this mission. Rejected submissions may be resubmitted.', 409)
  }
  if (existing && existing.status === 'REJECTED') {
    // allow re-submission: update existing
    const updated = await db.missionSubmission.update({
      where: { id: existing.id },
      data: {
        status: 'PENDING',
        evidenceText: body.evidenceText || null,
        evidenceFile: body.evidenceFile || null,
        reviewNote: null,
        reviewerId: null,
        reviewedAt: null,
        awardedPoints: 0
      }
    })
    await audit('MISSION_RESUBMITTED', 'MISSION_SUBMISSION', payload.sub, updated.id, JSON.stringify({ missionId: mission.id }))
    return ok({ submissionId: updated.id, status: 'PENDING', message: 'Mission re-submitted for review.' }, 201)
  }

  // evidence required?
  if (mission.requiresEvidence && !body.evidenceText && !body.evidenceFile) {
    return err('This mission requires evidence (text or image).', 400)
  }

  const submission = await db.missionSubmission.create({
    data: {
      userId: payload.sub,
      missionId: mission.id,
      evidenceText: body.evidenceText || null,
      evidenceFile: body.evidenceFile || null,
      status: 'PENDING'
    }
  })

  await audit('MISSION_SUBMITTED', 'MISSION_SUBMISSION', payload.sub, submission.id, JSON.stringify({ missionId: mission.id }))
  return ok({ submissionId: submission.id, status: 'PENDING', message: 'Mission submitted for review.' }, 201)
}
