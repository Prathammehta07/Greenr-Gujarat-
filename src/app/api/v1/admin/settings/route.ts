// Admin: system settings (emission factor, tariff, scoring rules)
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, audit } from '@/lib/auth'
import { ok, err, unauthorized, forbidden } from '@/lib/api'

export async function GET() {
  const payload = await getAuthUser()
  if (!payload) return unauthorized()
  if (payload.role !== 'ADMIN') return forbidden()

  const settings = await db.systemSetting.findMany({ orderBy: { key: 'asc' } })
  return ok({
    settings: settings.map(s => ({
      id: s.id, key: s.key, value: s.value, description: s.description,
      isPublic: s.isPublic, updatedAt: s.updatedAt.toISOString()
    }))
  })
}

export async function PATCH(req: NextRequest) {
  const payload = await getAuthUser()
  if (!payload) return unauthorized()
  if (payload.role !== 'ADMIN') return forbidden()

  const body = await req.json().catch(() => null)
  if (!body?.key || body.value === undefined) return err('key and value required')

  const updated = await db.systemSetting.upsert({
    where: { key: body.key },
    update: { value: String(body.value), description: body.description, updatedBy: payload.sub },
    create: { key: body.key, value: String(body.value), description: body.description, isPublic: body.isPublic ?? true }
  })

  await audit('SETTING_UPDATED', 'SYSTEM_SETTING', payload.sub, updated.id, JSON.stringify({ key: body.key, value: body.value }))
  return ok({ setting: updated })
}
