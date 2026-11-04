// POST /api/v1/ai-chat — EcoMitra AI assistant
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, audit } from '@/lib/auth'
import { ok, err, unauthorized, rateLimit, getClientIp } from '@/lib/api'
import { llmReply } from '@/lib/eco-engine'
import type { Language } from '@/types'

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (!rateLimit(ip)) return err('Too many requests', 429)

  const payload = await getAuthUser()
  if (!payload) return unauthorized()

  const body = await req.json().catch(() => null)
  if (!body?.message) return err('Message is required')

  const lang = (body.language || 'en') as Language
  const history = Array.isArray(body.history) ? body.history : []

  const { reply, isFallback } = await llmReply(body.message, lang, history)

  await audit('AI_CHAT', 'CHAT', payload.sub, undefined, JSON.stringify({ messageLen: body.message.length, lang, isFallback }))

  return ok({
    reply,
    isFallback,
    provider: process.env.LLM_PROVIDER || 'demo',
    disclaimer: 'EcoMitra provides general guidance. Savings and carbon estimates are approximate. For verified government schemes, subsidies, tariffs, or vendor approvals, please consult official GEDA/GERC sources.'
  })
}
