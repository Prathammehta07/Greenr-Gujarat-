'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Trophy, Users, School, GraduationCap, Building2, Crown, Medal, Award, Info } from 'lucide-react'
import { api } from '@/lib/api-client'
import { useAuth } from '@/lib/auth-context'

interface Entry { rank: number; name: string; district?: string; points: number; missionsCompleted?: number; isCurrentUser?: boolean; isSample?: boolean }
interface Response { type: string; period: string; entries: Entry[]; scoringRules: string }

export function LeaderboardView() {
  const { user } = useAuth()
  const [type, setType] = useState('citizen')
  const [period, setPeriod] = useState('alltime')
  const [data, setData] = useState<Response | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get<Response>(`/leaderboard?type=${type}&period=${period}`).then(setData).catch(() => setData(null)).finally(() => setLoading(false))
  }, [type, period])

  const typeTabs = [
    { key: 'citizen', label: 'Citizens', icon: Users },
    { key: 'district', label: 'Districts', icon: Building2 },
    { key: 'school', label: 'Schools', icon: School },
    { key: 'college', label: 'Colleges', icon: GraduationCap },
    { key: 'community', label: 'Communities', icon: Trophy }
  ]
  const periodTabs = [
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'alltime', label: 'All Time' }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2"><Trophy className="h-7 w-7 text-primary" /> Green Gujarat Leaderboard</h1>
        <p className="text-muted-foreground">Top performers across citizens, districts, schools, colleges, and communities.</p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Only citizens who opted into public leaderboards appear here, with anonymised display names. Spam, duplicate claims, and unfair point inflation are prevented at the API level.
        </AlertDescription>
      </Alert>

      <Tabs value={type} onValueChange={setType}>
        <TabsList className="flex-wrap h-auto">
          {typeTabs.map(t => <TabsTrigger key={t.key} value={t.key} className="flex items-center gap-1.5"><t.icon className="h-3 w-3" /> {t.label}</TabsTrigger>)}
        </TabsList>
      </Tabs>

      <Tabs value={period} onValueChange={setPeriod}>
        <TabsList>
          {periodTabs.map(p => <TabsTrigger key={p.key} value={p.key}>{p.label}</TabsTrigger>)}
        </TabsList>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>{typeTabs.find(t => t.key === type)?.label} Leaderboard</CardTitle>
          <CardDescription>{data?.scoringRules}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />)}</div>
          ) : !data || data.entries.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              <Trophy className="h-10 w-10 mx-auto mb-3 opacity-30" />
              No entries yet. Be the first!
            </div>
          ) : (
            <div className="space-y-2">
              {/* Top 3 podium */}
              {data.entries.length >= 3 && type === 'citizen' && (
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[1, 0, 2].map(idx => {
                    const e = data.entries[idx]
                    if (!e) return null
                    const medal = idx === 0 ? { Icon: Crown, color: 'text-amber-500', bg: 'bg-amber-50' } :
                                  idx === 1 ? { Icon: Medal, color: 'text-slate-400', bg: 'bg-slate-50' } :
                                  { Icon: Award, color: 'text-orange-700', bg: 'bg-orange-50' }
                    return (
                      <div key={e.rank} className={`p-4 rounded-xl text-center ${medal.bg} ${idx === 0 ? 'sm:scale-105' : ''}`}>
                        <medal.Icon className={`h-7 w-7 mx-auto mb-2 ${medal.color}`} />
                        <div className="font-semibold text-sm truncate">{e.name}</div>
                        {e.district && <div className="text-xs text-muted-foreground">{e.district}</div>}
                        <div className="font-bold text-primary mt-1">{e.points}</div>
                      </div>
                    )
                  })}
                </div>
              )}
              {/* All entries */}
              {data.entries.slice(type === 'citizen' ? 3 : 0).map(e => (
                <div
                  key={`${e.rank}-${e.name}`}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${e.isCurrentUser ? 'border-primary bg-accent/40' : 'bg-card'}`}
                >
                  <div className="w-8 text-center font-bold text-sm text-muted-foreground">#{e.rank}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{e.name} {e.isCurrentUser && <Badge variant="outline" className="text-[10px] ml-1">You</Badge>}</div>
                    {e.district && <div className="text-xs text-muted-foreground">{e.district}</div>}
                    {e.isSample && <Badge variant="secondary" className="text-[10px] mt-0.5">Sample</Badge>}
                  </div>
                  {e.missionsCompleted !== undefined && (
                    <div className="text-xs text-muted-foreground hidden sm:block">{e.missionsCompleted} missions</div>
                  )}
                  <div className="font-bold text-primary">{e.points} pts</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
