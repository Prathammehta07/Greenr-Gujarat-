'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
  RadialBar, RadialBarChart, PolarAngleAxis
} from 'recharts'
import {
  Zap, Leaf, TrendingDown, Trophy, Footprints, Lightbulb, ArrowRight,
  Award, AlertTriangle, Sparkles, Activity, Wind, Sun, ScanLine
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

  useEffect(() => {
    api.get<DashboardData>('/dashboard').then(d => setData(d)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="grid lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
      </div>
    )
  }
  if (!data) return <div>Failed to load dashboard.</div>

  const scoreData = [{ name: 'score', value: data.greenScore, fill: 'hsl(var(--primary))' }]
  const chartData = data.monthlyConsumption.map(m => ({
    month: m.month.split('-')[1] + '/' + m.month.split('-')[0].slice(2),
    kwh: m.kwh,
    baseline: m.baseline
  }))

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Welcome back, {user?.name.split(' ')[0]} 👋</h1>
          <p className="text-muted-foreground">Here's your sustainability snapshot for this month.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.navigate('scanner')}><ScanLineIcon /> Scan Bill</Button>
          <Button onClick={() => router.navigate('missions')}><Footprints className="h-4 w-4 mr-1" /> Browse Missions</Button>
        </div>
      </div>

      {/* Top row: Green Score + KPIs */}
      <div className="grid lg:grid-cols-4 gap-4">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardDescription>Green Score</CardDescription>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-primary">{data.greenScore}</span>
              <span className="text-sm text-muted-foreground">/ 100</span>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={80}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="65%" outerRadius="100%" data={scoreData} startAngle={90} endAngle={-270}>
                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                <RadialBar background dataKey="value" cornerRadius={10} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="text-xs text-center text-muted-foreground -mt-1">
              {data.greenScore >= 75 ? 'Sustainability Leader 🌟' : data.greenScore >= 50 ? 'Doing Great 🌱' : data.greenScore >= 25 ? 'Getting Started 🌿' : 'Take your first step!'}
            </div>
          </CardContent>
        </Card>

        <KpiCard
          icon={Zap}
          label="This Month Usage"
          value={`${data.monthlyKwh}`}
          unit="kWh"
          color="text-amber-600"
          sub={data.monthlyKwh > 0 ? `${data.monthlyEmissionKg} kg CO₂` : 'Scan a bill to begin'}
          onClick={() => router.navigate('scanner')}
        />
        <KpiCard
          icon={TrendingDown}
          label="Saved vs Baseline"
          value={data.savingsKwh > 0 ? `${data.savingsKwh}` : '0'}
          unit="kWh"
          color="text-primary"
          sub={data.savingsKwh > 0 ? `${data.savingsPercent}% reduction 🎉` : 'Start saving to see impact'}
          onClick={() => router.navigate('doctor')}
        />
        <KpiCard
          icon={Trophy}
          label="Green Points"
          value={`${data.pointsBalance}`}
          unit="pts"
          color="text-secondary"
          sub={`${data.missionsCompleted} missions · ${data.badgesCount} badges`}
          onClick={() => router.navigate('passport')}
        />
      </div>

      {/* Charts + AI suggestions */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Monthly Electricity Consumption</CardTitle>
                <CardDescription>Last 6 months vs your baseline</CardDescription>
              </div>
              {data.aiAnalysis.trend === 'INCREASING' && (
                <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" /> Increasing</Badge>
              )}
              {data.aiAnalysis.trend === 'DECREASING' && (
                <Badge className="bg-primary"><TrendingDown className="h-3 w-3 mr-1" /> Improving</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <EmptyChart onScan={() => router.navigate('scanner')} />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="gKwh" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gBase" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                  />
                  <Area type="monotone" dataKey="baseline" stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" fill="url(#gBase)" name="Baseline" />
                  <Area type="monotone" dataKey="kwh" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#gKwh)" name="Your Usage" />
                </AreaChart>
              </ResponsiveContainer>
            )}
            {data.aiAnalysis.anomalies.length > 0 && (
              <Alert className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>AI Energy Doctor noticed:</strong> {data.aiAnalysis.anomalies.length} month(s) with unusually high consumption.
                  <Button variant="link" size="sm" className="h-auto p-0 ml-1" onClick={() => router.navigate('doctor')}>See analysis</Button>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">AI Energy Tips</CardTitle>
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <CardDescription>Personalised for your usage pattern</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[300px] overflow-y-auto scroll-thin">
            {data.aiSuggestions.length === 0 ? (
              <div className="text-sm text-muted-foreground py-8 text-center">
                <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
                Scan your bill to get personalised recommendations.
              </div>
            ) : (
              data.aiSuggestions.slice(0, 4).map(s => (
                <div key={s.id} className="p-3 rounded-lg bg-accent/50 border border-accent">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{s.title}</div>
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{s.detail}</div>
                      <div className="flex gap-3 mt-2 text-xs">
                        <span className="text-primary font-medium">Save ~{s.estimatedSavingKwh} kWh/yr</span>
                        <span className="text-muted-foreground">≈ ₹{s.estimatedSavingRs}/yr</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            <Button variant="outline" size="sm" className="w-full" onClick={() => router.navigate('doctor')}>
              Open Energy Doctor <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Active missions + Recent activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Active Missions</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => router.navigate('missions')}>View all</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.activeMissions.length === 0 ? (
              <div className="text-sm text-muted-foreground py-8 text-center">
                <Footprints className="h-8 w-8 mx-auto mb-2 opacity-50" />
                No active missions yet.
                <Button variant="link" size="sm" className="block mx-auto" onClick={() => router.navigate('missions')}>Browse missions</Button>
              </div>
            ) : (
              data.activeMissions.map(m => (
                <div key={m.id} className="p-3 border rounded-lg hover:bg-accent/30 cursor-pointer" onClick={() => router.navigate('missions')}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CategoryIcon category={m.category} />
                      <span className="font-medium text-sm">{m.title}</span>
                    </div>
                    <Badge variant={m.status === 'PENDING' ? 'secondary' : 'outline'} className="text-xs">{m.status}</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={m.progress} className="h-1.5 flex-1" />
                    <span className="text-xs text-muted-foreground">{m.points} pts</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[300px] overflow-y-auto scroll-thin">
            {data.recentActivities.length === 0 ? (
              <div className="text-sm text-muted-foreground py-8 text-center">No recent activity.</div>
            ) : (
              data.recentActivities.map(a => (
                <div key={a.id} className="flex items-start gap-3 py-2 border-b last:border-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${a.points > 0 ? 'bg-primary/10' : 'bg-destructive/10'}`}>
                    {a.points > 0 ? <Plus /> : <Minus />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm">{a.description}</div>
                    <div className="text-xs text-muted-foreground">{new Date(a.timestamp).toLocaleDateString()} · {a.type}</div>
                  </div>
                  <Badge variant={a.points > 0 ? 'default' : 'destructive'} className="text-xs">+{a.points}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Badges strip */}
      {data.badges.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2"><Award className="h-4 w-4 text-primary" /> Your Badges</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => router.navigate('passport')}>View passport</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 overflow-x-auto scroll-thin pb-2">
              {data.badges.map(b => (
                <div key={b.code} className="flex flex-col items-center gap-1 min-w-[80px]">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: b.color + '20' }}>
                    <span className="font-bold text-lg" style={{ color: b.color }}>{b.name[0]}</span>
                  </div>
                  <div className="text-xs text-center text-muted-foreground">{b.name}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function KpiCard({ icon: Icon, label, value, unit, color, sub, onClick }: {
  icon: React.ElementType; label: string; value: string; unit: string; color: string; sub: string; onClick?: () => void
}) {
  return (
    <Card className={onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} onClick={onClick}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardDescription>{label}</CardDescription>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold">{value}</span>
          <span className="text-sm text-muted-foreground">{unit}</span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-xs text-muted-foreground">{sub}</div>
      </CardContent>
    </Card>
  )
}

function EmptyChart({ onScan }: { onScan: () => void }) {
  return (
    <div className="h-[260px] flex flex-col items-center justify-center text-center">
      <Zap className="h-12 w-12 text-muted-foreground/30 mb-3" />
      <p className="text-sm text-muted-foreground mb-3">No consumption data yet. Scan your electricity bill to start tracking.</p>
      <Button size="sm" onClick={onScan}><ScanLineIcon /> Scan your first bill</Button>
    </div>
  )
}

function ScanLineIcon() {
  return <span className="mr-1 inline-flex items-center"><ScanLine className="h-4 w-4" /></span>
}

function Plus() { return <span className="text-primary text-xs font-bold">+</span> }
function Minus() { return <span className="text-destructive text-xs font-bold">−</span> }

export function CategoryIcon({ category }: { category: string }) {
  const map: Record<string, React.ElementType> = {
    ELECTRICITY: Zap, WATER: Leaf, TRANSPORT: Wind, WASTE: Leaf,
    TREE: Leaf, RENEWABLE: Sun, CONSUMPTION: Leaf
  }
  const Icon = map[category] || Leaf
  return <Icon className="h-4 w-4 text-primary" />
}
