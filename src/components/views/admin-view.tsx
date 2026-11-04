'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, Users, Footprints, Zap, Leaf, AlertTriangle, Flag, Settings, ScrollText, CheckCircle2, XCircle, FileDown, Plus, Pencil, Power } from 'lucide-react'
import { api } from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/lib/auth-context'

interface Metrics {
  totalCitizens: number; monthlyActiveUsers: number; missionsCompleted: number; pendingVerifications: number
  activeCampaigns: number; openReports: number; communities: number; posts: number
  reportedSavingsKwh: number; estimatedCo2ReductionKg: number
  districtParticipation: { district: string; users: number; missions: number; isSample: boolean }[]
}
interface UserRow { id: string; email: string; name: string; role: string; isDemo: boolean; isActive: boolean; preferredLang: string; district?: string; createdAt: string }
interface SubmissionRow { id: string; missionId: string; missionTitle: string; category: string; points: number; userId: string; userName: string; userEmail: string; evidenceText?: string; status: string; reviewNote?: string; createdAt: string }
interface MissionRow { id: string; title: string; category: string; difficulty: string; points: number; isActive: boolean; requiresEvidence: boolean; submissions: number; description?: string }
interface Setting { id: string; key: string; value: string; description?: string; isPublic: boolean }
interface AuditLog { id: string; action: string; resource: string; resourceId?: string; actor: string; details?: string; ipAddress?: string; timestamp: string }
interface ReportRow { id: string; reason: string; details?: string; postId: string; postContent?: string; postAuthor?: string; reporter: string; status: string; createdAt: string }

export function AdminView({ initialTab = 'overview' }: { initialTab?: string } = {}) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [tab, setTab] = useState(initialTab)

  useEffect(() => {
    if (initialTab) setTab(initialTab)
  }, [initialTab])
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [users, setUsers] = useState<UserRow[]>([])
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([])
  const [missions, setMissions] = useState<MissionRow[]>([])
  const [settings, setSettings] = useState<Setting[]>([])
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [reports, setReports] = useState<ReportRow[]>([])
  const [editingUser, setEditingUser] = useState<UserRow | null>(null)
  const [newRole, setNewRole] = useState('')
  const [newActive, setNewActive] = useState(true)
  const [showMissionDialog, setShowMissionDialog] = useState(false)
  const [editMission, setEditMission] = useState<Partial<MissionRow> | null>(null)

  const loadMetrics = () => api.get<Metrics>('/admin/admin-metrics').then(setMetrics).catch(() => {})
  const loadUsers = () => api.get<{ users: UserRow[] }>('/admin/users').then(r => setUsers(r.users)).catch(() => {})
  const loadSubmissions = (status = 'PENDING') => api.get<{ submissions: SubmissionRow[] }>(`/admin/submissions?status=${status}`).then(r => setSubmissions(r.submissions)).catch(() => {})
  const loadMissions = () => api.get<{ missions: MissionRow[] }>('/admin/missions').then(r => setMissions(r.missions)).catch(() => {})
  const loadSettings = () => api.get<{ settings: Setting[] }>('/admin/settings').then(r => setSettings(r.settings)).catch(() => {})
  const loadLogs = () => api.get<{ logs: AuditLog[] }>('/admin/audit-logs?limit=100').then(r => setLogs(r.logs)).catch(() => {})
  const loadReports = () => api.get<{ reports: ReportRow[] }>('/admin/campaigns?resource=reports').then(r => setReports(r.reports)).catch(() => {})

  useEffect(() => {
    if (user?.role !== 'ADMIN' && user?.role !== 'MODERATOR') return
    loadMetrics()
    loadUsers()
    loadSubmissions()
    loadMissions()
    loadSettings()
    loadLogs()
    loadReports()
  }, [user])

  useEffect(() => {
    if (tab === 'users') loadUsers()
  }, [tab])

  if (user?.role !== 'ADMIN' && user?.role !== 'MODERATOR') {
    return <Alert variant="destructive"><AlertDescription>Access denied. Admin or Moderator role required.</AlertDescription></Alert>
  }

  const reviewSubmission = async (id: string, action: 'approve' | 'reject', note?: string) => {
    try {
      await api.post('/admin/submissions', { submissionId: id, action, note })
      toast({ title: action === 'approve' ? 'Submission approved' : 'Submission rejected', description: action === 'approve' ? 'Points awarded to user.' : 'User can re-submit if needed.' })
      loadSubmissions()
      loadMetrics()
    } catch (e) {
      toast({ title: 'Review failed', description: e instanceof Error ? e.message : '', variant: 'destructive' })
    }
  }

  const saveUser = async () => {
    if (!editingUser) return
    try {
      await api.patch('/admin/users', { userId: editingUser.id, role: newRole, isActive: newActive })
      toast({ title: 'User updated' })
      setEditingUser(null)
      loadUsers()
    } catch (e) {
      toast({ title: 'Update failed', description: e instanceof Error ? e.message : '', variant: 'destructive' })
    }
  }

  const saveMission = async () => {
    if (!editMission) return
    try {
      if (editMission.id) {
        await api.post('/admin/missions', { action: 'update', ...editMission })
      } else {
        await api.post('/admin/missions', { action: 'create', ...editMission })
      }
      toast({ title: 'Mission saved' })
      setShowMissionDialog(false); setEditMission(null)
      loadMissions()
    } catch (e) {
      toast({ title: 'Save failed', description: e instanceof Error ? e.message : '', variant: 'destructive' })
    }
  }

  const saveSetting = async (key: string, value: string) => {
    try {
      await api.patch('/admin/settings', { key, value })
      toast({ title: 'Setting updated' })
      loadSettings()
    } catch {}
  }

  const resolveReport = async (id: string, resolution: 'HIDE_POST' | 'DISMISS') => {
    try {
      await api.post('/admin/campaigns', { action: 'resolve_report', reportId: id, resolution })
      toast({ title: 'Report resolved' })
      loadReports()
    } catch {}
  }

  const exportCsv = (rows: unknown[], filename: string) => {
    if (rows.length === 0) return
    const headers = Object.keys(rows[0] as object)
    const csv = [
      headers.join(','),
      ...rows.map(r => headers.map(h => `"${String((r as Record<string, unknown>)[h] ?? '').replace(/"/g, '""')}"`).join(','))
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = filename; a.click()
    URL.revokeObjectURL(url)
    toast({ title: 'CSV exported', description: filename })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2"><Shield className="h-7 w-7 text-primary" /> GEDA Admin Control Center</h1>
          <p className="text-muted-foreground">Manage users, missions, submissions, settings, and audit logs. Server-side RBAC enforced on every endpoint.</p>
        </div>
        <Badge variant="outline" className="text-xs">{user?.role}</Badge>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="submissions">Submissions {metrics?.pendingVerifications ? `(${metrics.pendingVerifications})` : ''}</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="missions">Missions</TabsTrigger>
          <TabsTrigger value="reports">Reports {metrics?.openReports ? `(${metrics.openReports})` : ''}</TabsTrigger>
          {user?.role === 'ADMIN' && <TabsTrigger value="settings">Settings</TabsTrigger>}
          {user?.role === 'ADMIN' && <TabsTrigger value="audit">Audit Logs</TabsTrigger>}
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-4">
          {metrics ? (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                <StatCard icon={Users} label="Citizens" value={metrics.totalCitizens} />
                <StatCard icon={Users} label="Monthly Active" value={metrics.monthlyActiveUsers} />
                <StatCard icon={Footprints} label="Missions Done" value={metrics.missionsCompleted} />
                <StatCard icon={AlertTriangle} label="Pending" value={metrics.pendingVerifications} accent="amber" />
                <StatCard icon={Flag} label="Open Reports" value={metrics.openReports} accent="red" />
                <StatCard icon={Zap} label="kWh Saved" value={metrics.reportedSavingsKwh} />
                <StatCard icon={Leaf} label="kg CO₂ Cut" value={metrics.estimatedCo2ReductionKg} />
                <StatCard icon={Users} label="Communities" value={metrics.communities} />
                <StatCard icon={Users} label="Posts" value={metrics.posts} />
                <StatCard icon={Users} label="Campaigns" value={metrics.activeCampaigns} />
              </div>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Top Districts by Participation</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => exportCsv(metrics.districtParticipation, 'district-participation.csv')}>
                      <FileDown className="h-3 w-3 mr-1" /> Export CSV
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow><TableHead>District</TableHead><TableHead>Users</TableHead><TableHead>Missions</TableHead><TableHead>Data</TableHead></TableRow>
                    </TableHeader>
                    <TableBody>
                      {metrics.districtParticipation.map(d => (
                        <TableRow key={d.district}>
                          <TableCell className="font-medium">{d.district}</TableCell>
                          <TableCell>{d.users}</TableCell>
                          <TableCell>{d.missions}</TableCell>
                          <TableCell>{d.isSample ? <Badge variant="secondary">Sample</Badge> : <Badge>Real</Badge>}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          ) : <div className="h-32 rounded-xl bg-muted animate-pulse" />}
        </TabsContent>

        {/* Submissions */}
        <TabsContent value="submissions" className="space-y-4">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => loadSubmissions('PENDING')}>Pending</Button>
            <Button variant="outline" size="sm" onClick={() => loadSubmissions('APPROVED')}>Approved</Button>
            <Button variant="outline" size="sm" onClick={() => loadSubmissions('REJECTED')}>Rejected</Button>
            <Button variant="outline" size="sm" onClick={() => exportCsv(submissions, 'submissions.csv')} className="ml-auto">
              <FileDown className="h-3 w-3 mr-1" /> Export
            </Button>
          </div>
          {submissions.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">No submissions in this view.</CardContent></Card>
          ) : submissions.map(s => (
            <Card key={s.id}>
              <CardContent className="pt-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-semibold">{s.missionTitle}</div>
                    <div className="text-xs text-muted-foreground">{s.category} · {s.points} pts · by {s.userName} ({s.userEmail})</div>
                    <div className="text-xs text-muted-foreground">{new Date(s.createdAt).toLocaleString()}</div>
                  </div>
                  <Badge variant={s.status === 'PENDING' ? 'secondary' : s.status === 'APPROVED' ? 'default' : 'destructive'}>{s.status}</Badge>
                </div>
                {s.evidenceText && (
                  <div className="p-3 bg-muted rounded-lg text-sm mb-3">
                    <div className="text-xs font-medium text-muted-foreground mb-1">Evidence:</div>
                    {s.evidenceText}
                  </div>
                )}
                {s.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => reviewSubmission(s.id, 'approve')}><CheckCircle2 className="h-3 w-3 mr-1" /> Approve &amp; Award {s.points} pts</Button>
                    <Button size="sm" variant="destructive" onClick={() => reviewSubmission(s.id, 'reject', 'Rejected by moderator')}><XCircle className="h-3 w-3 mr-1" /> Reject</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Users */}
        <TabsContent value="users" className="space-y-4">
          <Button variant="outline" size="sm" onClick={() => exportCsv(users, 'users.csv')}><FileDown className="h-3 w-3 mr-1" /> Export CSV</Button>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead>
                    <TableHead>District</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground text-xs">
                        Loading users from database...
                      </TableCell>
                    </TableRow>
                  ) : users.map(u => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.name} {u.isDemo && <Badge variant="secondary" className="text-[10px] ml-1">Demo</Badge>}</TableCell>
                      <TableCell className="text-xs">{u.email}</TableCell>
                      <TableCell><Badge variant="outline">{u.role}</Badge></TableCell>
                      <TableCell className="text-xs">{u.district || '—'}</TableCell>
                      <TableCell>{u.isActive ? <Badge>Active</Badge> : <Badge variant="destructive">Disabled</Badge>}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost" onClick={() => { setEditingUser(u); setNewRole(u.role); setNewActive(u.isActive) }}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Missions */}
        <TabsContent value="missions" className="space-y-4">
          <div className="flex justify-between">
            <p className="text-sm text-muted-foreground">{missions.length} missions</p>
            <Button size="sm" onClick={() => { setEditMission({ title: '', description: '', category: 'ELECTRICITY', difficulty: 'EASY', points: 10, requiresEvidence: true, isActive: true }); setShowMissionDialog(true) }}>
              <Plus className="h-3 w-3 mr-1" /> New Mission
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {missions.map(m => (
              <Card key={m.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-medium text-sm">{m.title}</div>
                    <Badge variant={m.isActive ? 'default' : 'secondary'} className="text-[10px]">{m.isActive ? 'Active' : 'Inactive'}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mb-3">{m.category} · {m.difficulty} · {m.points} pts · {m.submissions} submissions</div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setEditMission(m); setShowMissionDialog(true) }}><Pencil className="h-3 w-3 mr-1" /> Edit</Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={async () => { await api.post('/admin/missions', { action: 'deactivate', id: m.id }); loadMissions() }}>
                      <Power className="h-3 w-3 mr-1" /> {m.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Reports */}
        <TabsContent value="reports" className="space-y-4">
          {reports.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">No open reports. 🎉</CardContent></Card>
          ) : reports.map(r => (
            <Card key={r.id}>
              <CardContent className="pt-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-semibold text-sm">Reported by {r.reporter}</div>
                    <div className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleString()} · Reason: {r.reason}</div>
                  </div>
                  <Badge variant="destructive">{r.status}</Badge>
                </div>
                {r.postContent && (
                  <div className="p-3 bg-muted rounded-lg text-sm mb-3">
                    <div className="text-xs font-medium text-muted-foreground mb-1">Reported post by {r.postAuthor}:</div>
                    {r.postContent}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button size="sm" variant="destructive" onClick={() => resolveReport(r.id, 'HIDE_POST')}>Hide Post</Button>
                  <Button size="sm" variant="outline" onClick={() => resolveReport(r.id, 'DISMISS')}>Dismiss</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Settings (admin only) */}
        {user?.role === 'ADMIN' && (
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Configure calculation assumptions and scoring rules.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {settings.map(s => (
                  <div key={s.id} className="grid grid-cols-12 gap-2 items-center p-3 border rounded-lg">
                    <div className="col-span-12 sm:col-span-4">
                      <div className="font-medium text-sm">{s.key}</div>
                      <div className="text-xs text-muted-foreground">{s.description}</div>
                    </div>
                    <div className="col-span-8 sm:col-span-5">
                      <Input defaultValue={s.value} id={`set-${s.id}`} />
                    </div>
                    <div className="col-span-4 sm:col-span-3">
                      <Button size="sm" className="w-full" onClick={() => { const el = document.getElementById(`set-${s.id}`) as HTMLInputElement; saveSetting(s.key, el.value) }}>Save</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Audit logs (admin only) */}
        {user?.role === 'ADMIN' && (
          <TabsContent value="audit" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><ScrollText className="h-4 w-4" /> Audit Logs</CardTitle>
                <CardDescription>Last 100 actions across the platform.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[600px] overflow-y-auto scroll-thin">
                  <Table>
                    <TableHeader>
                      <TableRow><TableHead>Time</TableHead><TableHead>Action</TableHead><TableHead>Actor</TableHead><TableHead>Resource</TableHead><TableHead>Details</TableHead></TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map(l => (
                        <TableRow key={l.id}>
                          <TableCell className="text-xs">{new Date(l.timestamp).toLocaleString()}</TableCell>
                          <TableCell><Badge variant="outline" className="text-[10px]">{l.action}</Badge></TableCell>
                          <TableCell className="text-xs">{l.actor}</TableCell>
                          <TableCell className="text-xs">{l.resource}{l.resourceId ? `/${l.resourceId.slice(0, 6)}` : ''}</TableCell>
                          <TableCell className="text-xs text-muted-foreground truncate max-w-[200px]">{l.details}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Edit user dialog */}
      <Dialog open={!!editingUser} onOpenChange={(o) => !o && setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>{editingUser?.name} ({editingUser?.email})</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CITIZEN">Citizen</SelectItem>
                  <SelectItem value="MODERATOR">Moderator</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={newActive} onChange={e => setNewActive(e.target.checked)} /> Active account
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
            <Button onClick={saveUser}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit mission dialog */}
      <Dialog open={showMissionDialog} onOpenChange={setShowMissionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editMission?.id ? 'Edit Mission' : 'New Mission'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input value={editMission?.title || ''} onChange={e => setEditMission({ ...editMission, title: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea value={editMission?.description || ''} onChange={e => setEditMission({ ...editMission, description: e.target.value })} rows={3} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={editMission?.category || 'ELECTRICITY'} onValueChange={v => setEditMission({ ...editMission, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['ELECTRICITY', 'WATER', 'TRANSPORT', 'WASTE', 'TREE', 'RENEWABLE', 'CONSUMPTION'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Difficulty</Label>
                <Select value={editMission?.difficulty || 'EASY'} onValueChange={v => setEditMission({ ...editMission, difficulty: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EASY">Easy</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HARD">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Points</Label>
                <Input type="number" value={editMission?.points ?? 10} onChange={e => setEditMission({ ...editMission, points: Number(e.target.value) })} />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={editMission?.isActive ?? true} onChange={e => setEditMission({ ...editMission, isActive: e.target.checked })} /> Active
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMissionDialog(false)}>Cancel</Button>
            <Button onClick={saveMission}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, accent }: { icon: React.ElementType; label: string; value: number; accent?: 'amber' | 'red' }) {
  const colorClass = accent === 'amber' ? 'text-amber-600' : accent === 'red' ? 'text-destructive' : 'text-primary'
  return (
    <Card>
      <CardContent className="pt-4">
        <Icon className={`h-4 w-4 mb-1 ${colorClass}`} />
        <div className="text-xl font-bold">{value.toLocaleString()}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  )
}
