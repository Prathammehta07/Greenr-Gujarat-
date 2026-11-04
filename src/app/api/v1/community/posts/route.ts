// Community membership + posts combined route
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, audit } from '@/lib/auth'
import { ok, err, unauthorized } from '@/lib/api'

// POST /api/v1/community/[id]/join  — handled via dynamic route below
// For simplicity we handle join/leave and posts in one file at /api/v1/community/posts

// GET /api/v1/community/posts?communityId=...
// POST /api/v1/community/posts { communityId, content, imageUrl, postType }
// POST /api/v1/community/posts/like { postId }
export async function GET(req: NextRequest) {
  const payload = await getAuthUser()
  if (!payload) return unauthorized()

  const { searchParams } = new URL(req.url)
  const communityId = searchParams.get('communityId')

  const where: Record<string, unknown> = { isHidden: false }
  if (communityId) where.communityId = communityId
  else where.OR = [{ communityId: null }, { community: { members: { some: { userId: payload.sub } } } }]

  const posts = await db.post.findMany({
    where,
    orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    take: 50,
    include: {
      author: { select: { id: true, name: true } },
      _count: { select: { comments: true, likes: true } }
    }
  })

  const myLikes = await db.postLike.findMany({
    where: { userId: payload.sub, postId: { in: posts.map(p => p.id) } },
    select: { postId: true }
  })
  const liked = new Set(myLikes.map(l => l.postId))

  return ok({
    posts: posts.map(p => ({
      id: p.id,
      content: p.content,
      imageUrl: p.imageUrl,
      postType: p.postType,
      author: { id: p.author.id, name: p.author.name },
      communityId: p.communityId,
      likeCount: p._count.likes,
      commentCount: p._count.comments,
      isPinned: p.isPinned,
      likedByMe: liked.has(p.id),
      createdAt: p.createdAt.toISOString()
    }))
  })
}

export async function POST(req: NextRequest) {
  const payload = await getAuthUser()
  if (!payload) return unauthorized()

  const body = await req.json().catch(() => null)
  if (!body) return err('Invalid JSON')

  // action: join | leave | post | like | comment | report
  const action = body.action
  if (action === 'join' || action === 'leave') {
    const communityId = body.communityId
    const community = await db.community.findUnique({ where: { id: communityId } })
    if (!community) return err('Community not found', 404)

    if (action === 'join') {
      try {
        await db.communityMember.create({ data: { communityId, userId: payload.sub, role: 'MEMBER' } })
        await db.community.update({ where: { id: communityId }, data: { memberCount: { increment: 1 } } })
        await audit('COMMUNITY_JOINED', 'COMMUNITY', payload.sub, communityId)
        return ok({ joined: true })
      } catch {
        return ok({ joined: true, message: 'Already a member' })
      }
    } else {
      await db.communityMember.deleteMany({ where: { communityId, userId: payload.sub } })
      await db.community.update({ where: { id: communityId }, data: { memberCount: { decrement: 1 } } })
      return ok({ joined: false })
    }
  }

  if (action === 'post') {
    if (!body.content || body.content.trim().length === 0) return err('Content is required')
    if (body.content.length > 2000) return err('Content too long (max 2000 chars)')
    const post = await db.post.create({
      data: {
        authorId: payload.sub,
        communityId: body.communityId || null,
        content: body.content,
        imageUrl: body.imageUrl || null,
        postType: body.postType || 'DISCUSSION'
      }
    })
    await audit('POST_CREATED', 'POST', payload.sub, post.id)
    return ok({ post: { id: post.id, content: post.content, createdAt: post.createdAt.toISOString() } }, 201)
  }

  if (action === 'like') {
    if (!body.postId) return err('postId is required')
    const existing = await db.postLike.findUnique({
      where: { postId_userId: { postId: body.postId, userId: payload.sub } }
    })
    if (existing) {
      await db.postLike.delete({ where: { id: existing.id } })
      await db.post.update({ where: { id: body.postId }, data: { likeCount: { decrement: 1 } } })
      return ok({ liked: false })
    } else {
      await db.postLike.create({ data: { postId: body.postId, userId: payload.sub } })
      await db.post.update({ where: { id: body.postId }, data: { likeCount: { increment: 1 } } })
      return ok({ liked: true }, 201)
    }
  }

  if (action === 'comment') {
    if (!body.postId || !body.content) return err('postId and content are required')
    const comment = await db.comment.create({
      data: { postId: body.postId, authorId: payload.sub, content: body.content }
    })
    await db.post.update({ where: { id: body.postId }, data: { commentCount: { increment: 1 } } })
    return ok({ comment: { id: comment.id, content: comment.content, createdAt: comment.createdAt.toISOString() } }, 201)
  }

  if (action === 'report') {
    if (!body.postId || !body.reason) return err('postId and reason are required')
    const report = await db.report.create({
      data: { reporterId: payload.sub, postId: body.postId, reason: body.reason, details: body.details || null }
    })
    await audit('POST_REPORTED', 'POST', payload.sub, body.postId, JSON.stringify({ reason: body.reason }))
    return ok({ reportId: report.id, message: 'Report submitted for moderation review.' }, 201)
  }

  return err('Unknown action')
}
