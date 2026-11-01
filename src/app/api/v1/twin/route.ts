// GET /api/v1/twin — Gujarat district-level digital twin (sample + real data)
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { ok, unauthorized } from '@/lib/api'

export async function GET() {
  const payload = await getAuthUser()
  if (!payload) return unauthorized()

  const stats = await db.districtStats.findMany({
    include: { district: true }
  })

  return ok({
    districts: stats.map(s => ({
      districtId: s.districtId,
      name: s.district.name,
      participants: s.participantCount,
      missionsCompleted: s.missionsCompleted,
      savingsKwh: Math.round(s.reportedSavingsKwh),
      co2ReductionKg: Math.round(s.estimatedCo2ReductionKg),
      renewableAdoptions: s.renewableAdoptionCount,
      isSample: s.isSample,
      coordinates: s.district.latitude && s.district.longitude
        ? [s.district.latitude, s.district.longitude]
        : null
    })),
    totals: {
      districts: stats.length,
      participants: stats.reduce((s, d) => s + d.participantCount, 0),
      missionsCompleted: stats.reduce((s, d) => s + d.missionsCompleted, 0),
      savingsKwh: Math.round(stats.reduce((s, d) => s + d.reportedSavingsKwh, 0)),
      co2ReductionKg: Math.round(stats.reduce((s, d) => s + d.estimatedCo2ReductionKg, 0)),
      renewableAdoptions: stats.reduce((s, d) => s + d.renewableAdoptionCount, 0)
    },
    disclaimer: 'This is an interactive visualisation of district-level participation. It is NOT a real-time government digital twin. District statistics marked "isSample" are clearly fictional demo data.'
  })
}
