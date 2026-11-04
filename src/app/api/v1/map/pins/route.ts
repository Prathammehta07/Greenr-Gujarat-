// GET /api/v1/map/pins?category=EV_CHARGER|SOLAR_INSTALL|RECYCLING|EVENT|INITIATIVE
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { ok, unauthorized } from '@/lib/api'

export async function GET(req: NextRequest) {
  const payload = await getAuthUser()
  if (!payload) return unauthorized()

  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const where: Record<string, unknown> = {}
  if (category && category !== 'ALL') where.category = category

  const pins = await db.mapPin.findMany({
    where,
    include: { district: { select: { name: true } } },
    take: 500
  })

  return ok({
    pins: pins.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      latitude: p.latitude,
      longitude: p.longitude,
      address: p.address,
      operator: p.operator,
      district: p.district?.name,
      isVerified: p.isVerified,
      isSample: p.isSample,
      metadata: p.metadata ? JSON.parse(p.metadata) : null
    })),
    total: pins.length,
    verifiedCount: pins.filter(p => p.isVerified).length,
    sampleCount: pins.filter(p => p.isSample).length,
    disclaimer: 'Pins marked "Sample" are demonstrative only and not real-world locations. Verified pins represent locations whose existence has been confirmed by GEDA moderators.'
  })
}
