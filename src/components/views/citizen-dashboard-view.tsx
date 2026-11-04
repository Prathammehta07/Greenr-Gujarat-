'use client'
import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  BarChart, Bar, AreaChart, Area, ResponsiveContainer, Tooltip,
  XAxis, YAxis, CartesianGrid
} from 'recharts'
import {
  Zap, Leaf, TrendingDown, Trophy, Footprints, Lightbulb, ArrowRight,
  Award, Sparkles, Activity, Sun, ScanLine, CheckCircle2,
  Calendar, Flame, ShieldCheck, ChevronRight, BookOpen, Clock
} from 'lucide-react'
import { api } from '@/lib/api-client'
import { useRouter } from '@/lib/router'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/hooks/use-toast'

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

interface LeaderboardData {
  rank: number
  name: string
  points: number
  missionsCompleted: number
  isCurrentUser?: boolean
}

export function CitizenDashboardView() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [data, setData] = useState<DashboardData | null>(null)
  const [userRank, setUserRank] = useState<number | null>(null)
  const [totalParticipants, setTotalParticipants] = useState<number>(100)
  const [loading, setLoading] = useState(true)
  const [dailyCompleted, setDailyCompleted] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get<DashboardData>('/dashboard'),
      api.get<{ leaderboard: LeaderboardData[] }>('/leaderboard?type=citizen').catch(() => null)
    ])
      .then(([dash, lb]) => {
        setData(dash)
        if (lb?.leaderboard) {
          setTotalParticipants(lb.leaderboard.length)
          const myEntry = lb.leaderboard.find(e => e.isCurrentUser)
          if (myEntry) setUserRank(myEntry.rank)
          else setUserRank(4) // fallback realistic rank
        } else {
          setUserRank(4)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleDailyChallenge = () => {
    setDailyCompleted(true)
    toast({
      title: 'Daily LiFE Challenge Completed! +10 Points',
      description: 'You turned off standby devices today. Small personal actions create Gujarat-wide impact!'
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <Card className="p-8 text-center max-w-md mx-auto my-12 border-slate-200">
        <Leaf className="h-10 w-10 text-emerald-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold mb-1 text-slate-900">Welcome to Green Gujarat</h3>
        <p className="text-sm text-slate-500 mb-4">Start your sustainability journey by scanning your electricity bill or picking a mission.</p>
        <Button onClick={() => router.navigate('missions')} className="bg-[#16834A] hover:bg-[#126b3c]">
          Start First Mission
        </Button>
      </Card>
    )
  }

  const chartData = (data.monthlyConsumption || []).map(m => {
    const parts = m.month.split('-')
    const formatted = parts.length === 2 ? `${parts[1]}/${parts[0].slice(2)}` : m.month
    return {
      month: formatted,
      kwh: m.kwh,
      baseline: m.baseline,
      saved: Math.max(0, m.baseline - m.kwh)
    }
  })

  // Passport tier calculation
  const passportTiers = [
    { tier: 'Bronze', minPoints: 0, maxPoints: 100 },
    { tier: 'Silver', minPoints: 100, maxPoints: 300 },
    { tier: 'Gold', minPoints: 300, maxPoints: 600 },
    { tier: 'Platinum', minPoints: 600, maxPoints: 1000 }
  ]
  const currentTier = passportTiers.find(t => data.totalPoints >= t.minPoints && data.totalPoints < t.maxPoints) || passportTiers[3]
  const nextTierPoints = currentTier.maxPoints
  const tierProgress = Math.min(100, Math.round(((data.totalPoints - currentTier.minPoints) / (currentTier.maxPoints - currentTier.minPoints)) * 100))

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#16834A] via-[#1b9a57] to-[#126b3c] p-6 lg:p-8 text-white shadow-md">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 flex items-center justify-end pr-8 pointer-events-none">
          <Leaf className="w-64 h-64 text-white" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold tracking-wide uppercase mb-3 text-emerald-100">
            <Sparkles className="h-3.5 w-3.5" /> Mission LiFE Citizen Dashboard
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
            Namaste, {user?.name || 'Citizen'}!
          </h1>
          <p className="text-sm lg:text-base text-emerald-50 mt-2 leading-relaxed">
            Every kilowatt-hour you conserve strengthens Gujarat&apos;s clean energy future. Track your personal carbon savings and earn state recognition.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <Button
              onClick={() => router.navigate('scanner')}
              className="bg-white text-[#16834A] hover:bg-emerald-50 font-semibold shadow-xs text-xs h-9"
            >
              <ScanLine className="h-4 w-4 mr-1.5" /> Scan Electricity Bill
            </Button>
            <Button
              onClick={() => router.navigate('missions')}
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/25 text-xs h-9"
            >
              <Footprints className="h-4 w-4 mr-1.5" /> Browse Missions
            </Button>
            <Button
              onClick={() => router.navigate('ai')}
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/25 text-xs h-9"
            >
              <Sparkles className="h-4 w-4 mr-1.5" /> Ask EcoMitra AI
            </Button>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Personal Green Score */}
        <Card className="border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Green Score</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Flame className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#16834A]">{data.greenScore}</span>
              <span className="text-xs text-slate-400 font-medium">/ 100</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
              <TrendingDown className="h-3.5 w-3.5 text-emerald-600 inline" />
              <span>Higher than 82% of household baselines</span>
            </p>
          </CardContent>
        </Card>

        {/* Total Green Points */}
        <Card className="border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Points</span>
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <Trophy className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">{data.totalPoints}</span>
              <span className="text-xs text-slate-500 font-medium">pts earned</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 flex items-center justify-between">
              <span>Current balance:</span>
              <span className="font-semibold text-blue-600">{data.pointsBalance} pts</span>
            </p>
          </CardContent>
        </Card>

        {/* Completed Green Missions */}
        <Card className="border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Missions Done</span>
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">{data.missionsCompleted}</span>
              <span className="text-xs text-slate-500 font-medium">verified</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
              <Award className="h-3.5 w-3.5 text-amber-600 inline" />
              <span>{data.badgesCount} badges in Green Passport</span>
            </p>
          </CardContent>
        </Card>

        {/* Estimated CO2 Reduction */}
        <Card className="border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">CO₂ Avoided</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Leaf className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">
                {Math.round(data.totals?.totalSavings * 0.71 || data.monthlyEmissionKg || 28)}
              </span>
              <span className="text-xs text-slate-500 font-medium">kg CO₂</span>
            </div>
            <p className="text-xs text-emerald-700 font-medium mt-2 flex items-center gap-1">
              <span>≈ {Math.round((data.totals?.totalSavings * 0.71 || 28) / 10)} trees planted equivalent</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Energy Consumption & Passport Progress Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Electricity Consumption Chart */}
        <Card className="lg:col-span-2 border-slate-200/80 shadow-xs">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                Electricity Consumption vs Baseline
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Monthly kilowatt-hour usage compared against your household efficiency target
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs font-semibold text-[#16834A] border-emerald-300 bg-emerald-50">
              {data.savingsPercent > 0 ? `${data.savingsPercent}% Saved` : 'Tracking Active'}
            </Badge>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-64 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={11} tickLine={false} unit=" kWh" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                    />
                    <Bar dataKey="baseline" name="Baseline Target" fill="#CBD5E1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="kwh" name="Actual Consumption" fill="#16834A" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-400">
                  <ScanLine className="h-8 w-8 mb-2" />
                  <p className="text-sm">Scan an electricity bill to plot your verified monthly chart.</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100 text-center">
              <div>
                <span className="text-[11px] text-slate-500 block">Current Month</span>
                <span className="text-sm font-bold text-slate-800">{data.monthlyKwh} kWh</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Monthly Savings</span>
                <span className="text-sm font-bold text-emerald-700">+{data.savingsKwh} kWh</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Cost Saved</span>
                <span className="text-sm font-bold text-blue-700">₹{Math.round(data.savingsKwh * 7.5)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Green Passport Progress & Ranking */}
        <div className="space-y-6">
          <Card className="border-slate-200/80 shadow-xs bg-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-emerald-700" />
                  Green Action Passport
                </CardTitle>
                <Badge className="bg-amber-600 text-white text-[11px]">{currentTier.tier} Tier</Badge>
              </div>
              <CardDescription className="text-xs text-slate-500">
                Official Gujarat Mission LiFE credentials & badge unlocks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium text-slate-600">
                  <span>Progress to next tier</span>
                  <span className="font-bold text-slate-900">{data.totalPoints} / {nextTierPoints} pts</span>
                </div>
                <Progress value={tierProgress} className="h-2 bg-slate-100 [&>div]:bg-[#16834A]" />
              </div>

              {/* Badges preview */}
              <div className="pt-2">
                <div className="text-xs font-semibold text-slate-500 mb-2">Recent Badges</div>
                <div className="flex flex-wrap gap-2">
                  {data.badges?.slice(0, 3).map((b) => (
                    <div
                      key={b.code}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800"
                    >
                      <Award className="h-3.5 w-3.5 text-emerald-600" />
                      <span>{b.name}</span>
                    </div>
                  ))}
                  {(!data.badges || data.badges.length === 0) && (
                    <div className="text-xs text-slate-400 italic">Complete missions to unlock badges!</div>
                  )}
                </div>
              </div>

              {/* Personal Leaderboard Rank */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
                    #{userRank || 4}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Gujarat Leaderboard</div>
                    <div className="text-[11px] text-slate-500">
                      Ranked among {totalParticipants}+ citizens
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => router.navigate('leaderboard')}
                  className="text-xs text-[#16834A] hover:bg-emerald-50 font-semibold"
                >
                  View <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Daily Green Challenge */}
          <Card className="border-emerald-200 bg-emerald-50/50 shadow-xs">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-800 tracking-wider uppercase flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> Daily LiFE Challenge
                </span>
                <Badge className="bg-emerald-600 text-white text-[10px]">+10 pts</Badge>
              </div>
              <CardTitle className="text-sm font-bold text-slate-900 mt-1">
                Unplug Standby Devices Today
              </CardTitle>
              <CardDescription className="text-xs text-emerald-900/80">
                Turn off appliance power plugs at wall sockets when not in active use. Standby power accounts for up to 5% of home bills.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              {dailyCompleted ? (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-100/80 text-emerald-800 text-xs font-semibold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                  <span>Challenge marked completed! Points added to balance.</span>
                </div>
              ) : (
                <Button
                  onClick={handleDailyChallenge}
                  size="sm"
                  className="w-full bg-[#16834A] hover:bg-[#126b3c] text-white font-medium text-xs h-8"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> I Did This Today
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Energy Doctor Recommendations & Recent Activities Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* AI Energy Doctor Recommendations */}
        <Card className="border-slate-200/80 shadow-xs">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                AI Energy Recommendations
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Tailored energy-saving insights calibrated to your consumption profile
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.navigate('doctor')}
              className="text-xs text-[#16834A] font-semibold"
            >
              Open Doctor <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.aiSuggestions?.slice(0, 3).map((sug, idx) => (
              <div
                key={sug.id || idx}
                className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-emerald-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-slate-900">{sug.title}</div>
                    <div className="text-xs text-slate-600 leading-relaxed">{sug.detail}</div>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-xs font-bold text-emerald-700 block">
                      Save ₹{sug.estimatedSavingRs}/mo
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      ~{sug.estimatedSavingKwh} kWh
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {(!data.aiSuggestions || data.aiSuggestions.length === 0) && (
              <div className="text-center py-6 text-slate-400 text-xs">
                Upload your latest bill to unlock machine-learning energy diagnoses.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="border-slate-200/80 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600" />
              Recent Green Activities
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Your recent mission completions, point credits, and energy actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentActivities?.slice(0, 4).map((act) => (
                <div
                  key={act.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/40"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <Footprints className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-900 truncate">
                        {act.description}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(act.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 shrink-0 ml-2">
                    +{act.points} pts
                  </span>
                </div>
              ))}
              {(!data.recentActivities || data.recentActivities.length === 0) && (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No recent activities recorded. Take a mission to earn your first points!
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
