// GET & PATCH /api/v1/notifications
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { ok, err, unauthorized } from '@/lib/api'

export async function GET() {
  const payload = await getAuthUser()
  if (!payload) return unauthorized()

  let notifications = await db.notification.findMany({
    where: { userId: payload.sub },
    orderBy: { createdAt: 'desc' },
    take: 30
  })

  // If new user with 0 notifications, seed a few helpful welcome notifications
  if (notifications.length === 0) {
    const welcomeNotifs = [
      {
        userId: payload.sub,
        title: 'Welcome to GREEN GUJARAT!',
        message: 'Begin your Mission LiFE journey. Choose your first daily mission and start earning Green Points.',
        type: 'INFO',
        link: 'missions'
      },
      {
        userId: payload.sub,
        title: 'Energy Tip from AI Doctor',
        message: 'Setting your AC to 24°C saves up to 24% electricity and cuts household CO2 emissions.',
        type: 'AWARD',
        link: 'doctor'
      },
      {
        userId: payload.sub,
        title: 'Smart Solar Rooftop Policy',
        message: 'Check your rooftop solar potential with Gujarat PM Surya Ghar Muft Bijli Yojana subsidies.',
        type: 'SUCCESS',
        link: 'solar'
      }
    ]

    for (const notif of welcomeNotifs) {
      await db.notification.create({ data: notif })
    }

    notifications = await db.notification.findMany({
      where: { userId: payload.sub },
      orderBy: { createdAt: 'desc' },
      take: 30
    })
  }

  return ok({
    notifications: notifications.map(n => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      isRead: n.isRead,
      link: n.link,
      createdAt: n.createdAt.toISOString()
    }))
  })
}

export async function PATCH(req: NextRequest) {
  const payload = await getAuthUser()
  if (!payload) return unauthorized()

  const body = await req.json().catch(() => null)
  const id = body?.id

  if (id) {
    await db.notification.updateMany({
      where: { id, userId: payload.sub },
      data: { isRead: true }
    })
  } else {
    // mark all as read
    await db.notification.updateMany({
      where: { userId: payload.sub },
      data: { isRead: true }
    })
  }

  return ok({ success: true })
}
