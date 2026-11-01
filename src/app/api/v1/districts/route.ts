// GET /api/v1/districts — list Gujarat districts
import { db } from '@/lib/db'
import { ok } from '@/lib/api'

export async function GET() {
  const districts = await db.district.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, code: true, latitude: true, longitude: true }
  })
  return ok({ districts })
}
