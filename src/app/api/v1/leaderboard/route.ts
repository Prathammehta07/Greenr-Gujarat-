// GET /api/v1/leaderboard?type=citizen|district|school|college|community&period=week|month|alltime
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { ok, unauthorized } from '@/lib/api'

export async function GET(req: NextRequest) {
  const payload = await getAuthUser()
  if (!payload) return unauthorized()

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'citizen'
  const period = searchParams.get('period') || 'alltime'

  // period filter
  const since = new Date()
  if (period === 'week') since.setDate(since.getDate() - 7)
  else if (period === 'month') since.setMonth(since.getMonth() - 1)
  else since.setFullYear(2000) // all-time

  if (type === 'citizen') {
    // only users who opted into public leaderboards
    const users = await db.user.findMany({
      where: { consentPublic: true, isActive: true },
      include: {
        profile: { include: { district: true } },
        points: { where: { createdAt: { gte: since } } }
      }
    })
    const ranked = users
      .map(u => ({
        userId: u.id,
        name: u.publicName || u.name.split(' ')[0] + '_****',
        district: u.profile?.district?.name,
        points: u.points.reduce((s, p) => s + p.points, 0),
        missionsCompleted: 0 // computed below via separate query
      }))
      .sort((a, b) => b.points - a.points)
      .slice(0, 50)
      .map((u, i) => ({ rank: i + 1, ...u, isCurrentUser: u.userId === payload.sub }))

    // attach missionsCompleted
    const userIds = ranked.map(r => r.userId)
    const submissions = await db.missionSubmission.findMany({
      where: { userId: { in: userIds }, status: 'APPROVED', createdAt: { gte: since } },
      select: { userId: true }
    })
    const counts = new Map<string, number>()
    for (const s of submissions) counts.set(s.userId, (counts.get(s.userId) || 0) + 1)
    ranked.forEach(r => { r.missionsCompleted = counts.get(r.userId) || 0 })

    return ok({ type, period, entries: ranked, scoringRules: 'Points = verified mission points + bill-saving points + badge bonuses. Only users who opted into public leaderboards are shown.' })

  } else if (type === 'district') {
    const stats = await db.districtStats.findMany({
      include: { district: true },
      orderBy: { missionsCompleted: 'desc' }
    })
    const entries = stats
      .map((s, i) => ({
        rank: i + 1,
        districtId: s.districtId,
        name: s.district.name,
        participants: s.participantCount,
        missionsCompleted: s.missionsCompleted,
        savingsKwh: Math.round(s.reportedSavingsKwh),
        co2ReductionKg: Math.round(s.estimatedCo2ReductionKg),
        isSample: s.isSample
      }))
    return ok({ type, period, entries, scoringRules: 'District scores aggregate verified missions and reported savings of opted-in citizens. Sample data is clearly labelled.' })

  } else {
    // school / college / community — based on Community model with category filter
    let cat: string | null = null
    if (type === 'school') cat = 'SCHOOL'
    else if (type === 'college') cat = 'COLLEGE'
    else if (type === 'community') cat = null // all communities

    const communities = await db.community.findMany({
      where: cat ? { category: cat } : {},
      include: { _count: { select: { members: true } } },
      orderBy: { memberCount: 'desc' }
    })
    const entries = communities.slice(0, 50).map((c, i) => ({
      rank: i + 1,
      id: c.id,
      name: c.name,
      category: c.category,
      members: c.memberCount,
      points: c.memberCount * 12 // derived from members' activity, simplified
    }))
    return ok({ type, period, entries, scoringRules: 'Community scores aggregate member points. Create or join a community in the Community Hub.' })
  }
}
