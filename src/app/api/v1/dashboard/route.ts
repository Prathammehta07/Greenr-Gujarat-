// GET /api/v1/dashboard — citizen dashboard summary, derived from user's records
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { ok, unauthorized } from '@/lib/api'
import { calcGreenScore, analyseEnergy, getEmissionFactor, getTariff } from '@/lib/calc'

export async function GET() {
  const payload = await getAuthUser()
  if (!payload) return unauthorized()

  const userId = payload.sub

  // total points
  const pointsRows = await db.greenPoints.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } })
  const totalPoints = pointsRows.reduce((sum, p) => sum + p.points, 0)
  const lastBalance = pointsRows[0]?.balanceAfter ?? 0

  // badges
  const userBadges = await db.userBadge.findMany({
    where: { userId },
    include: { badge: true },
    orderBy: { awardedAt: 'desc' }
  })

  // footprints — last 6 months
  const footprints = await db.footprintRecord.findMany({
    where: { userId },
    orderBy: { month: 'desc' },
    take: 6
  })
  const footprintsAsc = [...footprints].sort((a, b) => a.month.localeCompare(b.month))

  // submissions
  const submissions = await db.missionSubmission.findMany({
    where: { userId },
    include: { mission: true },
    orderBy: { createdAt: 'desc' }
  })
  const approved = submissions.filter(s => s.status === 'APPROVED')
  const activeMissions = submissions
    .filter(s => s.status === 'PENDING' || s.status === 'REQUIRES_REVIEW')
    .slice(0, 5)
    .map(s => ({
      id: s.id,
      missionId: s.missionId,
      title: s.mission.title,
      category: s.mission.category,
      points: s.mission.points,
      status: s.status,
      progress: s.status === 'PENDING' ? 50 : s.status === 'REQUIRES_REVIEW' ? 75 : 0
    }))

  // recent activities — points transactions
  const recentActivities = pointsRows.slice(0, 8).map(p => ({
    id: p.id,
    type: p.sourceType,
    description: p.reason,
    points: p.points,
    timestamp: p.createdAt.toISOString()
  }))

  // monthly consumption chart data
  const monthlyConsumption = footprintsAsc.map(f => ({
    month: f.month,
    kwh: f.electricityKwh,
    baseline: f.baselineKwh
  }))

  // totals
  const totalKwh = footprints.reduce((sum, f) => sum + f.electricityKwh, 0)
  const totalSavings = footprints.reduce((sum, f) => sum + f.savingsKwh, 0)
  const totalEmissions = footprints.reduce((sum, f) => sum + f.electricityEmissionKg, 0)
  const lastMonth = footprints[0]
  const monthlyKwh = lastMonth?.electricityKwh ?? 0
  const monthlyEmissionKg = lastMonth?.electricityEmissionKg ?? 0
  const savingsKwh = lastMonth?.savingsKwh ?? 0
  const savingsPercent = lastMonth && lastMonth.baselineKwh > 0
    ? Math.max(0, (lastMonth.savingsKwh / lastMonth.baselineKwh) * 100)
    : 0

  // green score
  const greenScore = calcGreenScore(totalPoints, totalSavings, approved.length)

  // AI Energy Doctor analysis
  const tariff = await getTariff()
  const analysis = analyseEnergy(monthlyConsumption.map(m => ({ month: m.month, kwh: m.kwh })), tariff)
  const aiSuggestions = analysis.recommendations.map((r, i) => ({
    id: `sug-${i}`,
    title: r.title,
    detail: r.detail,
    estimatedSavingKwh: r.estimatedSavingKwh,
    estimatedSavingRs: r.estimatedSavingRs,
    appliance: r.appliance
  }))

  return ok({
    greenScore,
    totalPoints,
    pointsBalance: lastBalance,
    monthlyKwh: Math.round(monthlyKwh),
    monthlyEmissionKg: Math.round(monthlyEmissionKg),
    savingsKwh: Math.round(savingsKwh),
    savingsPercent: Math.round(savingsPercent),
    badgesCount: userBadges.length,
    badges: userBadges.slice(0, 6).map(ub => ({
      code: ub.badge.code,
      name: ub.badge.name,
      icon: ub.badge.icon,
      color: ub.badge.color
    })),
    activeMissions,
    missionsCompleted: approved.length,
    monthlyConsumption,
    aiSuggestions,
    aiAnalysis: {
      trend: analysis.trend,
      avgKwh: analysis.avgKwh,
      anomalies: analysis.anomalies
    },
    recentActivities,
    totals: {
      totalKwh: Math.round(totalKwh),
      totalSavings: Math.round(totalSavings),
      totalEmissions: Math.round(totalEmissions)
    }
  })
}
