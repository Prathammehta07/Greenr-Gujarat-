// POST /api/v1/auth/reset-password
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { ok, err } from '@/lib/api'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body?.token || !body?.password) return err('Token and new password are required')
  if (body.password.length < 8) return err('Password must be at least 8 characters')

  const user = await db.user.findFirst({
    where: {
      passwordResetToken: body.token,
      passwordResetExpires: { gt: new Date() }
    }
  })
  if (!user) return err('Invalid or expired token', 400)

  const passwordHash = await hashPassword(body.password)
  await db.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      passwordResetToken: null,
      passwordResetExpires: null,
    }
  })

  return ok({ success: true, message: 'Password reset successful. Please log in.' })
}
