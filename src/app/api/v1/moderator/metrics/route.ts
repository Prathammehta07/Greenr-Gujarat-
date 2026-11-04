// GET /api/v1/moderator/metrics — Moderator metrics & pending queues
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { ok, unauthorized, forbidden } from '@/lib/api'

export async function GET() {
  const payload = await getAuthUser()
  if (!payload) return unauthorized()
  if (payload.role !== 'MODERATOR' && payload.role !== 'ADMIN') return forbidden()

  const now = new Date()
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [
    pendingVerifications,
    approvedSubmissions,
    rejectedSubmissions,
    openReports,
    activeMembers,
    totalPosts,
    totalComments,
    pendingSubmissions,
    openReportsList,
    recentReviews
  ] = await Promise.all([
    db.missionSubmission.count({ where: { status: 'PENDING' } }),
    db.missionSubmission.count({ where: { status: 'APPROVED' } }),
    db.missionSubmission.count({ where: { status: 'REJECTED' } }),
    db.report.count({ where: { status: 'OPEN' } }),
    db.user.count({ where: { isActive: true, updatedAt: { gte: monthAgo } } }),
    db.post.count({ where: { isHidden: false } }),
    db.comment.count({ where: { isHidden: false } }),
    // Pending submissions with user & mission
    db.missionSubmission.findMany({
      where: { status: 'PENDING' },
      include: {
        mission: true,
        user: { select: { id: true, name: true, email: true, profile: { select: { cityVillage: true } } } }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    }),
    // Open reports
    db.report.findMany({
      where: { status: 'OPEN' },
      include: {
        reporter: { select: { name: true, email: true } },
        post: { include: { author: { select: { name: true, email: true } } } }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    }),
    // Recent moderation history
    db.missionSubmission.findMany({
      where: { status: { in: ['APPROVED', 'REJECTED'] } },
      include: {
        mission: { select: { title: true, points: true, category: true } },
        user: { select: { name: true, email: true } }
      },
      orderBy: { reviewedAt: 'desc' },
      take: 10
    })
  ])

  // Submissions breakdown by category
  const categoryStats = await db.mission.findMany({
    select: {
      category: true,
      _count: { select: { submissions: true } }
    }
  })

  const categoryAggregated = categoryStats.reduce<Record<string, number>>((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr._count.submissions
    return acc
  }, {})

  return ok({
    metrics: {
      pendingVerifications,
      approvedSubmissions,
      rejectedSubmissions,
      openReports,
      activeMembers,
      totalDiscussions: totalPosts + totalComments,
      verificationRate: (approvedSubmissions + rejectedSubmissions + pendingVerifications) > 0
        ? Math.round(((approvedSubmissions + rejectedSubmissions) / (approvedSubmissions + rejectedSubmissions + pendingVerifications)) * 100)
        : 100
    },
    pendingSubmissions: pendingSubmissions.map(s => ({
      id: s.id,
      missionId: s.missionId,
      missionTitle: s.mission.title,
      category: s.mission.category,
      points: s.mission.points,
      userId: s.user.id,
      userName: s.user.name,
      userEmail: s.user.email,
      district: s.user.profile?.cityVillage || 'Gujarat',
      evidenceText: s.evidenceText,
      evidenceFile: s.evidenceFile,
      status: s.status,
      createdAt: s.createdAt.toISOString()
    })),
    openReports: openReportsList.map(r => ({
      id: r.id,
      reason: r.reason,
      details: r.details,
      postId: r.postId,
      postContent: r.post?.content || '(No content)',
      postAuthor: r.post?.author?.name || 'Unknown',
      reporterName: r.reporter.name,
      status: r.status,
      createdAt: r.createdAt.toISOString()
    })),
    recentReviews: recentReviews.map(r => ({
      id: r.id,
      missionTitle: r.mission.title,
      userName: r.user.name,
      status: r.status,
      points: r.status === 'APPROVED' ? r.awardedPoints : 0,
      reviewNote: r.reviewNote,
      reviewedAt: r.reviewedAt?.toISOString() || r.updatedAt.toISOString()
    })),
    categoryBreakdown: Object.entries(categoryAggregated).map(([category, count]) => ({
      category,
      count
    }))
  })
}
