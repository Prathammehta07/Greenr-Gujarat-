'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, ReferenceLine } from 'recharts'
import { Stethoscope, TrendingUp, TrendingDown, Minus, AlertTriangle, Lightbulb, Zap, Wind, Snowflake, Lamp, WashingMachine } from 'lucide-react'
import { api } from '@/lib/api-client'

interface DoctorData {
  trend: string
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
  chart: { month: string; kwh: number; baseline: number }[]
  emissionFactor: number
  tariff: number
}

const APPLIANCE_ICONS: Record<string, React.ElementType> = {
  'Air Conditioner': Snowflake,
  'Refrigerator': Wind,
  'Lighting': Lamp,
  'Standby Power': Zap,
  'Water Heater': Zap,
  'Washing Machine': WashingMachine
}

export function DoctorView() {
  const [data, setData] = useState<DoctorData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<any>('/dashboard').then(d => {
      // transform dashboard into doctor format
      const chart = d.monthlyConsumption.map(m => ({ month: m.month, kwh: m.kwh, baseline: m.baseline }))
      setData({
        trend: d.aiAnalysis.trend,
        avgKwh: d.aiAnalysis.avgKwh,
        maxKwh: Math.max(...chart.map(c => c.kwh), 0),
        minKwh: chart.length ? Math.min(...chart.map(c => c.kwh)) : 0,
        anomalies: d.aiAnalysis.anomalies,
        recommendations: d.aiSuggestions.map(s => ({
          appliance: s.appliance,
          title: s.title,
          detail: s.detail,
          estimatedSavingKwh: s.estimatedSavingKwh,
          estimatedSavingRs: s.estimatedSavingRs
        })),
        chart,
        emissionFactor: 0.71,
        tariff: 7.5
      })
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="grid lg:grid-cols-3 gap-6">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />)}</div>
  if (!data || data.chart.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl lg:text-3xl font-bold">AI Energy Doctor</h1>
        <Card>
          <CardContent className="py-16 text-center">
            <Stethoscope className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
            <h3 className="font-semibold mb-1">No consumption data yet</h3>
            <p className="text-sm text-muted-foreground">Scan at least one electricity bill so the Energy Doctor can analyse your usage pattern and detect anomalies.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const trendMeta = {
    INCREASING: { label: 'Increasing', color: 'destructive', icon: TrendingUp, msg: 'Your consumption is rising — review the recommendations below.' },
    DECREASING: { label: 'Improving', color: 'default', icon: TrendingDown, msg: 'Great work! Your consumption is trending down.' },
    STABLE: { label: 'Stable', color: 'secondary', icon: Minus, msg: 'Your consumption is steady. Look for hidden savings.' }
  }[data.trend] || { label: data.trend, color: 'secondary', icon: Minus, msg: '' }

  const chartData = data.chart.map(c => ({
    month: c.month.split('-')[1] + '/' + c.month.split('-')[0].slice(2),
    kwh: c.kwh,
    baseline: c.baseline
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2"><Stethoscope className="h-7 w-7 text-primary" /> AI Energy Doctor</h1>
        <p className="text-muted-foreground">Personalised analysis of your electricity consumption with appliance-level recommendations.</p>
      </div>

      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertDescription>
          Analysis is based on your <strong>uploaded bill history</strong>, not real-time smart-meter data. Estimated savings are transparent assumptions — verify before acting.
        </AlertDescription>
      </Alert>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="Avg Monthly" value={`${data.avgKwh}`} unit="kWh" />
        <SummaryCard label="Highest Month" value={`${data.maxKwh}`} unit="kWh" />
        <SummaryCard label="Lowest Month" value={`${data.minKwh}`} unit="kWh" />
        <SummaryCard label="Trend" value={trendMeta.label} icon={trendMeta.icon} color={data.trend === 'DECREASING' ? 'text-primary' : data.trend === 'INCREASING' ? 'text-destructive' : 'text-muted-foreground'} />
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Consumption vs Baseline</CardTitle>
          <CardDescription>Dashed line = your baseline (rolling average). Bars = actual consumption.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} unit=" kWh" />
              <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <ReferenceLine y={data.avgKwh} stroke="#94a3b8" strokeDasharray="6 4" label={{ value: 'Avg', fontSize: 10, position: 'right', fill: '#64748b' }} />
              <Bar dataKey="kwh" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={48} name="Your Usage (kWh)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Anomalies */}
      {data.anomalies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-500" /> Anomalies Detected</CardTitle>
            <CardDescription>Months with consumption significantly above your average.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.anomalies.map((a, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div>
                  <div className="font-medium text-sm">{a.month}</div>
                  <div className="text-xs text-muted-foreground">{a.reason}</div>
                </div>
                <Badge variant="destructive">{a.kwh} kWh</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Lightbulb className="h-5 w-5 text-primary" /> Personalised Recommendations</h2>
        <div className="grid lg:grid-cols-2 gap-4">
          {data.recommendations.map((r, i) => {
            const Icon = APPLIANCE_ICONS[r.appliance] || Zap
            return (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{r.title}</h3>
                        <Badge variant="outline" className="text-xs">{r.appliance}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{r.detail}</p>
                      <div className="flex gap-4 text-xs">
                        <div>
                          <div className="text-muted-foreground">Est. annual saving</div>
                          <div className="font-bold text-primary">{r.estimatedSavingKwh} kWh</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">≈ ₹/year</div>
                          <div className="font-bold text-primary">₹{r.estimatedSavingRs}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">CO₂ cut</div>
                          <div className="font-bold text-primary">{Math.round(r.estimatedSavingKwh * 0.71)} kg</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function SummaryCard({ label, value, unit, icon: Icon, color }: { label: string; value: string; unit?: string; icon?: React.ElementType; color?: string }) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className={`flex items-center gap-1 mt-1 ${color || ''}`}>
          {Icon && <Icon className="h-4 w-4" />}
          <span className="text-2xl font-bold">{value}</span>
          {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
        </div>
      </CardContent>
    </Card>
  )
}
