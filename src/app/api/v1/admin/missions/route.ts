// Admin: missions CRUD + submissions review
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, audit } from '@/lib/auth'
import { ok, err, unauthorized, forbidden } from '@/lib/api'

// GET /api/v1/admin/missions — list all missions
export async function GET() {
  const payload = await getAuthUser()
  if (!payload) return unauthorized()
  if (payload.role !== 'ADMIN') return forbidden()

  const missions = await db.mission.findMany({
    include: { _count: { select: { submissions: true } } },
    orderBy: { createdAt: 'desc' }
  })
  return ok({
    missions: missions.map(m => ({
      id: m.id, title: m.title, category: m.category, difficulty: m.difficulty,
      points: m.points, isActive: m.isActive, requiresEvidence: m.requiresEvidence,
      submissions: m._count.submissions, createdAt: m.createdAt.toISOString()
    }))
  })
}

// POST /api/v1/admin/missions — create mission
// PATCH /api/v1/admin/missions — update mission (id required)
// DELETE /api/v1/admin/missions — deactivate mission
export async function POST(req: NextRequest) {
  const payload = await getAuthUser()
  if (!payload) return unauthorized()
  if (payload.role !== 'ADMIN') return forbidden()

  const body = await req.json().catch(() => null)
  if (!body) return err('Invalid JSON')

  if (body.action === 'create') {
    if (!body.title || !body.description || !body.category) return err('title, description, category required')
    const mission = await db.mission.create({
      data: {
        title: body.title,
        description: body.description,
        instructions: body.instructions || body.description,
        category: body.category,
        difficulty: body.difficulty || 'EASY',
        points: Number(body.points) || 10,
        requiresEvidence: body.requiresEvidence !== false,
        evidenceType: body.evidenceType || 'IMAGE',
        estimatedCo2Kg: body.estimatedCo2Kg ? Number(body.estimatedCo2Kg) : null,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        isActive: body.isActive !== false
      }
    })
    await audit('MISSION_CREATED', 'MISSION', payload.sub, mission.id, JSON.stringify({ title: body.title }))
    return ok({ mission }, 201)
  }

  if (body.action === 'update') {
    if (!body.id) return err('Mission id required')
    const data: Record<string, unknown> = {}
    for (const k of ['title', 'description', 'instructions', 'category', 'difficulty', 'points', 'requiresEvidence', 'evidenceType', 'isActive', 'estimatedCo2Kg']) {
      if (body[k] !== undefined) data[k] = body[k]
    }
    const updated = await db.mission.update({ where: { id: body.id }, data })
    await audit('MISSION_UPDATED', 'MISSION', payload.sub, body.id, JSON.stringify(Object.keys(data)))
    return ok({ mission: updated })
  }

  if (body.action === 'deactivate') {
    if (!body.id) return err('Mission id required')
    await db.mission.update({ where: { id: body.id }, data: { isActive: false } })
    await audit('MISSION_DEACTIVATED', 'MISSION', payload.sub, body.id)
    return ok({ success: true })
  }

  return err('Unknown action')
}
