'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Footprints, Zap, Droplets, Wind, Recycle, TreePine, Sun, ShoppingBag, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react'
import { api, ApiError } from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'

interface Mission {
  id: string
  title: string
  description: string
  instructions: string
  category: string
  difficulty: string
  points: number
  requiresEvidence: boolean
  evidenceType: string
  estimatedCo2Kg: number | null
  startDate: string | null
  endDate: string | null
  submission: { id: string; status: string } | null
}

const CATEGORIES = [
  { key: 'ALL', label: 'All', icon: Footprints },
  { key: 'ELECTRICITY', label: 'Electricity', icon: Zap },
  { key: 'WATER', label: 'Water', icon: Droplets },
  { key: 'TRANSPORT', label: 'Transport', icon: Wind },
  { key: 'WASTE', label: 'Waste', icon: Recycle },
  { key: 'TREE', label: 'Trees', icon: TreePine },
  { key: 'RENEWABLE', label: 'Renewable', icon: Sun },
  { key: 'CONSUMPTION', label: 'Consumption', icon: ShoppingBag }
]

export function MissionsView() {
  const { toast } = useToast()
  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('ALL')
  const [tab, setTab] = useState<'available' | 'submitted'>('available')
  const [submitMission, setSubmitMission] = useState<Mission | null>(null)
  const [evidenceText, setEvidenceText] = useState('')
  const [evidenceFile, setEvidenceFile] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const r = await api.get<{ missions: Mission[] }>(`/missions?category=${category}`)
      setMissions(r.missions)
    } catch {
      setMissions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [category])

  const openSubmit = (m: Mission) => {
    setSubmitMission(m)
    setEvidenceText('')
    setEvidenceFile('')
  }

  const submit = async () => {
    if (!submitMission) return
    setSubmitting(true)
    try {
      await api.post('/missions/submissions', {
        missionId: submitMission.id,
        evidenceText,
        evidenceFile: evidenceFile || undefined
      })
      toast({ title: 'Mission submitted!', description: 'Your evidence is now pending moderator review.' })
      setSubmitMission(null)
      load()
    } catch (e) {
      toast({ title: 'Submission failed', description: e instanceof ApiError ? e.message : 'Unknown error', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  const available = missions.filter(m => !m.submission || m.submission.status === 'REJECTED')
  const submitted = missions.filter(m => m.submission && m.submission.status !== 'REJECTED')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2"><Footprints className="h-7 w-7 text-primary" /> Daily Green Missions</h1>
        <p className="text-muted-foreground">Complete bite-sized Mission LiFE actions. Submit evidence. Moderators verify and award points.</p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as 'available' | 'submitted')}>
        <TabsList>
          <TabsTrigger value="available">Available ({available.length})</TabsTrigger>
          <TabsTrigger value="submitted">My Submissions ({submitted.length})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(c => (
          <button
            key={c.key}
            onClick={() => setCategory(c.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              category === c.key ? 'bg-primary text-primary-foreground border-primary' : 'bg-card hover:bg-accent'
            }`}
          >
            <c.icon className="h-3 w-3" /> {c.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-56 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(tab === 'available' ? available : submitted).map(m => (
            <MissionCard key={m.id} mission={m} onSubmit={() => openSubmit(m)} />
          ))}
          {(tab === 'available' ? available : submitted).length === 0 && (
            <Card className="sm:col-span-2 lg:col-span-3">
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                {tab === 'available' ? 'No missions in this category.' : 'You have no active submissions yet.'}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Submit dialog */}
      <Dialog open={!!submitMission} onOpenChange={(o) => !o && setSubmitMission(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{submitMission?.title}</DialogTitle>
            <DialogDescription>{submitMission?.instructions}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">Submit genuine evidence. False claims may result in disqualification and reversal of awarded points. Duplicate submissions are prevented automatically.</AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="ev-text">Evidence Description *</Label>
              <Textarea
                id="ev-text"
                value={evidenceText}
                onChange={e => setEvidenceText(e.target.value)}
                placeholder="Describe what you did, when, and any measurable impact (e.g. kWh saved, litres of water, kilometres cycled)..."
                rows={4}
                maxLength={1000}
              />
              <div className="text-xs text-muted-foreground">{evidenceText.length}/1000</div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ev-file">Evidence Image URL (optional)</Label>
              <Input id="ev-file" value={evidenceFile} onChange={e => setEvidenceFile(e.target.value)} placeholder="https://..." />
              <p className="text-xs text-muted-foreground">In production this would be a file upload to private storage.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmitMission(null)}>Cancel</Button>
            <Button onClick={submit} disabled={submitting || !evidenceText.trim()}>
              {submitting ? 'Submitting...' : 'Submit for review'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function MissionCard({ mission, onSubmit }: { mission: Mission; onSubmit: () => void }) {
  const cat = CATEGORIES.find(c => c.key === mission.category) || CATEGORIES[0]
  const Icon = cat.icon
  const diffColor = { EASY: 'secondary', MEDIUM: 'default', HARD: 'destructive' }[mission.difficulty] as 'secondary' | 'default' | 'destructive'
  const statusInfo = mission.submission ? {
    PENDING: { label: 'Pending Review', icon: Clock, color: 'text-amber-600' },
    APPROVED: { label: 'Approved', icon: CheckCircle2, color: 'text-primary' },
    REJECTED: { label: 'Rejected', icon: XCircle, color: 'text-destructive' },
    REQUIRES_REVIEW: { label: 'Needs Review', icon: AlertCircle, color: 'text-amber-600' }
  }[mission.submission.status] : null

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex gap-1.5">
            <Badge variant={diffColor} className="text-[10px]">{mission.difficulty}</Badge>
            <Badge variant="outline" className="text-[10px]">+{mission.points} pts</Badge>
          </div>
        </div>
        <CardTitle className="text-base mt-2">{mission.title}</CardTitle>
        <CardDescription className="text-xs line-clamp-2">{mission.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-end gap-3">
        {mission.estimatedCo2Kg && (
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <TreePine className="h-3 w-3" /> Est. impact: {mission.estimatedCo2Kg} kg CO₂
          </div>
        )}
        {statusInfo ? (
          <div className={`flex items-center gap-1.5 text-xs ${statusInfo.color}`}>
            <statusInfo.icon className="h-3.5 w-3.5" /> {statusInfo.label}
          </div>
        ) : null}
        <Button
          size="sm"
          variant={mission.submission && mission.submission.status !== 'REJECTED' ? 'outline' : 'default'}
          onClick={onSubmit}
          disabled={!!mission.submission && mission.submission.status !== 'REJECTED'}
        >
          {mission.submission?.status === 'REJECTED' ? 'Re-submit' :
           mission.submission ? 'Submitted' : 'Start Mission'}
        </Button>
      </CardContent>
    </Card>
  )
}
