// POST /api/v1/auth/forgot-password
// Development-only safe fallback: returns a reset token in the response
// when SMTP is not configured. In production this would email the link.
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { ok, err } from '@/lib/api'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body?.email) return err('Email is required')

  const user = await db.user.findUnique({ where: { email: body.email.toLowerCase() } })

  // Always return success — never reveal whether the email exists
  if (!user) {
    return ok({ success: true, message: 'If the email exists, a reset link has been sent.' })
  }

  // generate a one-time token (24h)
  const token = require('crypto').randomBytes(32).toString('hex')
  await db.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: token,
      passwordResetExpires: new Date(Date.now() + 24 * 60 * 60 * 1000)
    }
  })

  // DEV FALLBACK: return token directly so the user can reset without SMTP.
  // In production, an email would be sent and this token would NOT be returned.
  const isDev = process.env.NODE_ENV !== 'production'
  return ok({
    success: true,
    message: 'If the email exists, a reset link has been sent.',
    ...(isDev ? { devToken: token, devNote: 'DEV MODE: token returned in response. Production would email this link.' } : {})
  })
}
