// POST /api/v1/admin/seed-random — Trigger random data generation from Admin Dashboard
import { db } from '@/lib/db'
import { getAuthUser, audit } from '@/lib/auth'
import { ok, unauthorized, forbidden } from '@/lib/api'
import { exec } from 'child_process'
import path from 'path'

export async function POST() {
  const payload = await getAuthUser()
  if (!payload) return unauthorized()
  if (payload.role !== 'ADMIN') return forbidden()

  return new Promise<Response>((resolve) => {
    const scriptPath = path.join(process.cwd(), 'scripts', 'seed-random-data.js')
    exec(`node "${scriptPath}"`, async (error, stdout, stderr) => {
      if (error) {
        return resolve(new Response(JSON.stringify({ error: stderr || error.message }), { status: 500 }))
      }

      await audit('SEED_RANDOM_DATA', 'SYSTEM', payload.sub, undefined, 'Admin triggered random data generation')

      return resolve(
        new Response(
          JSON.stringify({
            success: true,
            message: 'Random data generated successfully!',
            output: stdout
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      )
    })
  })
}

