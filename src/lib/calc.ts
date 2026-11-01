// Calculation engine for GREEN GUJARAT
// All formulas documented and configurable via SystemSettings.

import { db } from './db'

export const DEFAULT_EMISSION_FACTOR = 0.71 // kg CO2 per kWh (India grid avg)
export const DEFAULT_TARIFF = 7.5 // INR per kWh (Gujarat residential avg)
export const SOLAR_COST_PER_KW = 55000 // INR per kW installed (RTPV benchmark)
export const SOLAR_YIELD_PER_KW_PER_YEAR = 1450 // kWh per kW per year (Gujarat)
export const SOLAR_SYSTEM_LOSS = 0.8 // derate for losses
export const SOLAR_ROOF_PER_KW = 8 // sqm per kW

export async function getEmissionFactor(): Promise<number> {
  const setting = await db.systemSetting.findUnique({ where: { key: 'EMISSION_FACTOR_KG_PER_KWH' } })
  return setting ? Number(setting.value) : DEFAULT_EMISSION_FACTOR
}

export async function getTariff(): Promise<number> {
  const setting = await db.systemSetting.findUnique({ where: { key: 'DEFAULT_TARIFF' } })
  return setting ? Number(setting.value) : DEFAULT_TARIFF
}

// Electricity emissions = kWh consumed × emission factor
export function calcEmissions(kwh: number, factor: number): number {
  return Math.max(0, kwh * factor)
}

// Electricity savings = comparable baseline − current consumption
export function calcSavings(baselineKwh: number, currentKwh: number): { kwh: number; percent: number } {
  const kwh = Math.max(0, baselineKwh - currentKwh)
  const percent = baselineKwh > 0 ? (kwh / baselineKwh) * 100 : 0
  return { kwh, percent }
}

// Green Score: weighted from points + savings + verified actions
export function calcGreenScore(totalPoints: number, savingsKwh: number, missionsCompleted: number): number {
  const pointsPart = Math.min(40, totalPoints * 0.2)
  const savingsPart = Math.min(40, savingsKwh * 0.2)
  const missionsPart = Math.min(20, missionsCompleted * 1)
  return Math.round(pointsPart + savingsPart + missionsPart)
}

// Solar payback = installation cost / annual net savings
export function calcSolarPayback(installationCost: number, annualSavings: number): number {
  if (annualSavings <= 0) return 0
  return installationCost / annualSavings
}

// AI Energy Doctor — analyse monthly series and detect anomalies
export interface EnergyAnalysis {
  trend: 'INCREASING' | 'DECREASING' | 'STABLE'
  avgKwh: number
  maxKwh: number
  minKwh: number
  anomalies: { month: string; kwh: number; reason: string }[]
  recommendations: {
    appliance: string
    title: string
    detail: string
    estimatedSavingKwh: number
    estimatedSavingRs: number
  }[]
}

export function analyseEnergy(records: { month: string; kwh: number }[], tariff: number): EnergyAnalysis {
  if (records.length === 0) {
    return {
      trend: 'STABLE', avgKwh: 0, maxKwh: 0, minKwh: 0,
      anomalies: [], recommendations: []
    }
  }
  const sorted = [...records].sort((a, b) => a.month.localeCompare(b.month))
  const kwhs = sorted.map(r => r.kwh)
  const avg = kwhs.reduce((a, b) => a + b, 0) / kwhs.length
  const max = Math.max(...kwhs)
  const min = Math.min(...kwhs)

  // trend: compare last vs first half
  const half = Math.floor(sorted.length / 2)
  const firstHalf = sorted.slice(0, half || 1)
  const secondHalf = sorted.slice(half)
  const firstAvg = firstHalf.reduce((a, b) => a + b.kwh, 0) / (firstHalf.length || 1)
  const secondAvg = secondHalf.reduce((a, b) => a + b.kwh, 0) / (secondHalf.length || 1)
  let trend: EnergyAnalysis['trend'] = 'STABLE'
  const deltaPct = firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0
  if (deltaPct > 8) trend = 'INCREASING'
  else if (deltaPct < -8) trend = 'DECREASING'

  // anomalies: any month > 25% above average
  const anomalies: EnergyAnalysis['anomalies'] = []
  for (const r of sorted) {
    if (avg > 0 && r.kwh > avg * 1.25) {
      anomalies.push({ month: r.month, kwh: r.kwh, reason: `${Math.round((r.kwh / avg - 1) * 100)}% above your average` })
    }
  }

  // recommendations
  const recommendations: EnergyAnalysis['recommendations'][] = []
  if (avg > 0) {
    // AC: assume AC ~ 35% of summer consumption, 1.5 unit/hr
    const acShare = 0.35
    const acKwh = avg * acShare
    if (acKwh > 60) {
      recommendations.push({
        appliance: 'Air Conditioner',
        title: 'Optimise AC temperature',
        detail: 'Setting AC to 24°C instead of 22°C saves ~6% per degree. Service filters monthly for 5–15% savings. Use timer to switch off after 4 hours of sleep.',
        estimatedSavingKwh: Math.round(acKwh * 0.18),
        estimatedSavingRs: Math.round(acKwh * 0.18 * tariff)
      })
    }
    // Refrigerator
    recommendations.push({
      appliance: 'Refrigerator',
      title: 'Improve refrigerator efficiency',
      detail: 'Keep temperature at 3–4°C, defrost regularly, ensure 5cm clearance for ventilation, and avoid opening frequently. Old (>10y) fridges consume 2x newer 5-star units.',
      estimatedSavingKwh: Math.round(avg * 0.08),
      estimatedSavingRs: Math.round(avg * 0.08 * tariff)
    })
    // Lighting
    recommendations.push({
      appliance: 'Lighting',
      title: 'Switch to LED and motion sensors',
      detail: 'LEDs use 75% less energy than incandescent and last 25x longer. Add motion sensors in stairwells, bathrooms, and outdoor areas.',
      estimatedSavingKwh: Math.round(avg * 0.12),
      estimatedSavingRs: Math.round(avg * 0.12 * tariff)
    })
    // Other appliances
    if (trend === 'INCREASING') {
      recommendations.push({
        appliance: 'Standby Power',
        title: 'Reduce phantom/standby loads',
        detail: 'Devices on standby (TV, charger, gaming consoles) can draw 5–10% of total. Use smart power strips to cut off idle devices.',
        estimatedSavingKwh: Math.round(avg * 0.07),
        estimatedSavingRs: Math.round(avg * 0.07 * tariff)
      })
    }
    // Geyser/heater (winter)
    recommendations.push({
      appliance: 'Water Heater',
      title: 'Use solar or instant water heater',
      detail: 'Storage geysers waste energy reheating. Switch to solar water heater (subsidised under PM-Surya Ghar) or instant geyser for 60% savings on water heating.',
      estimatedSavingKwh: Math.round(avg * 0.10),
      estimatedSavingRs: Math.round(avg * 0.10 * tariff)
    })
  }

  return { trend, avgKwh: Math.round(avg), maxKwh: max, minKwh: min, anomalies, recommendations }
}

// Solar assessment
export interface SolarResult {
  suggestedCapacityKw: number
  estimatedMonthlyGeneration: number
  estimatedInstallationCost: number
  estimatedAnnualSavings: number
  estimatedPaybackYears: number
  estimatedCo2ReductionKg: number
}

export function calcSolar(params: {
  monthlyKwh: number
  roofAreaSqm: number
  tariff: number
  orientation: string
  shading: string
}): SolarResult {
  const annualKwh = params.monthlyKwh * 12
  const orientationFactor = params.orientation === 'SOUTH' ? 1.0 : params.orientation === 'FLAT' ? 0.95 : 0.85
  const shadingFactor = params.shading === 'NONE' ? 1.0 : params.shading === 'LIGHT' ? 0.92 : params.shading === 'MODERATE' ? 0.80 : 0.6

  // capacity needed to cover ~80% of consumption
  const targetAnnualGeneration = annualKwh * 0.8
  const capacityFromDemand = targetAnnualGeneration / (SOLAR_YIELD_PER_KW_PER_YEAR * SOLAR_SYSTEM_LOSS * orientationFactor * shadingFactor)
  const capacityFromRoof = params.roofAreaSqm / SOLAR_ROOF_PER_KW
  const suggestedCapacityKw = Math.max(1, Math.min(capacityFromDemand, capacityFromRoof))
  // round to nearest 0.5
  const roundedCapacity = Math.round(suggestedCapacityKw * 2) / 2

  const annualGeneration = roundedCapacity * SOLAR_YIELD_PER_KW_PER_YEAR * SOLAR_SYSTEM_LOSS * orientationFactor * shadingFactor
  const monthlyGeneration = annualGeneration / 12
  const annualSavings = Math.min(annualGeneration, annualKwh) * params.tariff
  const installationCost = roundedCapacity * SOLAR_COST_PER_KW
  const payback = calcSolarPayback(installationCost, annualSavings)
  const co2Reduction = annualGeneration * DEFAULT_EMISSION_FACTOR

  return {
    suggestedCapacityKw: roundedCapacity,
    estimatedMonthlyGeneration: Math.round(monthlyGeneration),
    estimatedInstallationCost: Math.round(installationCost),
    estimatedAnnualSavings: Math.round(annualSavings),
    estimatedPaybackYears: Math.round(payback * 10) / 10,
    estimatedCo2ReductionKg: Math.round(co2Reduction)
  }
}
