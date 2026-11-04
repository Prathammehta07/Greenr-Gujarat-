// GET /api/v1/impact-stats — public impact statistics (no auth required for landing page)
import { db } from '@/lib/db'
import { ok } from '@/lib/api'

export async function GET() {
  const [users, missions, submissions, footprints, communities, pins] = await Promise.all([
    db.user.count({ where: { isActive: true, isDemo: false } }),
    db.mission.count({ where: { isActive: true } }),
    db.missionSubmission.count({ where: { status: 'APPROVED' } }),
    db.footprintRecord.aggregate({ _sum: { savingsKwh: true, electricityEmissionKg: true } }),
    db.community.count(),
    db.mapPin.count({ where: { isVerified: true } })
  ])

  // include demo users in the headline for hackathon presentation, but clearly separate
  const demoUsers = await db.user.count({ where: { isDemo: true } })
  const realUsers = users
  const totalParticipants = realUsers + demoUsers

  return ok({
    realCitizens: realUsers,
    demoAccounts: demoUsers,
    totalParticipants,
    activeMissions: missions,
    verifiedActions: submissions,
    electricitySavedKwh: Math.round(footprints._sum.savingsKwh || 0),
    co2ReducedKg: Math.round(footprints._sum.electricityEmissionKg || 0),
    communities,
    verifiedGreenLocations: pins,
    note: 'Statistics are derived from this platform\'s database. Demo accounts are clearly separated. These are NOT official GEDA or Government of Gujarat statistics.'
  })
}
