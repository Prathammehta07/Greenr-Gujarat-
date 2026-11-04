'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  BarChart, Bar, AreaChart, Area, ResponsiveContainer, Tooltip,
  XAxis, YAxis, CartesianGrid, ReferenceLine
} from 'recharts'
import {
  Zap, Leaf, TrendingDown, TrendingUp, Trophy, Footprints, Lightbulb, ArrowRight,
  Award, AlertTriangle, Sparkles, Activity, Wind, Sun, ScanLine,
  BarChart3, LineChart as LineChartIcon, Info, ChevronRight, CheckCircle2
} from 'lucide-react'
import { api } from '@/lib/api-client'
import { useRouter } from '@/lib/router'
import { useAuth } from '@/lib/auth-context'

interface DashboardData {
  greenScore: number
  totalPoints: number
  pointsBalance: number
  monthlyKwh: number
  monthlyEmissionKg: number
  savingsKwh: number
  savingsPercent: number
  badgesCount: number
  badges: { code: string; name: string; icon: string; color: string }[]
  activeMissions: { id: string; missionId: string; title: string; category: string; points: number; status: string; progress: number }[]
  missionsCompleted: number
  monthlyConsumption: { month: string; kwh: number; baseline: number }[]
  aiSuggestions: { id: string; title: string; detail: string; estimatedSavingKwh: number; estimatedSavingRs: number; appliance: string }[]
  aiAnalysis: { trend: string; avgKwh: number; anomalies: { month: string; kwh: number; reason: string }[] }
  recentActivities: { id: string; type: string; description: string; points: number; timestamp: string }[]
  totals: { totalKwh: number; totalSavings: number; totalEmissions: number }
}

export function DashboardView() {
  const router = useRouter()
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [chartMode, setChartMode] = useState<'bar' | 'area'>('bar')

  useEffect(() => {
    api.get<DashboardData>('/dashboard')
      .then(d => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-96 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <Card className="p-8 text-center max-w-md mx-auto my-12">
        <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold mb-1">Failed to load dashboard</h3>
        <p className="text-sm text-muted-foreground mb-4">We could not retrieve your sustainability snapshot. Please try refreshing.</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </Card>
    )
  }

  const chartData = (data.monthlyConsumption || []).map(m => {
    const parts = m.month.split('-')
    const formattedLabel = parts.length === 2 ? `${parts[1]}/${parts[0].slice(2)}` : m.month
    return {
      month: formattedLabel,
      fullMonth: m.month,
      kwh: m.kwh,
      baseline: m.baseline,
      saved: Math.max(0, m.baseline - m.kwh),
      excess: Math.max(0, m.kwh - m.baseline)
    }
  })

  const hasSingleDataPoint = chartData.length === 1
  const hasData = chartData.length > 0
  const latestMonthData = hasData ? chartData[chartData.length - 1] : null

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            Welcome back, {user?.name.split(' ')[0]} <span className="inline-block animate-wave">👋</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Your personalized Green Gujarat energy & sustainability command center.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            className="shadow-xs hover:border-primary/50 transition-colors"
            onClick={() => router.navigate('scanner')}
          >
            <ScanLine className="h-4 w-4 mr-1.5 text-primary" />
            Scan Bill
          </Button>
          <Button
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
            onClick={() => router.navigate('missions')}
          >
            <Footprints className="h-4 w-4 mr-1.5" />
            Explore Missions
          </Button>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Green Score Gauge */}
        <GreenScoreCard score={data.greenScore} />

        {/* 2. This Month Usage */}
        <ModernKpiCard
          icon={Zap}
          label="This Month Usage"
          value={`${data.monthlyKwh}`}
          unit="kWh"
          badgeText={data.monthlyKwh > 0 ? `🍃 ${data.monthlyEmissionKg} kg CO₂` : undefined}
          badgeType="warning"
          subText={data.monthlyKwh > 0 ? `Est. ₹${Math.round(data.monthlyKwh * 7.5)}` : 'Scan bill to begin'}
          accentColor="bg-amber-500"
          iconBg="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
          actionText="Upload bill"
          onClick={() => router.navigate('scanner')}
        />

        {/* 3. Saved vs Baseline */}
        <ModernKpiCard
          icon={TrendingDown}
          label="Saved vs Baseline"
          value={data.savingsKwh > 0 ? `${data.savingsKwh}` : '0'}
          unit="kWh"
          badgeText={data.savingsKwh > 0 ? `↓ ${data.savingsPercent}% saved 🎉` : undefined}
          badgeType="success"
          subText={data.savingsKwh > 0 ? `Saved ~₹${Math.round(data.savingsKwh * 7.5)} this cycle` : 'Start saving to see impact'}
          accentColor="bg-emerald-500"
          iconBg="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
          actionText="Energy Doctor"
          onClick={() => router.navigate('doctor')}
        />

        {/* 4. Green Points */}
        <ModernKpiCard
          icon={Trophy}
          label="Green Points"
          value={`${data.pointsBalance}`}
          unit="pts"
          badgeText={`${data.missionsCompleted} mission · ${data.badgesCount} badge`}
          badgeType="info"
          subText="Redeemable in Eco Store"
          accentColor="bg-blue-500"
          iconBg="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
          actionText="View Passport"
          onClick={() => router.navigate('passport')}
        />
      </div>

      {/* Main Section: Consumption Chart + AI Energy Tips */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Electricity Consumption Chart */}
        <Card className="lg:col-span-2 shadow-xs border-border/80 flex flex-col justify-between">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg font-bold tracking-tight">Monthly Electricity Consumption</CardTitle>
                  {data.aiAnalysis.trend === 'INCREASING' && (
                    <Badge variant="destructive" className="text-[11px] gap-1 font-medium">
                      <AlertTriangle className="h-3 w-3" /> Increasing
                    </Badge>
                  )}
                  {data.aiAnalysis.trend === 'DECREASING' && (
                    <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] gap-1 font-medium">
                      <TrendingDown className="h-3 w-3" /> Improving
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Actual consumption (kWh) compared against your calculated baseline
                </CardDescription>
              </div>

              {/* View Toggle */}
              {hasData && (
                <div className="flex items-center bg-muted/60 p-1 rounded-lg border border-border/60 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setChartMode('bar')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                      chartMode === 'bar'
                        ? 'bg-background text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <BarChart3 className="h-3.5 w-3.5 text-primary" />
                    Bar View
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartMode('area')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                      chartMode === 'area'
                        ? 'bg-background text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <LineChartIcon className="h-3.5 w-3.5 text-primary" />
                    Trend Curve
                  </button>
                </div>
              )}
            </div>

            {/* Quick Stats Strip */}
            {latestMonthData && (
              <div className="grid grid-cols-3 gap-2 pt-3 pb-1 border-t border-border/50 text-xs">
                <div className="bg-muted/30 p-2 rounded-lg">
                  <span className="text-muted-foreground block text-[11px]">Latest Bill</span>
                  <span className="font-bold text-foreground text-sm">{latestMonthData.kwh} kWh</span>
                </div>
                <div className="bg-muted/30 p-2 rounded-lg">
                  <span className="text-muted-foreground block text-[11px]">Target Baseline</span>
                  <span className="font-semibold text-muted-foreground text-sm">{Math.round(latestMonthData.baseline)} kWh</span>
                </div>
                <div className={`p-2 rounded-lg ${latestMonthData.saved > 0 ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-amber-500/10 text-amber-700'}`}>
                  <span className="block text-[11px] opacity-80">{latestMonthData.saved > 0 ? 'Net Saved' : 'Variance'}</span>
                  <span className="font-bold text-sm">
                    {latestMonthData.saved > 0 ? `-${Math.round(latestMonthData.saved)} kWh (Saved)` : `+${Math.round(latestMonthData.excess)} kWh`}
                  </span>
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent className="pt-0 space-y-4">
            {!hasData ? (
              <EmptyChart onScan={() => router.navigate('scanner')} />
            ) : (
              <div>
                {/* Single-bill friendly info banner */}
                {hasSingleDataPoint && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 mb-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="text-foreground">
                        Displaying verified usage for <strong>{latestMonthData?.month}</strong> ({latestMonthData?.kwh} kWh vs {Math.round(latestMonthData?.baseline || 0)} kWh baseline).
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2.5 text-xs text-primary font-semibold hover:bg-emerald-500/15 shrink-0 self-start sm:self-auto"
                      onClick={() => router.navigate('scanner')}
                    >
                      + Add Past / Future Bills
                    </Button>
                  </div>
                )}

                {/* Chart Container */}
                <div className="w-full h-[270px]">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartMode === 'bar' ? (
                      <BarChart data={chartData} margin={{ top: 15, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="usageBarGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#059669" />
                          </linearGradient>
                          <linearGradient id="baselineBarGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#cbd5e1" stopOpacity={0.8} />
                            <stop offset="100%" stopColor="#94a3b8" stopOpacity={0.4} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} vertical={false} />
                        <XAxis
                          dataKey="month"
                          tick={{ fontSize: 12, fill: '#64748b' }}
                          axisLine={{ stroke: '#cbd5e1' }}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 12, fill: '#64748b' }}
                          axisLine={false}
                          tickLine={false}
                          unit=" kWh"
                        />
                        <Tooltip content={<CustomChartTooltip />} />
                        <Bar
                          dataKey="baseline"
                          name="Baseline"
                          fill="url(#baselineBarGrad)"
                          radius={[6, 6, 0, 0]}
                          maxBarSize={hasSingleDataPoint ? 52 : 36}
                        />
                        <Bar
                          dataKey="kwh"
                          name="Your Usage"
                          fill="url(#usageBarGrad)"
                          radius={[6, 6, 0, 0]}
                          maxBarSize={hasSingleDataPoint ? 52 : 36}
                        />
                      </BarChart>
                    ) : (
                      <AreaChart data={chartData} margin={{ top: 15, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="areaUsageGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                          </linearGradient>
                          <linearGradient id="areaBaseGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} vertical={false} />
                        <XAxis
                          dataKey="month"
                          tick={{ fontSize: 12, fill: '#64748b' }}
                          axisLine={{ stroke: '#cbd5e1' }}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 12, fill: '#64748b' }}
                          axisLine={false}
                          tickLine={false}
                          unit=" kWh"
                        />
                        <Tooltip content={<CustomChartTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="baseline"
                          name="Baseline"
                          stroke="#94a3b8"
                          strokeWidth={2}
                          strokeDasharray="4 4"
                          fill="url(#areaBaseGrad)"
                          dot={{ r: 5, fill: '#94a3b8', strokeWidth: 1.5, stroke: '#ffffff' }}
                          activeDot={{ r: 7 }}
                        />
                        <Area
                          type="monotone"
                          dataKey="kwh"
                          name="Your Usage"
                          stroke="#059669"
                          strokeWidth={2.5}
                          fill="url(#areaUsageGrad)"
                          dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#ffffff' }}
                          activeDot={{ r: 8 }}
                        />
                      </AreaChart>
                    )}
                  </ResponsiveContainer>
                </div>

                {/* Custom Legend */}
                <div className="flex items-center justify-center gap-6 pt-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block shadow-xs" />
                    <span className="font-medium text-foreground">Your Usage (kWh)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-xs bg-slate-400 inline-block" />
                    <span className="text-muted-foreground">Baseline (kWh)</span>
                  </div>
                </div>
              </div>
            )}

            {data.aiAnalysis.anomalies.length > 0 && (
              <Alert className="border-amber-200 bg-amber-500/10 text-amber-900 dark:text-amber-200">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <AlertDescription className="text-xs">
                  <strong>AI Energy Doctor noticed:</strong> {data.aiAnalysis.anomalies.length} billing cycle(s) with unusually high consumption spikes.
                  <Button variant="link" size="sm" className="h-auto p-0 ml-1 font-semibold text-primary underline" onClick={() => router.navigate('doctor')}>
                    Review diagnosis & fixes →
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* AI Energy Tips Card */}
        <Card className="shadow-xs border-border/80 flex flex-col justify-between">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold tracking-tight flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  AI Energy Tips
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Personalised for your household profile
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-[11px] bg-primary/5 text-primary border-primary/20">
                Live AI
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 flex-1 flex flex-col justify-between pt-0">
            <div className="space-y-2.5 max-h-[310px] overflow-y-auto pr-1 scroll-thin">
              {data.aiSuggestions.length === 0 ? (
                <div className="text-xs text-muted-foreground py-10 text-center">
                  <Lightbulb className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                  <p className="font-medium text-foreground">No suggestions yet</p>
                  <p className="mt-1">Scan your electricity bill to get custom AI energy recommendations.</p>
                </div>
              ) : (
                data.aiSuggestions.slice(0, 3).map((s, idx) => (
                  <div
                    key={s.id || idx}
                    className="p-3 rounded-xl bg-card border border-border/80 hover:border-emerald-500/40 hover:shadow-xs transition-all duration-200"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                        <Lightbulb className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-xs text-foreground tracking-tight">{s.title}</div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                          {s.detail}
                        </p>
                        <div className="flex items-center gap-2 mt-2 pt-1.5 border-t border-border/40 text-[11px]">
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            Save ~{s.estimatedSavingKwh} kWh/yr
                          </span>
                          <span className="text-muted-foreground">≈ ₹{s.estimatedSavingRs}/yr</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2 font-medium border-border/80 hover:border-primary hover:text-primary transition-colors text-xs"
              onClick={() => router.navigate('doctor')}
            >
              Open Full Energy Doctor <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Active Missions + Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Active Missions */}
        <Card className="shadow-xs border-border/80">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold tracking-tight flex items-center gap-2">
                  <Footprints className="h-4 w-4 text-primary" /> Active Missions
                </CardTitle>
                <CardDescription className="text-xs">Missions in progress towards badges & points</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-xs h-8 text-primary" onClick={() => router.navigate('missions')}>
                View all <ChevronRight className="h-3 w-3 ml-0.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {data.activeMissions.length === 0 ? (
              <div className="text-xs text-muted-foreground py-8 text-center bg-muted/20 rounded-xl border border-dashed border-border/70">
                <Footprints className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                <p className="font-semibold text-foreground">No active missions right now</p>
                <p className="mt-0.5 text-muted-foreground mb-3">Accept missions to earn Green Points and district rankings.</p>
                <Button size="sm" variant="outline" className="text-xs" onClick={() => router.navigate('missions')}>
                  Browse Mission Catalog
                </Button>
              </div>
            ) : (
              data.activeMissions.map(m => (
                <div
                  key={m.id}
                  className="p-3 border border-border/70 rounded-xl hover:border-primary/40 hover:bg-muted/30 transition-all duration-200 cursor-pointer"
                  onClick={() => router.navigate('missions')}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-md bg-primary/10 text-primary">
                        <CategoryIcon category={m.category} />
                      </div>
                      <span className="font-semibold text-xs text-foreground">{m.title}</span>
                    </div>
                    <Badge variant={m.status === 'PENDING' ? 'secondary' : 'outline'} className="text-[10px] font-medium">
                      {m.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={m.progress} className="h-1.5 flex-1 bg-muted" />
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">+{m.points} pts</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="shadow-xs border-border/80">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold tracking-tight flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" /> Recent Sustainability Activity
                </CardTitle>
                <CardDescription className="text-xs">Your verified points ledger and achievements</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-xs h-8 text-primary" onClick={() => router.navigate('passport')}>
                Passport <ChevronRight className="h-3 w-3 ml-0.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[300px] overflow-y-auto scroll-thin pt-0">
            {data.recentActivities.length === 0 ? (
              <div className="text-xs text-muted-foreground py-8 text-center bg-muted/20 rounded-xl border border-dashed border-border/70">
                <Activity className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                <p className="font-medium text-foreground">No activity recorded yet</p>
                <p className="mt-0.5">Scan your first bill or complete a mission to see your points ledger.</p>
              </div>
            ) : (
              data.recentActivities.map(a => (
                <div key={a.id} className="flex items-center gap-3 py-2.5 px-2 rounded-lg border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${a.points > 0 ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-destructive/15 text-destructive'}`}>
                    {a.points > 0 ? <Plus /> : <Minus />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-foreground truncate">{a.description}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {new Date(a.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} · {a.type}
                    </div>
                  </div>
                  <Badge variant={a.points > 0 ? 'default' : 'destructive'} className="text-[10px] font-semibold">
                    {a.points > 0 ? `+${a.points}` : a.points} pts
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Badges Strip */}
      {data.badges.length > 0 && (
        <Card className="shadow-xs border-border/80">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold tracking-tight flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" /> Unlocked Badges
                </CardTitle>
                <CardDescription className="text-xs">Your official citizen sustainability accolades</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-xs h-8 text-primary" onClick={() => router.navigate('passport')}>
                View all in Passport <ChevronRight className="h-3 w-3 ml-0.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex gap-4 overflow-x-auto scroll-thin pb-2">
              {data.badges.map(b => (
                <div key={b.code} className="flex flex-col items-center gap-1.5 min-w-[90px] p-2 rounded-xl bg-muted/30 border border-border/60 hover:border-primary/40 transition-colors">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center shadow-xs text-base font-extrabold"
                    style={{ backgroundColor: `${b.color || '#16a34a'}20`, color: b.color || '#16a34a' }}
                  >
                    {b.name[0]}
                  </div>
                  <div className="text-[11px] font-semibold text-center text-foreground line-clamp-1">{b.name}</div>
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-mono">Earned</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

/* =========================================================================
   COMPONENTS
   ========================================================================= */

/** 1. High-end Circular SVG Green Score Gauge */
function GreenScoreCard({ score }: { score: number }) {
  const level = score >= 80 ? { name: 'Eco Champion', badge: '🌟 Level 4', nextTarget: 100 }
    : score >= 60 ? { name: 'Sustainability Pro', badge: '🌿 Level 3', nextTarget: 80 }
    : score >= 35 ? { name: 'Eco Explorer', badge: '🌱 Level 2', nextTarget: 60 }
    : { name: 'Getting Started', badge: '🌱 Level 1', nextTarget: 35 }

  const radius = 34
  const circumference = 2 * Math.PI * radius
  const normalizedScore = Math.min(100, Math.max(0, score))
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference

  return (
    <Card className="relative overflow-hidden border border-emerald-500/25 bg-gradient-to-br from-emerald-500/5 via-card to-card hover:border-emerald-500/50 hover:shadow-md transition-all duration-300">
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardDescription className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
            Green Score
          </CardDescription>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
            {level.badge}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl lg:text-4xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">
                {score}
              </span>
              <span className="text-xs font-semibold text-muted-foreground">/ 100</span>
            </div>
            <p className="text-xs font-semibold text-foreground/90 mt-0.5">{level.name}</p>
          </div>

          {/* SVG Circular Meter */}
          <div className="relative w-18 h-18 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 80 80">
              <circle
                cx="40"
                cy="40"
                r={radius}
                stroke="#e2e8f0"
                strokeWidth="6"
                fill="transparent"
                opacity={0.6}
              />
              <circle
                cx="40"
                cy="40"
                r={radius}
                stroke="url(#scoreGaugeGradient)"
                strokeWidth="6.5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
              />
              <defs>
                <linearGradient id="scoreGaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Leaf className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Target: {level.nextTarget} pts</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
            +{Math.max(0, level.nextTarget - score)} pts to rank up
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

/** 2. Modern KPI Card with Accent Lines and Badges */
function ModernKpiCard({
  icon: Icon,
  label,
  value,
  unit,
  badgeText,
  badgeType = 'default',
  subText,
  accentColor,
  iconBg,
  onClick,
  actionText
}: {
  icon: React.ElementType
  label: string
  value: string
  unit: string
  badgeText?: string
  badgeType?: 'success' | 'warning' | 'info' | 'default'
  subText?: string
  accentColor: string
  iconBg: string
  onClick?: () => void
  actionText?: string
}) {
  return (
    <Card
      onClick={onClick}
      className={`group relative overflow-hidden border border-border/70 hover:border-border hover:shadow-md transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      }`}
    >
      <div className={`absolute top-0 left-0 right-0 h-[2.5px] ${accentColor}`} />
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardDescription className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
            {label}
          </CardDescription>
          <div className={`p-2 rounded-xl shrink-0 transition-transform duration-300 group-hover:scale-105 shadow-xs ${iconBg}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-extrabold tracking-tight text-foreground">{value}</span>
          <span className="text-sm font-semibold text-muted-foreground">{unit}</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 min-h-[22px]">
          {badgeText && (
            <span
              className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                badgeType === 'success'
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                  : badgeType === 'warning'
                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                  : badgeType === 'info'
                  ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/20'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {badgeText}
            </span>
          )}
          {subText && <span className="text-xs text-muted-foreground truncate">{subText}</span>}
        </div>

        {actionText && (
          <div className="pt-1.5 text-[11px] font-semibold text-primary flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            {actionText} <ChevronRight className="h-3 w-3 inline-block transition-transform group-hover:translate-x-0.5" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/** 3. Rich Custom Chart Tooltip */
function CustomChartTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null

  const kwh = payload.find((p: any) => p.dataKey === 'kwh')?.value ?? 0
  const baseline = payload.find((p: any) => p.dataKey === 'baseline')?.value ?? 0
  const diff = baseline - kwh
  const diffPct = baseline > 0 ? Math.round((Math.abs(diff) / baseline) * 100) : 0
  const emissionKg = Math.round(kwh * 0.71)

  return (
    <div className="bg-popover/95 backdrop-blur-md border border-border shadow-xl rounded-xl p-3 text-xs space-y-2 min-w-[200px] z-50">
      <div className="font-semibold text-foreground flex items-center justify-between border-b pb-1.5">
        <span>Cycle: {label}</span>
        <span className="text-[10px] text-muted-foreground font-normal">Electricity Usage</span>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block shadow-xs" />
            Your Usage
          </span>
          <span className="font-bold text-foreground text-sm">{kwh} kWh</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="w-2.5 h-2.5 rounded-xs bg-slate-400 inline-block" />
            Baseline Target
          </span>
          <span className="font-medium text-muted-foreground">{Math.round(baseline)} kWh</span>
        </div>
      </div>

      <div className="pt-1.5 border-t border-border/70 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">Performance:</span>
        {diff > 0 ? (
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
            ↓ {diff} kWh saved ({diffPct}%)
          </span>
        ) : diff < 0 ? (
          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
            ↑ {Math.abs(diff)} kWh higher
          </span>
        ) : (
          <span className="text-[11px] text-muted-foreground">Equal to baseline</span>
        )}
      </div>

      <div className="text-[10px] text-muted-foreground text-right pt-0.5">
        Est. Carbon: ~{emissionKg} kg CO₂
      </div>
    </div>
  )
}

/** 4. Empty State with Clean Action */
function EmptyChart({ onScan }: { onScan: () => void }) {
  return (
    <div className="h-[270px] flex flex-col items-center justify-center text-center p-6 bg-muted/20 rounded-xl border border-dashed border-border/80">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
        <Zap className="h-6 w-6" />
      </div>
      <h4 className="font-bold text-sm text-foreground mb-1">No electricity consumption recorded</h4>
      <p className="text-xs text-muted-foreground max-w-sm mb-4">
        Scan your Gujarat electricity bill (UGVCL, DGVCL, MGVCL, PGVCL, Torrent) to automatically generate your consumption curve and unlock carbon savings.
      </p>
      <Button size="sm" onClick={onScan} className="gap-1.5 shadow-sm text-xs">
        <ScanLine className="h-3.5 w-3.5" />
        Scan Your First Bill
      </Button>
    </div>
  )
}

function Plus() { return <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold">+</span> }
function Minus() { return <span className="text-destructive text-xs font-bold">−</span> }

export function CategoryIcon({ category }: { category: string }) {
  const map: Record<string, React.ElementType> = {
    ELECTRICITY: Zap, WATER: Leaf, TRANSPORT: Wind, WASTE: Leaf,
    TREE: Leaf, RENEWABLE: Sun, CONSUMPTION: Leaf
  }
  const Icon = map[category] || Leaf
  return <Icon className="h-3.5 w-3.5" />
}
