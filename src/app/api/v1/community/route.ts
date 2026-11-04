// GET /api/v1/community — list communities
// POST /api/v1/community — create community
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, audit } from '@/lib/auth'
import { ok, err, unauthorized } from '@/lib/api'

export async function GET(req: NextRequest) {
  const payload = await getAuthUser()
  if (!payload) return unauthorized()

  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')

  const where: Record<string, unknown> = {}
  if (category && category !== 'ALL') where.category = category

  const communities = await db.community.findMany({
    where,
    include: {
      _count: { select: { members: true, posts: true } },
      owner: { select: { name: true } }
    },
    orderBy: { memberCount: 'desc' },
    take: 50
  })

  // mark joined
  const myMemberships = await db.communityMember.findMany({
    where: { userId: payload.sub },
    select: { communityId: true }
  })
  const joined = new Set(myMemberships.map(m => m.communityId))

  return ok({
    communities: communities.map(c => ({
      id: c.id,
      name: c.name,
      description: c.description,
      category: c.category,
      owner: c.owner.name,
      members: c._count.members,
      posts: c._count.posts,
      isPrivate: c.isPrivate,
      joined: joined.has(c.id),
      createdAt: c.createdAt.toISOString()
    }))
  })
}

export async function POST(req: NextRequest) {
  const payload = await getAuthUser()
  if (!payload) return unauthorized()

  const body = await req.json().catch(() => null)
  if (!body?.name) return err('Community name is required')

  const community = await db.community.create({
    data: {
      name: body.name,
      description: body.description || '',
      category: body.category || 'GENERAL',
      ownerId: payload.sub,
      isPrivate: Boolean(body.isPrivate),
      members: { create: { userId: payload.sub, role: 'ADMIN' } }
    },
    include: { _count: { select: { members: true } } }
  })

  await audit('COMMUNITY_CREATED', 'COMMUNITY', payload.sub, community.id, JSON.stringify({ name: body.name }))
  return ok({
    community: {
      id: community.id,
      name: community.name,
      description: community.description,
      category: community.category,
      members: community._count.members,
      joined: true
    }
  }, 201)
}
