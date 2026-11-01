'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts'
import { BookUser, Award, Trophy, Footprints, Download, Sparkles, Leaf, CheckCircle2, Clock } from 'lucide-react'
import { api } from '@/lib/api-client'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/hooks/use-toast'
import { jsPDF } from 'jspdf'

interface PassportData {
  badges: { id: string; code: string; name: string; description: string; icon: string; color: string; criteria: string; points: number; earned: boolean; earnedAt?: string }[]
  earnedCount: number
}
interface PointsData {
  balance: number
  totalAwarded: number
  totalReversed: number
  transactions: { id: string; points: number; reason: string; sourceType: string; balanceAfter: number; timestamp: string }[]
}
interface SubmissionsData {
  submissions: { id: string; missionId: string; title: string; category: string; points: number; status: string; awardedPoints: number; createdAt: string; reviewedAt?: string }[]
}

export function PassportView() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [badges, setBadges] = useState<PassportData | null>(null)
  const [points, setPoints] = useState<PointsData | null>(null)
  const [subs, setSubs] = useState<SubmissionsData | null>(null)

  useEffect(() => {
    Promise.all([
      api.get<PassportData>('/badges'),
      api.get<PointsData>('/points?limit=20'),
      api.get<SubmissionsData>('/missions/submissions')
    ]).then(([b, p, s]) => {
      setBadges(b); setPoints(p); setSubs(s)
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2"><BookUser className="h-7 w-7 text-primary" /> Green Action Passport</h1>
          <p className="text-muted-foreground">Your personal digital sustainability record — verified actions, badges, and progress.</p>
        </div>
        <Button onClick={downloadCertificate}><Download className="h-4 w-4 mr-1" /> Download Certificate</Button>
      </div>

      {/* Hero stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <HeroStat icon={Trophy} label="Green Points" value={points?.balance ?? 0} sub={`${points?.totalAwarded ?? 0} awarded`} />
        <HeroStat icon={Footprints} label="Verified Missions" value={approved.length} sub={`${(subs?.submissions.length || 0) - approved.length} pending`} />
        <HeroStat icon={Award} label="Badges Earned" value={badges?.earnedCount ?? 0} sub={`${(badges?.badges.length || 0) - (badges?.earnedCount || 0)} locked`} />
        <HeroStat icon={Leaf} label="Est. CO₂ Cut (kg)" value={Math.round((points?.totalAwarded ?? 0) * 0.5)} sub="approximate" />
      </div>

      <Alert>
        <Sparkles className="h-4 w-4" />
        <AlertDescription>
          <strong>Verified activity records</strong> (missions, badges, points) are separate from <strong>estimated environmental impact</strong> (CO₂, kWh saved). Estimates use documented assumptions and are clearly labelled.
        </AlertDescription>
      </Alert>

      {/* Badges grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Award className="h-5 w-5 text-primary" /> Badge Collection</CardTitle>
          <CardDescription>Unlock badges by completing missions and milestones.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {badges?.badges.map(b => (
              <div key={b.id} className={`p-4 rounded-xl border text-center transition-all ${b.earned ? 'border-primary/40 bg-accent/30' : 'opacity-50 grayscale'}`}>
                <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-2" style={{ backgroundColor: b.color + '20' }}>
                  {b.earned ? <CheckCircle2 className="h-7 w-7" style={{ color: b.color }} /> : <Clock className="h-7 w-7 text-muted-foreground" />}
                </div>
                <div className="font-semibold text-sm">{b.name}</div>
                <div className="text-xs text-muted-foreground mt-1">{b.description}</div>
                {b.earned && b.earnedAt && (
                  <div className="text-[10px] text-primary mt-2">Earned {new Date(b.earnedAt).toLocaleDateString()}</div>
                )}
                {b.points > 0 && <Badge variant="outline" className="mt-2 text-[10px]">+{b.points} pts</Badge>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly progress + Timeline */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Points Earned</CardTitle>
            <CardDescription>Last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyPoints.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No activity yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyPoints}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="points" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sustainability Timeline</CardTitle>
            <CardDescription>Your recent verified and pending actions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[260px] overflow-y-auto scroll-thin">
            {timeline.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No activity yet. Start a mission!</p>
            ) : (
              timeline.map(s => (
                <div key={s.id} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${s.status === 'APPROVED' ? 'bg-primary/10' : s.status === 'PENDING' ? 'bg-amber-100' : 'bg-muted'}`}>
                    {s.status === 'APPROVED' ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Clock className="h-4 w-4 text-amber-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{s.title}</div>
                    <div className="text-xs text-muted-foreground">{new Date(s.createdAt).toLocaleDateString()} · {s.status}</div>
                  </div>
                  {s.status === 'APPROVED' && <Badge variant="default" className="text-xs">+{s.points}</Badge>}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function HeroStat({ icon: Icon, label, value, sub }: { icon: React.ElementType; label: string; value: number; sub: string }) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">{label}</span>
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div className="text-3xl font-bold">{value}</div>
        <div className="text-xs text-muted-foreground mt-1">{sub}</div>
      </CardContent>
    </Card>
  )
}
