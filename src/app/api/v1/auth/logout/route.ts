// POST /api/v1/auth/logout
import { ok } from '@/lib/api'

export async function POST() {
  const res = ok({ success: true })
  res.cookies.delete('gg_access_token')
  res.cookies.delete('gg_refresh_token')
  return res
}
