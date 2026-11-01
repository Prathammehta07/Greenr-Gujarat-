// Admin: review submissions (approve/reject + award points)
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, audit } from '@/lib/auth'
import { ok, err, unauthorized, forbidden } from '@/lib/api'

// GET /api/v1/admin/submissions?status=PENDING
export async function GET(req: NextRequest) {
  const payload = await getAuthUser()
  if (!payload) return unauthorized()
  if (payload.role !== 'ADMIN' && payload.role !== 'MODERATOR') return forbidden()

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || 'PENDING'

  const submissions = await db.missionSubmission.findMany({
    where: { status },
    include: {
      mission: true,
      user: { select: { id: true, name: true, email: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 100
  })

  return ok({
    submissions: submissions.map(s => ({
      id: s.id,
      missionId: s.missionId,
      missionTitle: s.mission.title,
      category: s.mission.category,
      points: s.mission.points,
      userId: s.user.id,
      userName: s.user.name,
      userEmail: s.user.email,
      evidenceText: s.evidenceText,
      evidenceFile: s.evidenceFile,
      status: s.status,
      reviewNote: s.reviewNote,
      createdAt: s.createdAt.toISOString()
    }))
  })
}

// POST /api/v1/admin/submissions — approve or reject
export async function POST(req: NextRequest) {
  const payload = await getAuthUser()
  if (!payload) return unauthorized()
  if (payload.role !== 'ADMIN' && payload.role !== 'MODERATOR') return forbidden()

  const body = await req.json().catch(() => null)
  if (!body?.submissionId || !body.action) return err('submissionId and action required')
  if (!['approve', 'reject'].includes(body.action)) return err('action must be approve or reject')

  const submission = await db.missionSubmission.findUnique({
    where: { id: body.submissionId },
    include: { mission: true }
  })
  if (!submission) return err('Submission not found', 404)
  if (submission.status !== 'PENDING' && submission.status !== 'REQUIRES_REVIEW') {
    return err(`Submission already ${submission.status}`, 400)
  }

  if (body.action === 'reject') {
    const updated = await db.missionSubmission.update({
      where: { id: submission.id },
      data: {
        status: 'REJECTED',
        reviewerId: payload.sub,
        reviewNote: body.note || 'Rejected by moderator',
        reviewedAt: new Date()
      }
    })
    await audit('SUBMISSION_REJECTED', 'MISSION_SUBMISSION', payload.sub, submission.id, body.note)
    return ok({ submission: updated })
  }

  // approve — award points + check for badge eligibility
  const result = await db.$transaction(async (tx) => {
    // check points not already awarded (prevent duplicates)
    const existing = await tx.greenPoints.findFirst({
      where: { userId: submission.userId, sourceType: 'MISSION', sourceId: submission.id }
    })
    if (existing) throw new Error('Points already awarded for this submission')

    const lastTx = await tx.greenPoints.findFirst({
      where: { userId: submission.userId },
      orderBy: { createdAt: 'desc' }
    })
    const balance = (lastTx?.balanceAfter ?? 0) + submission.mission.points

    await tx.greenPoints.create({
      data: {
        userId: submission.userId,
        points: submission.mission.points,
        reason: `Mission completed: ${submission.mission.title}`,
        sourceType: 'MISSION',
        sourceId: submission.id,
        balanceAfter: balance
      }
    })

    const updated = await tx.missionSubmission.update({
      where: { id: submission.id },
      data: {
        status: 'APPROVED',
        reviewerId: payload.sub,
        reviewNote: body.note || 'Approved',
        reviewedAt: new Date(),
        awardedPoints: submission.mission.points
      }
    })

    return { submission: updated, points: submission.mission.points }
  })

  // auto-award badges (simplified — based on approved count)
  const approvedCount = await db.missionSubmission.count({
    where: { userId: submission.userId, status: 'APPROVED' }
  })
  const badgeTriggers = [
    { count: 1, code: 'FIRST_STEP' },
    { count: 5, code: 'GREEN_WARRIOR' },
    { count: 10, code: 'ECO_CHAMPION' },
    { count: 25, code: 'GREEN_GUJARATI' }
  ]
  for (const t of badgeTriggers) {
    if (approvedCount >= t.count) {
      const badge = await db.badge.findUnique({ where: { code: t.code } })
      if (badge) {
        try {
          await db.userBadge.create({ data: { userId: submission.userId, badgeId: badge.id } })
          // award bonus points
          if (badge.points > 0) {
            const lastTx = await db.greenPoints.findFirst({
              where: { userId: submission.userId },
              orderBy: { createdAt: 'desc' }
            })
            await db.greenPoints.create({
              data: {
                userId: submission.userId,
                points: badge.points,
                reason: `Badge earned: ${badge.name}`,
                sourceType: 'BADGE',
                sourceId: badge.id,
                balanceAfter: (lastTx?.balanceAfter ?? 0) + badge.points
              }
            })
          }
          await audit('BADGE_AWARDED', 'BADGE', payload.sub, badge.id, JSON.stringify({ userId: submission.userId }))
        } catch {
          // already has badge — skip
        }
      }
    }
  }

  await audit('SUBMISSION_APPROVED', 'MISSION_SUBMISSION', payload.sub, submission.id, JSON.stringify({ points: result.points }))

  return ok({ submission: result.submission, pointsAwarded: result.points })
}
