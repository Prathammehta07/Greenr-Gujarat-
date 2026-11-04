// POST /api/v1/solar — calculate solar feasibility and save assessment
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, audit } from '@/lib/auth'
import { ok, err, unauthorized } from '@/lib/api'
import { calcSolar, getTariff } from '@/lib/calc'

export async function POST(req: NextRequest) {
  const payload = await getAuthUser()
  if (!payload) return unauthorized()

  const body = await req.json().catch(() => null)
  if (!body) return err('Invalid JSON')

  const monthlyKwh = Number(body.monthlyKwh)
  const roofAreaSqm = Number(body.roofAreaSqm)
  const tariff = body.tariff ? Number(body.tariff) : await getTariff()
  const orientation = body.orientation || 'SOUTH'
  const shading = body.shading || 'NONE'
  const location = body.location || 'Gujarat'

  if (!monthlyKwh || monthlyKwh <= 0) return err('Monthly kWh must be positive')
  if (!roofAreaSqm || roofAreaSqm <= 0) return err('Roof area must be positive')
  if (tariff <= 0) return err('Tariff must be positive')

  const result = calcSolar({ monthlyKwh, roofAreaSqm, tariff, orientation, shading })

  const assessment = await db.solarAssessment.create({
    data: {
      userId: payload.sub,
      monthlyKwh,
      roofAreaSqm,
      location,
      tariff,
      orientation,
      shading,
      suggestedCapacityKw: result.suggestedCapacityKw,
      estimatedMonthlyGeneration: result.estimatedMonthlyGeneration,
      estimatedInstallationCost: result.estimatedInstallationCost,
      estimatedAnnualSavings: result.estimatedAnnualSavings,
      estimatedPaybackYears: result.estimatedPaybackYears,
      estimatedCo2ReductionKg: result.estimatedCo2ReductionKg
    }
  })

  await audit('SOLAR_ASSESSED', 'SOLAR_ASSESSMENT', payload.sub, assessment.id, JSON.stringify({ capacity: result.suggestedCapacityKw }))

  return ok({
    assessmentId: assessment.id,
    inputs: { monthlyKwh, roofAreaSqm, location, tariff, orientation, shading },
    results: result,
    assumptions: {
      solarYieldPerKwPerYear: '1,450 kWh (Gujarat average)',
      systemLossFactor: '0.80 (inverter, wiring, soiling, temperature)',
      costPerKw: '₹55,000/kW (rooftop PV benchmark, before subsidy)',
      orientationFactor: orientation === 'SOUTH' ? '1.0' : orientation === 'FLAT' ? '0.95' : '0.85',
      shadingFactor: shading === 'NONE' ? '1.0' : shading === 'LIGHT' ? '0.92' : shading === 'MODERATE' ? '0.80' : '0.60',
      emissionFactor: '0.71 kg CO₂/kWh (India grid average)',
    },
    note: 'All figures are estimates based on documented assumptions and your inputs. They are NOT an official subsidy quote or guaranteed installation price. Always verify with GEDA-approved vendors.'
  }, 201)
}
