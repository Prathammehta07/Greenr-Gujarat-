'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts'
import {
  BookUser, Award, Trophy, Footprints, Download, Sparkles, Leaf, CheckCircle2,
  Lock, ScanLine, Users, Shield, Sun, Crown, ChevronRight, ArrowUpRight, Check
} from 'lucide-react'
import { api } from '@/lib/api-client'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/hooks/use-toast'
import { useRouter, type ViewKey } from '@/lib/router'
import { jsPDF } from 'jspdf'

interface PassportData {
  badges: {
    id: string
    code: string
    name: string
    description: string
    icon: string
    color: string
    criteria: string
    points: number
    earned: boolean
    earnedAt?: string
  }[]
  earnedCount: number
}

interface PointsData {
  balance: number
  totalAwarded: number
  totalReversed: number
  transactions: {
    id: string
    points: number
    reason: string
    sourceType: string
    balanceAfter: number
    timestamp: string
  }[]
}

interface SubmissionsData {
  submissions: {
    id: string
    missionId: string
    title: string
    category: string
    points: number
    status: string
    awardedPoints: number
    createdAt: string
    reviewedAt?: string
  }[]
}

export function PassportView() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [badges, setBadges] = useState<PassportData | null>(null)
  const [points, setPoints] = useState<PointsData | null>(null)
  const [subs, setSubs] = useState<SubmissionsData | null>(null)
  const [badgeFilter, setBadgeFilter] = useState<'all' | 'earned' | 'locked'>('all')

  useEffect(() => {
    Promise.all([
      api.get<PassportData>('/badges'),
      api.get<PointsData>('/points?limit=20'),
      api.get<SubmissionsData>('/missions/submissions')
    ]).then(([b, p, s]) => {
      setBadges(b)
      setPoints(p)
      setSubs(s)
    })
  }, [])

  const approved = subs?.submissions.filter(s => s.status === 'APPROVED') || []
  const timeline = (subs?.submissions || []).slice(0, 10)

  const downloadCertificate = () => {
    if (!user) return
    const doc = new jsPDF()
    const month = new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
    // header
    doc.setFillColor(22, 131, 74) // #16834A
    doc.rect(0, 0, 210, 40, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(22)
    doc.text('GREEN GUJARAT', 105, 18, { align: 'center' })
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text('Mission LiFE Citizen Engagement Platform', 105, 28, { align: 'center' })
    doc.setFontSize(9)
    doc.text('Small Actions. Big Impact. One Green Gujarat.', 105, 35, { align: 'center' })
    // title
    doc.setTextColor(20, 20, 20)
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('Green Impact Certificate', 105, 60, { align: 'center' })
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(80, 80, 80)
    doc.text(`Month: ${month}`, 105, 70, { align: 'center' })
    doc.text(`Awarded to: ${user.name}`, 105, 80, { align: 'center' })
    if (user.profile?.districtName) {
      doc.text(`District: ${user.profile.districtName}`, 105, 88, { align: 'center' })
    }
    // stats
    doc.setDrawColor(22, 131, 74)
    doc.setLineWidth(0.5)
    doc.roundedRect(20, 100, 170, 50, 3, 3, 'S')
    doc.setFontSize(10)
    doc.setTextColor(40, 40, 40)
    doc.text('Verified Impact Summary', 105, 110, { align: 'center' })
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(22, 131, 74)
    const colW = 170 / 4
    doc.text(`${points?.balance ?? 0}`, 20 + colW * 0.5, 125, { align: 'center' })
    doc.text(`${approved.length}`, 20 + colW * 1.5, 125, { align: 'center' })
    doc.text(`${badges?.earnedCount ?? 0}`, 20 + colW * 2.5, 125, { align: 'center' })
    doc.text(`${Math.round((points?.totalAwarded ?? 0) * 0.5)}`, 20 + colW * 3.5, 125, { align: 'center' })
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(80, 80, 80)
    doc.text('Green Points', 20 + colW * 0.5, 138, { align: 'center' })
    doc.text('Verified Missions', 20 + colW * 1.5, 138, { align: 'center' })
    doc.text('Badges Earned', 20 + colW * 2.5, 138, { align: 'center' })
    doc.text('Est. kg CO₂ Cut', 20 + colW * 3.5, 138, { align: 'center' })
    // badges list
    const earnedBadges = badges?.badges.filter(b => b.earned) || []
    if (earnedBadges.length > 0) {
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(20, 20, 20)
      doc.text('Badges Earned', 20, 165)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(60, 60, 60)
      let y = 172
      earnedBadges.slice(0, 6).forEach((b, i) => {
        const col = i % 2
        const row = Math.floor(i / 2)
        doc.text(`• ${b.name}`, 25 + col * 85, y + row * 6)
      })
    }
    // footer
    doc.setDrawColor(22, 131, 74)
    doc.setLineWidth(0.3)
    doc.line(20, 250, 190, 250)
    doc.setFontSize(8)
    doc.setTextColor(120, 120, 120)
    doc.text('This certificate recognises verified actions recorded on the GREEN GUJARAT platform.', 105, 256, { align: 'center' })
    doc.text('Estimated environmental impact is separate from verified activity records and is based on documented assumptions.', 105, 261, { align: 'center' })
    doc.text(`Generated: ${new Date().toLocaleString()} · Certificate ID: GG-${user.id.slice(0, 8).toUpperCase()}`, 105, 266, { align: 'center' })
    doc.text('GREEN GUJARAT is a hackathon prototype and is not affiliated with or endorsed by GEDA unless separately authorised.', 105, 271, { align: 'center' })

    doc.save(`GreenGujarat-Certificate-${month.replace(' ', '-')}.pdf`)
    toast({ title: 'Certificate downloaded', description: 'Your monthly Green Impact Certificate has been saved.' })
  }

  // monthly progress chart (last 6 months from transactions)
  const monthlyPoints = (() => {
    const map = new Map<string, number>()
    points?.transactions.forEach(t => {
      const m = t.timestamp.slice(0, 7)
      map.set(m, (map.get(m) || 0) + t.points)
    })
    return Array.from(map.entries()).sort().slice(-6).map(([month, pts]) => ({ month: month.split('-')[1] + '/' + month.slice(2, 4), points: pts }))
  })()

  const allBadges = badges?.badges || []
  const earnedCount = badges?.earnedCount || 0
  const totalBadges = allBadges.length || 8
  const progressPct = totalBadges > 0 ? Math.round((earnedCount / totalBadges) * 100) : 0

  const filteredBadges = allBadges.filter(b => {
    if (badgeFilter === 'earned') return b.earned
    if (badgeFilter === 'locked') return !b.earned
    return true
  })

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <BookUser className="h-7 w-7 text-primary" /> Green Action Passport
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Your official digital sustainability credentials, verified milestone badges, and impact certificate.
          </p>
        </div>
        <Button
          onClick={downloadCertificate}
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm gap-2"
        >
          <Download className="h-4 w-4" /> Download Certificate
        </Button>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ModernHeroStat
          icon={Trophy}
          label="Green Points"
          value={points?.balance ?? 0}
          unit="pts"
          sub={`${points?.totalAwarded ?? 0} total earned`}
          accentColor="bg-blue-500"
          iconBg="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
        />
        <ModernHeroStat
          icon={Footprints}
          label="Verified Missions"
          value={approved.length}
          unit="done"
          sub={`${(subs?.submissions.length || 0) - approved.length} pending review`}
          accentColor="bg-emerald-500"
          iconBg="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
        />
        <ModernHeroStat
          icon={Award}
          label="Badges Unlocked"
          value={earnedCount}
          unit={`/ ${totalBadges}`}
          sub={`${totalBadges - earnedCount} remaining to unlock`}
          accentColor="bg-amber-500"
          iconBg="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
        />
        <ModernHeroStat
          icon={Leaf}
          label="Est. CO₂ Reduced"
          value={Math.round((points?.totalAwarded ?? 0) * 0.5)}
          unit="kg"
          sub="Calculated footprint saving"
          accentColor="bg-teal-500"
          iconBg="bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20"
        />
      </div>

      <Alert className="border-emerald-500/20 bg-emerald-500/5 text-foreground">
        <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        <AlertDescription className="text-xs">
          <strong>Verified activity records</strong> (missions, badges, and points) are certified on the Green Gujarat ledger. Estimated CO₂ savings use certified GEDA baseline multipliers.
        </AlertDescription>
      </Alert>

      {/* Badges Collection Card */}
      <Card className="border border-border/80 shadow-xs overflow-hidden">
        <CardHeader className="pb-4 border-b border-border/50 bg-muted/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" /> Badge Collection
                </CardTitle>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {earnedCount} / {totalBadges} Unlocked
                </span>
              </div>
              <CardDescription className="text-xs text-muted-foreground">
                Official sustainability insignias unlocked through verified eco-missions and milestones
              </CardDescription>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1.5 bg-muted/70 p-1 rounded-lg border border-border/70 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setBadgeFilter('all')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  badgeFilter === 'all'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                All ({allBadges.length})
              </button>
              <button
                type="button"
                onClick={() => setBadgeFilter('earned')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  badgeFilter === 'earned'
                    ? 'bg-background text-emerald-700 dark:text-emerald-300 shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Unlocked ({earnedCount})
              </button>
              <button
                type="button"
                onClick={() => setBadgeFilter('locked')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  badgeFilter === 'locked'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Locked ({totalBadges - earnedCount})
              </button>
            </div>
          </div>

          {/* Overall Badge Collection Progress Bar */}
          <div className="pt-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">Passport Completion</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{progressPct}%</span>
            </div>
            <Progress value={progressPct} className="h-2 bg-muted/70" />
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredBadges.map(b => (
              <BadgeCardItem
                key={b.id}
                badge={b}
                onAction={(route) => router.navigate(route)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly progress + Timeline */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border border-border/80 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold tracking-tight">Monthly Points Earned</CardTitle>
            <CardDescription className="text-xs">Your verified sustainability rewards momentum (Last 6 months)</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {monthlyPoints.length === 0 ? (
              <p className="text-xs text-muted-foreground py-10 text-center">No points activity recorded yet.</p>
            ) : (
              <div className="w-full h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(val: any) => [`${val} pts`, 'Points Earned']}
                    />
                    <Bar dataKey="points" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-border/80 shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold tracking-tight">Sustainability Timeline</CardTitle>
                <CardDescription className="text-xs">Your verified and pending citizen actions</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-xs text-primary h-7" onClick={() => router.navigate('missions')}>
                Browse More <ChevronRight className="h-3 w-3 ml-0.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[260px] overflow-y-auto scroll-thin pt-0">
            {timeline.length === 0 ? (
              <div className="text-xs text-muted-foreground py-10 text-center bg-muted/20 rounded-xl border border-dashed border-border/80">
                <Footprints className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                <p className="font-semibold text-foreground">No missions in timeline</p>
                <p className="mt-0.5 mb-3">Accept a mission to start collecting points & badges.</p>
                <Button size="sm" variant="outline" className="text-xs" onClick={() => router.navigate('missions')}>
                  Explore Missions
                </Button>
              </div>
            ) : (
              timeline.map(s => (
                <div key={s.id} className="flex items-start gap-3 p-2.5 rounded-xl border border-border/60 hover:bg-muted/30 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${s.status === 'APPROVED' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : s.status === 'PENDING' ? 'bg-amber-500/15 text-amber-600' : 'bg-muted text-muted-foreground'}`}>
                    {s.status === 'APPROVED' ? <CheckCircle2 className="h-4 w-4" /> : <ClockIcon />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-foreground truncate">{s.title}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-2">
                      <span>{new Date(s.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span>•</span>
                      <span className={s.status === 'APPROVED' ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-amber-600 font-medium'}>
                        {s.status}
                      </span>
                    </div>
                  </div>
                  {s.status === 'APPROVED' && (
                    <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold">
                      +{s.points} pts
                    </Badge>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/* =========================================================================
   BADGE CARD ITEM
   ========================================================================= */

function BadgeCardItem({
  badge,
  onAction
}: {
  badge: PassportData['badges'][0]
  onAction: (route: ViewKey) => void
}) {
  const Icon = getBadgeIcon(badge.icon, badge.code)
  const hexColor = badge.color?.startsWith('#') ? badge.color : `#${badge.color || '16834A'}`
  const { tier, tierColor } = getBadgeTier(badge.code)
  const action = getBadgeAction(badge.code)

  if (badge.earned) {
    return (
      <div className="relative group rounded-2xl p-4 border-2 border-emerald-500/40 bg-gradient-to-b from-emerald-500/10 via-card to-card shadow-xs hover:shadow-md hover:border-emerald-500/70 transition-all duration-300 flex flex-col justify-between text-center overflow-hidden">
        {/* Ambient Top Glow */}
        <div
          className="absolute -top-12 left-1/2 -translate-x-1/2 w-28 h-28 rounded-full blur-2xl opacity-30 pointer-events-none"
          style={{ backgroundColor: hexColor }}
        />

        {/* Top Badges */}
        <div className="flex items-center justify-between w-full mb-2 z-10">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tierColor}`}>
            {tier}
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
            <Check className="h-3 w-3 stroke-[3]" /> Unlocked
          </span>
        </div>

        {/* Insignia Icon Medal */}
        <div className="my-2 z-10">
          <div
            className="w-16 h-16 rounded-full mx-auto flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-110"
            style={{
              backgroundColor: `${hexColor}20`,
              border: `2px solid ${hexColor}60`
            }}
          >
            <Icon className="h-8 w-8" style={{ color: hexColor }} />
          </div>
        </div>

        {/* Info */}
        <div className="space-y-1 z-10">
          <h3 className="font-extrabold text-sm text-foreground tracking-tight">{badge.name}</h3>
          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
            {badge.description}
          </p>
        </div>

        {/* Footer Details */}
        <div className="pt-3 mt-2 border-t border-border/50 flex flex-col items-center gap-1.5 z-10">
          {badge.earnedAt ? (
            <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
              Unlocked on {new Date(badge.earnedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          ) : (
            <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
              Verified Citizen Milestone
            </span>
          )}
          {badge.points > 0 ? (
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
              +{badge.points} Green Points
            </span>
          ) : (
            <span className="text-[10px] font-medium text-muted-foreground">Honorary Accolade</span>
          )}
        </div>
      </div>
    )
  }

  // Locked Badge
  return (
    <div
      onClick={() => onAction(action.route)}
      className="group relative rounded-2xl p-4 border border-border/70 bg-card/60 hover:bg-card hover:border-primary/40 hover:shadow-xs transition-all duration-300 flex flex-col justify-between text-center cursor-pointer"
    >
      {/* Top Status */}
      <div className="flex items-center justify-between w-full mb-2">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tierColor} opacity-75`}>
          {tier}
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/60">
          <Lock className="h-2.5 w-2.5" /> Locked
        </span>
      </div>

      {/* Insignia Icon Medal (Muted with Lock Overlay) */}
      <div className="my-2 relative">
        <div
          className="w-16 h-16 rounded-full mx-auto flex items-center justify-center bg-muted/60 border border-border/70 text-muted-foreground/60 transition-transform duration-300 group-hover:scale-105 group-hover:text-muted-foreground"
        >
          <Icon className="h-8 w-8" />
        </div>
        <div className="absolute bottom-0 right-1/2 translate-x-7 translate-y-1 w-6 h-6 rounded-full bg-muted/90 border border-border flex items-center justify-center text-muted-foreground shadow-xs">
          <Lock className="h-3 w-3" />
        </div>
      </div>

      {/* Info */}
      <div className="space-y-1">
        <h3 className="font-bold text-sm text-foreground/80 group-hover:text-foreground tracking-tight transition-colors">
          {badge.name}
        </h3>
        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
          {badge.description}
        </p>
      </div>

      {/* Footer Unlock Action */}
      <div className="pt-3 mt-2 border-t border-border/50 space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground font-medium">Reward:</span>
          <span className="font-bold text-foreground">+{badge.points} pts</span>
        </div>
        <div className="text-[11px] font-semibold text-primary flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          <span>{action.label}</span>
          <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </div>
  )
}

/* =========================================================================
   HELPERS & ICON MAP
   ========================================================================= */

function getBadgeIcon(iconName: string, code: string): React.ElementType {
  switch (code) {
    case 'FIRST_STEP': return Footprints
    case 'BILL_SCANNER': return ScanLine
    case 'COMMUNITY_BUILDER': return Users
    case 'GREEN_WARRIOR': return Shield
    case 'CARBON_CONSCIOUS': return Leaf
    case 'ECO_CHAMPION': return Trophy
    case 'SOLAR_PIONEER': return Sun
    case 'GREEN_GUJARATI': return Crown
    default: {
      switch (iconName) {
        case 'Footprints': return Footprints
        case 'ScanLine': return ScanLine
        case 'Users': return Users
        case 'Sword': return Shield
        case 'Leaf': return Leaf
        case 'Trophy': return Trophy
        case 'Sun': return Sun
        case 'Crown': return Crown
        default: return Award
      }
    }
  }
}

function getBadgeTier(code: string): { tier: string; tierColor: string } {
  switch (code) {
    case 'GREEN_GUJARATI':
      return { tier: 'Platinum', tierColor: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30' }
    case 'ECO_CHAMPION':
      return { tier: 'Gold', tierColor: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30' }
    case 'SOLAR_PIONEER':
      return { tier: 'Gold', tierColor: 'bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30' }
    case 'GREEN_WARRIOR':
      return { tier: 'Silver', tierColor: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30' }
    case 'CARBON_CONSCIOUS':
      return { tier: 'Silver', tierColor: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' }
    case 'COMMUNITY_BUILDER':
      return { tier: 'Bronze', tierColor: 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30' }
    case 'BILL_SCANNER':
      return { tier: 'Bronze', tierColor: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30' }
    default:
      return { tier: 'Starter', tierColor: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/20' }
  }
}

function getBadgeAction(code: string): { label: string; route: ViewKey } {
  switch (code) {
    case 'BILL_SCANNER': return { label: 'Go to Scanner', route: 'scanner' }
    case 'SOLAR_PIONEER': return { label: 'Explore Solar', route: 'solar' }
    case 'COMMUNITY_BUILDER': return { label: 'Join Community', route: 'community' }
    case 'CARBON_CONSCIOUS': return { label: 'Cut Carbon', route: 'missions' }
    default: return { label: 'Explore Missions', route: 'missions' }
  }
}

function ModernHeroStat({
  icon: Icon,
  label,
  value,
  unit,
  sub,
  accentColor,
  iconBg
}: {
  icon: React.ElementType
  label: string
  value: number
  unit: string
  sub: string
  accentColor: string
  iconBg: string
}) {
  return (
    <Card className="relative overflow-hidden border border-border/70 hover:border-border hover:shadow-xs transition-all duration-300">
      <div className={`absolute top-0 left-0 right-0 h-[2.5px] ${accentColor}`} />
      <CardContent className="pt-4 pb-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">{label}</span>
          <div className={`p-2 rounded-xl shrink-0 ${iconBg}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-extrabold tracking-tight text-foreground">{value}</span>
          <span className="text-xs font-semibold text-muted-foreground">{unit}</span>
        </div>
        <p className="text-xs text-muted-foreground truncate">{sub}</p>
      </CardContent>
    </Card>
  )
}

function ClockIcon() {
  return <span className="text-xs font-semibold">⏳</span>
}
