// GET /api/v1/admin/admin-metrics — admin dashboard metrics
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { ok, unauthorized, forbidden } from '@/lib/api'

export async function GET() {
  const payload = await getAuthUser()
  if (!payload) return unauthorized()
  if (payload.role !== 'ADMIN') return forbidden()

  const now = new Date()
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [totalCitizens, monthlyActiveUsers, missionsCompleted, pendingVerifications, campaigns, footprints, communities, posts, reports] = await Promise.all([
    db.user.count({ where: { isActive: true, role: 'CITIZEN' } }),
    db.user.count({ where: { isActive: true, updatedAt: { gte: monthAgo } } }),
    db.missionSubmission.count({ where: { status: 'APPROVED' } }),
    db.missionSubmission.count({ where: { status: 'PENDING' } }),
    db.campaign.count({ where: { status: { in: ['UPCOMING', 'ACTIVE'] } } }),
    db.footprintRecord.aggregate({ _sum: { savingsKwh: true, electricityEmissionKg: true } }),
    db.community.count(),
    db.post.count({ where: { isHidden: false } }),
    db.report.count({ where: { status: 'OPEN' } })
  ])

  // district participation
  const districtStats = await db.districtStats.findMany({
    include: { district: true },
    orderBy: { participantCount: 'desc' },
    take: 10
  })

  return ok({
    totalCitizens,
    monthlyActiveUsers,
    missionsCompleted,
    pendingVerifications,
    activeCampaigns: campaigns,
    openReports: reports,
    communities,
    posts,
    reportedSavingsKwh: Math.round(footprints._sum.savingsKwh || 0),
    estimatedCo2ReductionKg: Math.round(footprints._sum.electricityEmissionKg || 0),
    districtParticipation: districtStats.map(s => ({
      district: s.district.name,
      users: s.participantCount,
      missions: s.missionsCompleted,
      isSample: s.isSample
    }))
  })
}
