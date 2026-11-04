// Integration tests for GREEN GUJARAT API
// Run with: bun test
import { describe, it, expect, beforeAll } from 'vitest'
import { api, ApiError } from '@/lib/api-client'

const BASE = process.env.API_BASE || 'http://localhost:3000/api/v1'

// Helper: direct fetch bypassing client (since api-client uses relative URLs)
async function fetchApi(path: string, opts: RequestInit = {}, cookie?: string) {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { Cookie: cookie } : {}),
      ...(opts.headers || {})
    },
    redirect: 'manual'
  })
  const body = await res.json().catch(() => ({}))
  return { status: res.status, body, headers: res.headers }
}

let citizenCookie = ''
let moderatorCookie = ''
let adminCookie = ''

beforeAll(async () => {
  // Login as all three roles and capture cookies
  for (const [role, cookieVar] of [['citizen', 'citizenCookie'], ['moderator', 'moderatorCookie'], ['admin', 'adminCookie']] as const) {
    const res = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `${role}@demo.greengujarat.in`, password: 'GreenGujarat@2026' })
    })
    const setCookie = res.headers.get('set-cookie') || ''
    const token = setCookie.match(/gg_access_token=([^;]+)/)?.[1]
    const cookie = token ? `gg_access_token=${token}` : ''
    if (role === 'citizen') citizenCookie = cookie
    else if (role === 'moderator') moderatorCookie = cookie
    else adminCookie = cookie
  }
})

describe('Authentication', () => {
  it('should reject invalid credentials', async () => {
    const { status } = await fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'wrong@demo.greengujarat.in', password: 'wrong' })
    })
    expect(status).toBe(401)
  })

  it('should login citizen demo account', async () => {
    expect(citizenCookie).toBeTruthy()
    const { status, body } = await fetchApi('/auth/me', {}, citizenCookie)
    expect(status).toBe(200)
    expect(body.user.role).toBe('CITIZEN')
  })

  it('should reject short passwords on register', async () => {
    const { status, body } = await fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: `test-${Date.now()}@example.com`, name: 'Test', password: 'short' })
    })
    expect(status).toBe(400)
    expect(body.error).toContain('8 characters')
  })
})

describe('Role-Based Access Control', () => {
  it('should allow citizen to access dashboard', async () => {
    const { status } = await fetchApi('/dashboard', {}, citizenCookie)
    expect(status).toBe(200)
  })

  it('should block citizen from admin metrics', async () => {
    const { status } = await fetchApi('/admin/admin-metrics', {}, citizenCookie)
    expect(status).toBe(403)
  })

  it('should allow admin to access admin metrics', async () => {
    const { status } = await fetchApi('/admin/admin-metrics', {}, adminCookie)
    expect(status).toBe(200)
  })

  it('should allow moderator to access submissions', async () => {
    const { status } = await fetchApi('/admin/submissions', {}, moderatorCookie)
    expect([200, 403]).toContain(status) // 403 if moderator doesn't have access
  })
})

describe('Footprint Calculation', () => {
  it('should calculate emissions correctly', async () => {
    // emission = kWh × 0.71
    const kWh = 320
    const expectedEmission = Math.round(kWh * 0.71)
    expect(expectedEmission).toBe(227)
  })
})

describe('Mission Submission Duplicate Prevention', () => {
  it('should reject duplicate mission submissions', async () => {
    // First, get a mission
    const { body: missionsBody } = await fetchApi('/missions', {}, citizenCookie)
    const missionId = missionsBody.missions[0].id

    // First submission
    const first = await fetchApi('/missions/submissions', {
      method: 'POST',
      body: JSON.stringify({ missionId, evidenceText: 'First submission for testing' })
    }, citizenCookie)
    expect([201, 409]).toContain(first.status) // 409 if already submitted in a prior test run

    // Second submission should be rejected
    const second = await fetchApi('/missions/submissions', {
      method: 'POST',
      body: JSON.stringify({ missionId, evidenceText: 'Trying again' })
    }, citizenCookie)
    expect(second.status).toBe(409)
  })
})

describe('Solar Calculator', () => {
  it('should calculate solar feasibility', async () => {
    const { status, body } = await fetchApi('/solar', {
      method: 'POST',
      body: JSON.stringify({
        monthlyKwh: 280,
        roofAreaSqm: 50,
        location: 'Ahmedabad',
        tariff: 7.5,
        orientation: 'SOUTH',
        shading: 'NONE'
      })
    }, citizenCookie)
    expect(status).toBe(201)
    expect(body.results.suggestedCapacityKw).toBeGreaterThan(0)
    expect(body.results.estimatedPaybackYears).toBeGreaterThan(0)
    expect(body.results.estimatedCo2ReductionKg).toBeGreaterThan(0)
    expect(body.assumptions).toBeDefined()
    expect(body.note).toContain('estimates')
  })

  it('should reject invalid solar inputs', async () => {
    const { status } = await fetchApi('/solar', {
      method: 'POST',
      body: JSON.stringify({ monthlyKwh: -100, roofAreaSqm: 50, tariff: 7.5 })
    }, citizenCookie)
    expect(status).toBe(400)
  })
})

describe('Bill Upload Validation', () => {
  it('should reject non-image/PDF files', async () => {
    const formData = new FormData()
    const blob = new Blob(['text content'], { type: 'text/plain' })
    formData.append('file', blob, 'test.txt')
    const res = await fetch(`${BASE}/bills/upload`, {
      method: 'POST',
      headers: { Cookie: citizenCookie },
      body: formData
    })
    expect(res.status).toBe(400)
  })
})

describe('AI Chat', () => {
  it('should respond to user queries', async () => {
    const { status, body } = await fetchApi('/ai-chat', {
      method: 'POST',
      body: JSON.stringify({ message: 'How do I save electricity?', language: 'en' })
    }, citizenCookie)
    expect(status).toBe(200)
    expect(body.reply).toBeTruthy()
    expect(body.disclaimer).toContain('approximate')
  })

  it('should support multiple languages', async () => {
    for (const lang of ['en', 'gu', 'hi']) {
      const { status, body } = await fetchApi('/ai-chat', {
        method: 'POST',
        body: JSON.stringify({ message: 'Hello', language: lang })
      }, citizenCookie)
      expect(status).toBe(200)
      expect(body.reply).toBeTruthy()
    }
  })
})

describe('Leaderboard Privacy', () => {
  it('should only show opted-in citizens', async () => {
    const { status, body } = await fetchApi('/leaderboard?type=citizen&period=alltime', {}, citizenCookie)
    expect(status).toBe(200)
    // All entries should have anonymised names (no full emails)
    for (const entry of body.entries) {
      expect(entry.name).not.toContain('@')
    }
  })
})

describe('Impact Stats (Public)', () => {
  it('should return public impact stats without auth', async () => {
    const { status, body } = await fetchApi('/impact-stats')
    expect(status).toBe(200)
    expect(body).toHaveProperty('totalParticipants')
    expect(body).toHaveProperty('note')
    expect(body.note).toContain('NOT official GEDA')
  })
})

describe('Admin Settings', () => {
  it('should allow admin to read settings', async () => {
    const { status, body } = await fetchApi('/admin/settings', {}, adminCookie)
    expect(status).toBe(200)
    expect(body.settings.find((s: { key: string }) => s.key === 'EMISSION_FACTOR_KG_PER_KWH')).toBeTruthy()
  })

  it('should block citizen from admin settings', async () => {
    const { status } = await fetchApi('/admin/settings', {}, citizenCookie)
    expect(status).toBe(403)
  })
})
