// Helper for consistent API responses
import { NextResponse } from 'next/server'

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status })
}

export function err(message: string, status = 400, code?: string) {
  return NextResponse.json({ error: message, code }, { status })
}

export function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export function forbidden() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

export function notFound(message = 'Not found') {
  return NextResponse.json({ error: message }, { status: 404 })
}

// In-memory rate limiter (per IP per minute) — simple, works in serverless too
const RATE_BUCKETS = new Map<string, { count: number; resetAt: number }>()
const LIMIT = Number(process.env.RATE_LIMIT_PER_MIN || 120)

export function rateLimit(ip: string): boolean {
  const now = Date.now()
  const bucket = RATE_BUCKETS.get(ip)
  if (!bucket || bucket.resetAt < now) {
    RATE_BUCKETS.set(ip, { count: 1, resetAt: now + 60_000 })
    return true
  }
  if (bucket.count >= LIMIT) return false
  bucket.count++
  return true
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return 'unknown'
}
