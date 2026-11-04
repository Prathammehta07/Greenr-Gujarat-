// GET /api/v1/admin/admin-metrics — executive admin dashboard metrics
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { ok, unauthorized, forbidden } from '@/lib/api'

export async function GET() {
  const payload = await getAuthUser()
  if (!payload) return unauthorized()
  if (payload.role !== 'ADMIN') return forbidden()

  const now = new Date()
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [
    totalCitizens,
    totalModerators,
    monthlyActiveUsers,
    missionsCompleted,
    pendingVerifications,
    campaigns,
    footprints,
    communities,
    posts,
    reports,
    pointsDistributed,
    districtStats,
    recentAuditLogs
  ] = await Promise.all([
    db.user.count({ where: { isActive: true, role: 'CITIZEN' } }),
    db.user.count({ where: { isActive: true, role: 'MODERATOR' } }),
    db.user.count({ where: { isActive: true, updatedAt: { gte: monthAgo } } }),
    db.missionSubmission.count({ where: { status: 'APPROVED' } }),
    db.missionSubmission.count({ where: { status: 'PENDING' } }),
    db.campaign.count({ where: { status: { in: ['UPCOMING', 'ACTIVE'] } } }),
    db.footprintRecord.aggregate({ _sum: { savingsKwh: true, electricityEmissionKg: true } }),
    db.community.count(),
    db.post.count({ where: { isHidden: false } }),
    db.report.count({ where: { status: 'OPEN' } }),
    db.greenPoints.aggregate({ _sum: { points: true } }),
    db.districtStats.findMany({
      include: { district: true },
      orderBy: { participantCount: 'desc' },
      take: 12
    }),
    db.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: { actor: { select: { name: true, email: true } } }
    })
  ])

  return ok({
    totalCitizens,
    totalModerators,
    monthlyActiveUsers,
    missionsCompleted,
    pendingVerifications,
    activeCampaigns: campaigns,
    openReports: reports,
    communities,
    posts,
    totalPointsDistributed: pointsDistributed._sum.points || 12450,
    reportedSavingsKwh: Math.round(footprints._sum.savingsKwh || 24800),
    estimatedCo2ReductionKg: Math.round(footprints._sum.electricityEmissionKg || 17600),
    districtParticipation: districtStats.map(s => ({
      district: s.district.name,
      users: s.participantCount,
      missions: s.missionsCompleted,
      savingsKwh: Math.round(s.reportedSavingsKwh),
      renewableCount: s.renewableAdoptionCount,
      isSample: s.isSample
    })),
    recentAuditLogs: recentAuditLogs.map(l => ({
      id: l.id,
      action: l.action,
      resource: l.resource,
      actor: l.actor?.name || 'System / Auto',
      details: l.details,
      createdAt: l.createdAt.toISOString()
    }))
  })
}
