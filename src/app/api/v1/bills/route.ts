// GET /api/v1/bills — list user's bills
// POST /api/v1/bills — confirm a bill (creates footprint record + may award points)
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, audit } from '@/lib/auth'
import { ok, err, unauthorized } from '@/lib/api'
import { calcEmissions, getEmissionFactor } from '@/lib/calc'

export async function GET() {
  const payload = await getAuthUser()
  if (!payload) return unauthorized()

  const bills = await db.energyBill.findMany({
    where: { userId: payload.sub },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      fileName: true,
      billingPeriod: true,
      unitsConsumed: true,
      amount: true,
      status: true,
      billDate: true,
      createdAt: true
    }
  })

  return ok({ bills })
}

export async function POST(req: NextRequest) {
  const payload = await getAuthUser()
  if (!payload) return unauthorized()

  const body = await req.json().catch(() => null)
  if (!body?.billId) return err('billId is required')

  const bill = await db.energyBill.findUnique({ where: { id: body.billId } })
  if (!bill || bill.userId !== payload.sub) return err('Bill not found', 404)
  if (bill.status === 'CONFIRMED') return err('Bill already confirmed')

  // user-confirmed values (with sensible fallbacks)
  const units = Number(body.unitsConsumed ?? bill.unitsConsumed ?? 0)
  const amount = body.amount !== undefined ? Number(body.amount) : bill.amount
  const period = body.billingPeriod || bill.billingPeriod
  if (!units || units <= 0) return err('Units consumed must be a positive number')

  // derive month string YYYY-MM from period (e.g. "Oct 2025") or billDate
  let month: string
  if (body.month) {
    month = body.month // YYYY-MM
  } else if (period && /\b(20\d{2})\b/.test(period)) {
    const year = period.match(/20\d{2}/)![0]
    const monthMap: Record<string, string> = {
      jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
      jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
    }
    const m = period.toLowerCase().match(/[a-z]{3}/)?.[0]
    month = m ? `${year}-${monthMap[m] || '01'}` : bill.billDate ? bill.billDate.toISOString().slice(0, 7) : new Date().toISOString().slice(0, 7)
  } else {
    month = bill.billDate ? bill.billDate.toISOString().slice(0, 7) : new Date().toISOString().slice(0, 7)
  }

  const emissionFactor = await getEmissionFactor()
  const emissionKg = calcEmissions(units, emissionFactor)

  // baseline: average of prior footprints (or first-time baseline = current × 1.1)
  const prior = await db.footprintRecord.findMany({
    where: { userId: payload.sub, month: { lt: month } },
    orderBy: { month: 'desc' },
    take: 3
  })
  const baselineKwh = prior.length > 0
    ? prior.reduce((s, f) => s + f.electricityKwh, 0) / prior.length
    : units * 1.1

  const savingsKwh = Math.max(0, baselineKwh - units)
  const savingsEmissionKg = savingsKwh * emissionFactor

  // Use a transaction to: update bill, upsert footprint, award points, log audit
  const result = await db.$transaction(async (tx) => {
    // update bill
    const updated = await tx.energyBill.update({
      where: { id: bill.id },
      data: {
        confirmedUnits: units,
        confirmedAmount: amount,
        confirmedPeriod: period,
        status: 'CONFIRMED'
      }
    })

    // upsert footprint (avoid duplicates by unique(userId, month))
    const footprint = await tx.footprintRecord.upsert({
      where: { userId_month: { userId: payload.sub, month } },
      update: {
        electricityKwh: units,
        emissionFactor,
        electricityEmissionKg: emissionKg,
        baselineKwh,
        savingsKwh,
        savingsEmissionKg,
        source: 'BILL_OCR'
      },
      create: {
        userId: payload.sub,
        month,
        electricityKwh: units,
        emissionFactor,
        electricityEmissionKg: emissionKg,
        baselineKwh,
        savingsKwh,
        savingsEmissionKg,
        source: 'BILL_OCR'
      }
    })

    // award points for savings (1 point per kWh saved, max 50/month)
    const savingsPoints = Math.min(50, Math.round(savingsKwh))
    let pointsAwarded = 0
    if (savingsPoints > 0) {
      // check if points already awarded for this bill (prevent duplicates)
      const existingPoints = await tx.greenPoints.findFirst({
        where: { userId: payload.sub, sourceType: 'BILL_SAVING', sourceId: bill.id }
      })
      if (!existingPoints) {
        // current balance
        const lastTx = await tx.greenPoints.findFirst({
          where: { userId: payload.sub },
          orderBy: { createdAt: 'desc' }
        })
        const balance = (lastTx?.balanceAfter ?? 0) + savingsPoints
        await tx.greenPoints.create({
          data: {
            userId: payload.sub,
            points: savingsPoints,
            reason: `Electricity saving: ${Math.round(savingsKwh)} kWh vs baseline (${month})`,
            sourceType: 'BILL_SAVING',
            sourceId: bill.id,
            balanceAfter: balance
          }
        })
        pointsAwarded = savingsPoints
      }
    }

    return { bill: updated, footprint, pointsAwarded }
  })

  await audit('BILL_CONFIRMED', 'ENERGY_BILL', payload.sub, bill.id, JSON.stringify({ units, month, points: result.pointsAwarded }))

  return ok({
    success: true,
    bill: {
      id: result.bill.id,
      status: result.bill.status,
      units: result.bill.confirmedUnits,
      amount: result.bill.confirmedAmount,
      period: result.bill.confirmedPeriod
    },
    footprint: {
      month: result.footprint.month,
      electricityKwh: result.footprint.electricityKwh,
      emissionKg: Math.round(result.footprint.electricityEmissionKg),
      baselineKwh: Math.round(result.footprint.baselineKwh),
      savingsKwh: Math.round(result.footprint.savingsKwh),
      savingsEmissionKg: Math.round(result.footprint.savingsEmissionKg)
    },
    pointsAwarded: result.pointsAwarded,
    note: result.pointsAwarded > 0
      ? `${result.pointsAwarded} green points awarded for ${Math.round(result.footprint.savingsKwh)} kWh saved vs your baseline.`
      : 'No savings vs baseline this month — try the AI Energy Doctor for tips.'
  })
}
