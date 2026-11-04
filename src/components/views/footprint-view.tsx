'use client'
import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  BarChart, Bar, AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid
} from 'recharts'
import { Footprints, Zap, Leaf, TrendingDown, ScanLine, ArrowRight, TreePine, Droplets, Wind } from 'lucide-react'
import { api } from '@/lib/api-client'
import { useRouter } from '@/lib/router'

interface FootprintData {
  monthlyKwh: number
  monthlyEmissionKg: number
  savingsKwh: number
  savingsPercent: number
  monthlyConsumption: { month: string; kwh: number; baseline: number }[]
  totals: { totalKwh: number; totalSavings: number; totalEmissions: number }
}

export function FootprintView() {
  const router = useRouter()
  const [data, setData] = useState<FootprintData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<FootprintData>('/dashboard')
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
    )
  }

  const chartData = (data?.monthlyConsumption || []).map(m => {
    const parts = m.month.split('-')
    const formatted = parts.length === 2 ? `${parts[1]}/${parts[0].slice(2)}` : m.month
    return {
      month: formatted,
      kwh: m.kwh,
      baseline: m.baseline,
      saved: Math.max(0, m.baseline - m.kwh),
      emission: Math.round(m.kwh * 0.71)
    }
  })

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#16834A] to-[#0f6036] p-6 lg:p-8 text-white shadow-md">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold uppercase tracking-wider mb-2 text-emerald-100">
            <Footprints className="h-3.5 w-3.5" /> Carbon & Energy Footprint
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
            My Ecological Footprint
          </h1>
          <p className="text-sm text-emerald-50 mt-1">
            Analyze your household electricity consumption, carbon intensity factor (0.71 kg CO₂/kWh), and verify monthly reductions against Gujarat Mission LiFE goals.
          </p>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-slate-200/80 shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Monthly Consumption</span>
              <Zap className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-slate-900">{data?.monthlyKwh || 0} kWh</div>
            <p className="text-xs text-slate-500 mt-1">Grid electricity recorded</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Total Carbon Saved</span>
              <Leaf className="h-4 w-4 text-[#16834A]" />
            </div>
            <div className="text-2xl font-black text-[#16834A]">
              {Math.round((data?.totals?.totalSavings || 0) * 0.71)} kg CO₂
            </div>
            <p className="text-xs text-emerald-700 font-semibold mt-1">Verified cumulative emission reduction</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Equivalent Trees</span>
              <TreePine className="h-4 w-4 text-emerald-700" />
            </div>
            <div className="text-2xl font-black text-emerald-900">
              {Math.max(1, Math.round(((data?.totals?.totalSavings || 0) * 0.71) / 10))} Trees
            </div>
            <p className="text-xs text-slate-500 mt-1">Annual tree carbon absorption equivalent</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Consumption & Emissions Chart */}
      <Card className="border-slate-200/80 shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-slate-900">
              Monthly kWh & CO₂ Emission Trend
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Your electricity consumption vs household baseline target over the past months
            </CardDescription>
          </div>
          <Button
            size="sm"
            onClick={() => router.navigate('scanner')}
            className="bg-[#16834A] hover:bg-[#126b3c] text-white text-xs h-8"
          >
            <ScanLine className="h-3.5 w-3.5 mr-1" /> Add New Bill
          </Button>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="kwhGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16834A" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#16834A" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} unit=" kWh" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="baseline" name="Baseline Target" stroke="#94A3B8" strokeDasharray="4 4" fill="transparent" strokeWidth={2} />
                <Area type="monotone" dataKey="kwh" name="Electricity Consumed" stroke="#16834A" fill="url(#kwhGrad)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
