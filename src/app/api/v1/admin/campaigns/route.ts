// Admin: campaigns + reports moderation
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, audit } from '@/lib/auth'
import { ok, err, unauthorized, forbidden } from '@/lib/api'

// GET: list campaigns or open reports
export async function GET(req: NextRequest) {
  const payload = await getAuthUser()
  if (!payload) return unauthorized()
  if (payload.role !== 'ADMIN' && payload.role !== 'MODERATOR') return forbidden()

  const { searchParams } = new URL(req.url)
  const resource = searchParams.get('resource') || 'campaigns'

  if (resource === 'reports') {
    const reports = await db.report.findMany({
      where: { status: 'OPEN' },
      include: {
        reporter: { select: { name: true } },
        post: { include: { author: { select: { name: true } } } }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })
    return ok({
      reports: reports.map(r => ({
        id: r.id,
        reason: r.reason,
        details: r.details,
        postId: r.postId,
        postContent: r.post?.content?.slice(0, 200),
        postAuthor: r.post?.author?.name,
        reporter: r.reporter.name,
        status: r.status,
        createdAt: r.createdAt.toISOString()
      }))
    })
  }

  const campaigns = await db.campaign.findMany({
    include: { organizer: { select: { name: true } }, community: { select: { name: true } } },
    orderBy: { startDate: 'desc' },
    take: 50
  })
  return ok({
    campaigns: campaigns.map(c => ({
      id: c.id,
      title: c.title,
      description: c.description,
      organizer: c.organizer.name,
      community: c.community?.name,
      location: c.location,
      status: c.status,
      startDate: c.startDate.toISOString(),
      endDate: c.endDate?.toISOString()
    }))
  })
}

// POST: create campaign or resolve report
export async function POST(req: NextRequest) {
  const payload = await getAuthUser()
  if (!payload) return unauthorized()
  if (payload.role !== 'ADMIN' && payload.role !== 'MODERATOR') return forbidden()

  const body = await req.json().catch(() => null)
  if (!body) return err('Invalid JSON')

  if (body.action === 'create_campaign') {
    if (!body.title || !body.startDate) return err('title and startDate required')
    const campaign = await db.campaign.create({
      data: {
        title: body.title,
        description: body.description || '',
        organizerId: payload.sub,
        communityId: body.communityId || null,
        location: body.location || null,
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : null,
        goal: body.goal || null,
        status: body.status || 'UPCOMING'
      }
    })
    await audit('CAMPAIGN_CREATED', 'CAMPAIGN', payload.sub, campaign.id, JSON.stringify({ title: body.title }))
    return ok({ campaign }, 201)
  }

  if (body.action === 'resolve_report') {
    if (!body.reportId) return err('reportId required')
    const report = await db.report.update({
      where: { id: body.reportId },
      data: {
        status: body.resolution === 'DISMISS' ? 'DISMISSED' : 'RESOLVED',
        resolvedBy: payload.sub,
        resolution: body.note || null
      }
    })
    if (body.resolution === 'HIDE_POST' && report.postId) {
      await db.post.update({ where: { id: report.postId }, data: { isHidden: true } })
    }
    await audit('REPORT_RESOLVED', 'REPORT', payload.sub, body.reportId, JSON.stringify({ resolution: body.resolution }))
    return ok({ report })
  }

  return err('Unknown action')
}
