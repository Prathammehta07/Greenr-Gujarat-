'use client'
import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell
} from 'recharts'
import {
  Shield, Users, ShieldCheck, Footprints, Zap, Leaf, Flag,
  Clock, Award, Sparkles, Building2, Map, ScrollText, Sliders,
  CheckCircle2, Plus, ArrowUpRight, RefreshCw, ChevronRight,
  TrendingUp, Lock, AlertTriangle, UserPlus, Eye
} from 'lucide-react'
import { api } from '@/lib/api-client'
import { useRouter, type ViewKey } from '@/lib/router'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/hooks/use-toast'

interface AdminMetrics {
  totalCitizens: number
  totalModerators: number
  monthlyActiveUsers: number
  missionsCompleted: number
  pendingVerifications: number
  activeCampaigns: number
  openReports: number
  communities: number
  posts: number
  totalPointsDistributed: number
  reportedSavingsKwh: number
  estimatedCo2ReductionKg: number
  districtParticipation: {
    district: string
    users: number
    missions: number
    savingsKwh: number
    renewableCount: number
    isSample: boolean
  }[]
  recentAuditLogs: {
    id: string
    action: string
    resource: string
    actor: string
    details?: string
    createdAt: string
  }[]
}

interface UserRow {
  id: string
  email: string
  name: string
  role: string
  isDemo: boolean
  isActive: boolean
  district?: string
  createdAt: string
}

const COLORS = ['#16834A', '#2563EB', '#D97706', '#7C3AED', '#0891B2', '#DC2626', '#059669']

export function AdminDashboardView() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  const [metrics, setMetrics] = useState<AdminMetrics | null>(null)
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)

  // Quick Action Dialogs
  const [userModalOpen, setUserModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null)
  const [newRole, setNewRole] = useState('')
  const [newActive, setNewActive] = useState(true)
  const [savingUser, setSavingUser] = useState(false)
  const [generatingData, setGeneratingData] = useState(false)

  // Quick Create Mission Modal
  const [missionModalOpen, setMissionModalOpen] = useState(false)
  const [missionTitle, setMissionTitle] = useState('')
  const [missionDesc, setMissionDesc] = useState('')
  const [missionCategory, setMissionCategory] = useState('ELECTRICITY')
  const [missionPoints, setMissionPoints] = useState('25')
  const [creatingMission, setCreatingMission] = useState(false)

  const loadMetrics = async () => {
    try {
      setLoading(true)
      const [mRes, uRes] = await Promise.all([
        api.get<AdminMetrics>('/admin/admin-metrics'),
        api.get<{ users: UserRow[] }>('/admin/users').catch(() => ({ users: [] }))
      ])
      setMetrics(mRes)
      setUsers(uRes.users || [])
    } catch {
      toast({
        title: 'Error loading admin data',
        description: 'Ensure you have administrator privileges.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMetrics()
  }, [])

  const handleGenerateRandomData = async () => {
    try {
      setGeneratingData(true)
      toast({ title: 'Generating Demo Data...', description: 'Adding active citizens, footprints, and missions.' })
      await api.post('/admin/seed-random', {})
      toast({ title: 'Random Data Generated!', description: 'Database and analytics successfully refreshed.' })
      loadMetrics()
    } catch {
      toast({ title: 'Failed to generate data', variant: 'destructive' })
    } finally {
      setGeneratingData(false)
    }
  }

  const handleUpdateUser = async () => {
    if (!selectedUser) return
    try {
      setSavingUser(true)
      await api.patch('/admin/users', {
        userId: selectedUser.id,
        role: newRole,
        isActive: newActive
      })
      toast({
        title: 'User role/status updated',
        description: `${selectedUser.name} is now ${newRole} (${newActive ? 'Active' : 'Suspended'}).`
      })
      setUserModalOpen(false)
      loadMetrics()
    } catch (e) {
      toast({
        title: 'Failed to update user',
        description: e instanceof Error ? e.message : 'Please check permissions',
        variant: 'destructive'
      })
    } finally {
      setSavingUser(false)
    }
  }

  const handleCreateMission = async () => {
    if (!missionTitle || !missionDesc) {
      toast({ title: 'Validation Error', description: 'Title and description are required.', variant: 'destructive' })
      return
    }
    try {
      setCreatingMission(true)
      await api.post('/admin/missions', {
        action: 'create',
        title: missionTitle,
        description: missionDesc,
        category: missionCategory,
        points: Number(missionPoints) || 20,
        difficulty: 'EASY',
        requiresEvidence: true
      })
      toast({
        title: 'Green Mission Created',
        description: `"${missionTitle}" is now live for Gujarat citizens.`
      })
      setMissionModalOpen(false)
      setMissionTitle('')
      setMissionDesc('')
      loadMetrics()
    } catch (e) {
      toast({
        title: 'Failed to create mission',
        description: e instanceof Error ? e.message : 'Error occurred',
        variant: 'destructive'
      })
    } finally {
      setCreatingMission(false)
    }
  }

  if (loading && !metrics) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  const m = metrics || {
    totalCitizens: 0,
    totalModerators: 0,
    monthlyActiveUsers: 0,
    missionsCompleted: 0,
    pendingVerifications: 0,
    activeCampaigns: 0,
    openReports: 0,
    communities: 0,
    posts: 0,
    totalPointsDistributed: 0,
    reportedSavingsKwh: 0,
    estimatedCo2ReductionKg: 0,
    districtParticipation: [],
    recentAuditLogs: []
  }

  const districtData = m.districtParticipation.slice(0, 6).map(d => ({
    name: d.district,
    users: d.users,
    missions: d.missions,
    savings: d.savingsKwh
  }))

  return (
    <div className="space-y-6 pb-12">
      {/* Executive Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0d522e] via-[#16834A] to-[#1e9a59] p-6 lg:p-8 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider mb-2 text-emerald-100">
              <Shield className="h-3.5 w-3.5" /> GEDA Administration Executive Dashboard
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
              Gujarat Energy Development Agency Control
            </h1>
            <p className="text-sm text-emerald-100 mt-1 max-w-2xl">
              High-level governance, Gujarat district progress, citizen and moderator administration, and statewide carbon reduction analytics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              onClick={handleGenerateRandomData}
              disabled={generatingData}
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/25 text-xs h-9"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1" /> {generatingData ? 'Generating...' : 'Add Random Data'}
            </Button>
            <Button
              onClick={() => setMissionModalOpen(true)}
              className="bg-white text-[#16834A] hover:bg-emerald-50 text-xs font-semibold h-9 shadow-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Create Mission
            </Button>
            <Button
              onClick={() => router.navigate('admin')}
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/25 text-xs h-9"
            >
              <Sliders className="h-3.5 w-3.5 mr-1" /> Admin Control Center
            </Button>
          </div>
        </div>
      </div>

      {/* Primary 8-Metric State Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Citizens */}
        <Card className="border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Citizens</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Users className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">{m.totalCitizens}</div>
            <p className="text-[11px] text-slate-500 mt-1">Active Gujarat Citizens</p>
          </CardContent>
        </Card>

        {/* Total Moderators */}
        <Card className="border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Moderators</span>
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <ShieldCheck className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black text-blue-700">{m.totalModerators}</div>
            <p className="text-[11px] text-slate-500 mt-1">Authorized Verifiers</p>
          </CardContent>
        </Card>

        {/* Active Users */}
        <Card className="border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Users</span>
              <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
                <TrendingUp className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">{m.monthlyActiveUsers}</div>
            <p className="text-[11px] text-slate-500 mt-1">Monthly Active Engagement</p>
          </CardContent>
        </Card>

        {/* Completed Missions */}
        <Card className="border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Missions Done</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-[#16834A] flex items-center justify-center">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black text-[#16834A]">{m.missionsCompleted}</div>
            <p className="text-[11px] text-slate-500 mt-1">Verified LiFE Actions</p>
          </CardContent>
        </Card>

        {/* Pending Verifications */}
        <Card className="border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pending Queue</span>
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <Clock className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black text-amber-600">{m.pendingVerifications}</div>
            <p className="text-[11px] text-slate-500 mt-1">Submissions in queue</p>
          </CardContent>
        </Card>

        {/* Open Reports */}
        <Card className="border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Reports</span>
              <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                <Flag className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black text-rose-600">{m.openReports}</div>
            <p className="text-[11px] text-slate-500 mt-1">Flagged Community Posts</p>
          </CardContent>
        </Card>

        {/* Green Points Distributed */}
        <Card className="border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Points Awarded</span>
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">{m.totalPointsDistributed}</div>
            <p className="text-[11px] text-slate-500 mt-1">Total Points in Circulation</p>
          </CardContent>
        </Card>

        {/* Electricity & CO2 Savings */}
        <Card className="border-slate-200/80 shadow-xs hover:shadow-md transition-shadow bg-emerald-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Impact Saved</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-200 text-emerald-800 flex items-center justify-center">
                <Zap className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="text-xl font-black text-emerald-900">{m.reportedSavingsKwh} kWh</div>
            <p className="text-[11px] text-emerald-700 font-semibold mt-1">≈ {m.estimatedCo2ReductionKg} kg CO₂ Cut</p>
          </CardContent>
        </Card>
      </div>

      {/* District-wise Performance & Analytics Chart */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* District Performance Bar Chart */}
        <Card className="lg:col-span-2 border-slate-200/80 shadow-xs">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Map className="h-4 w-4 text-emerald-700" />
                Gujarat District Green Performance
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Citizen participants and verified missions across key Gujarat districts
              </CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.navigate('twin')}
              className="text-xs h-8 text-[#16834A] border-emerald-300"
            >
              Digital Twin <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={districtData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                  />
                  <Bar dataKey="users" name="Registered Citizens" fill="#16834A" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="missions" name="Completed Missions" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Leading District: <strong className="text-slate-900">{districtData[0]?.name || 'Ahmedabad'}</strong></span>
              <span>Total Communities: <strong className="text-slate-900">{m.communities}</strong></span>
              <span>Active Campaigns: <strong className="text-slate-900">{m.activeCampaigns}</strong></span>
            </div>
          </CardContent>
        </Card>

        {/* Platform Quick Administration Hub */}
        <Card className="border-slate-200/80 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="h-4 w-4 text-emerald-700" />
              Administrative Controls
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Direct access to GEDA management modules
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <button
              onClick={() => router.navigate('admin-citizens')}
              className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200/80 bg-slate-50 hover:bg-emerald-50/50 hover:border-emerald-300 transition-colors text-left"
            >
              <div className="flex items-center gap-2.5">
                <Users className="h-4 w-4 text-emerald-700" />
                <div>
                  <div className="text-xs font-bold text-slate-900">Citizen Management</div>
                  <div className="text-[11px] text-slate-500">Review, suspend, or elevate citizen accounts</div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </button>

            <button
              onClick={() => router.navigate('admin-moderators')}
              className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200/80 bg-slate-50 hover:bg-blue-50/50 hover:border-blue-300 transition-colors text-left"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-blue-700" />
                <div>
                  <div className="text-xs font-bold text-slate-900">Moderator Management</div>
                  <div className="text-[11px] text-slate-500">Assign moderation rights and scopes</div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </button>

            <button
              onClick={() => router.navigate('admin-missions')}
              className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200/80 bg-slate-50 hover:bg-emerald-50/50 hover:border-emerald-300 transition-colors text-left"
            >
              <div className="flex items-center gap-2.5">
                <Footprints className="h-4 w-4 text-emerald-700" />
                <div>
                  <div className="text-xs font-bold text-slate-900">Mission Management</div>
                  <div className="text-[11px] text-slate-500">Create, edit, or deactivate LiFE missions</div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </button>

            <button
              onClick={() => router.navigate('admin-audit-logs')}
              className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200/80 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition-colors text-left"
            >
              <div className="flex items-center gap-2.5">
                <ScrollText className="h-4 w-4 text-slate-700" />
                <div>
                  <div className="text-xs font-bold text-slate-900">System Audit Logs</div>
                  <div className="text-[11px] text-slate-500">Compliance & administrative event audit</div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </button>

            <button
              onClick={() => router.navigate('admin')}
              className="w-full flex items-center justify-between p-3 rounded-lg border border-emerald-300 bg-emerald-50/80 hover:bg-emerald-100/80 transition-colors text-left"
            >
              <div className="flex items-center gap-2.5">
                <Shield className="h-4 w-4 text-emerald-800" />
                <div>
                  <div className="text-xs font-bold text-emerald-950">Full Admin Control Center</div>
                  <div className="text-[11px] text-emerald-800">Launch campaigns, edit settings, manage database</div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-emerald-700" />
            </button>
          </CardContent>
        </Card>
      </div>

      {/* User Management Quick Table & Recent Platform Activities */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* User Management Quick Overview */}
        <Card className="lg:col-span-2 border-slate-200/80 shadow-xs">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-700" />
                Citizen & Moderator Accounts
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Recent user accounts registered on Green Gujarat
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs font-semibold">
              {users.length} Users Listed
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                    <th className="pb-2">Name</th>
                    <th className="pb-2">Email</th>
                    <th className="pb-2">Role</th>
                    <th className="pb-2">District</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.slice(0, 6).map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/60">
                      <td className="py-2.5 font-bold text-slate-900">{u.name}</td>
                      <td className="py-2.5 text-slate-600">{u.email}</td>
                      <td className="py-2.5">
                        <Badge
                          className={`text-[10px] font-semibold ${
                            u.role === 'ADMIN'
                              ? 'bg-emerald-800 text-white'
                              : u.role === 'MODERATOR'
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-200 text-slate-800'
                          }`}
                        >
                          {u.role}
                        </Badge>
                      </td>
                      <td className="py-2.5 text-slate-600">{u.district || 'Gujarat'}</td>
                      <td className="py-2.5">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          u.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {u.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedUser(u)
                            setNewRole(u.role)
                            setNewActive(u.isActive)
                            setUserModalOpen(true)
                          }}
                          className="h-7 text-xs text-blue-700 hover:bg-blue-50"
                        >
                          Manage
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Audit Activities */}
        <Card className="border-slate-200/80 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ScrollText className="h-4 w-4 text-slate-700" />
              Platform Audit History
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Live administrative and security events log
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {m.recentAuditLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{log.action}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    Actor: <span className="font-semibold text-slate-800">{log.actor}</span> • {log.resource}
                  </div>
                  {log.details && (
                    <div className="text-[10px] text-slate-500 font-mono truncate mt-1">
                      {log.details}
                    </div>
                  )}
                </div>
              ))}
              {m.recentAuditLogs.length === 0 && (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No recent audit entries logged.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Management Dialog */}
      <Dialog open={userModalOpen} onOpenChange={setUserModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Manage User Account
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Update role permission or active account status for {selectedUser?.name}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-semibold text-slate-700">User Email</Label>
              <Input disabled value={selectedUser?.email || ''} className="text-xs bg-slate-50 mt-1" />
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-700">Assigned Platform Role</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger className="mt-1 text-xs">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CITIZEN">Citizen (Standard Mission LiFE)</SelectItem>
                  <SelectItem value="MODERATOR">Moderator (Verification & Content Moderation)</SelectItem>
                  <SelectItem value="ADMIN">Admin (Full GEDA Administration Authority)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-700">Account Status</Label>
              <Select value={newActive ? 'active' : 'suspended'} onValueChange={(v) => setNewActive(v === 'active')}>
                <SelectTrigger className="mt-1 text-xs">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active (Can log in & participate)</SelectItem>
                  <SelectItem value="suspended">Suspended (Access blocked)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button size="sm" variant="outline" onClick={() => setUserModalOpen(false)} className="text-xs">
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={savingUser}
              onClick={handleUpdateUser}
              className="bg-[#16834A] hover:bg-[#126b3c] text-white text-xs"
            >
              {savingUser ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Mission Modal */}
      <Dialog open={missionModalOpen} onOpenChange={setMissionModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Create New Green Mission
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Publish a new Mission LiFE sustainability task for Gujarat citizens.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div>
              <Label className="text-xs font-semibold text-slate-700">Mission Title</Label>
              <Input
                value={missionTitle}
                onChange={(e) => setMissionTitle(e.target.value)}
                placeholder="e.g. Drip Irrigation Awareness Challenge"
                className="text-xs mt-1"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-700">Category</Label>
              <Select value={missionCategory} onValueChange={setMissionCategory}>
                <SelectTrigger className="mt-1 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ELECTRICITY">Electricity Conservation</SelectItem>
                  <SelectItem value="WATER">Water Conservation</SelectItem>
                  <SelectItem value="TRANSPORT">Sustainable Transport</SelectItem>
                  <SelectItem value="WASTE">Waste Reduction</SelectItem>
                  <SelectItem value="TREE">Tree Plantation</SelectItem>
                  <SelectItem value="RENEWABLE">Rooftop Solar & Renewable</SelectItem>
                  <SelectItem value="CONSUMPTION">Sustainable Consumption</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-700">Description & Instructions</Label>
              <Textarea
                value={missionDesc}
                onChange={(e) => setMissionDesc(e.target.value)}
                placeholder="Describe required citizen action and what photo evidence must be uploaded..."
                className="text-xs mt-1 min-h-[70px]"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-700">Awarded Green Points</Label>
              <Input
                type="number"
                value={missionPoints}
                onChange={(e) => setMissionPoints(e.target.value)}
                className="text-xs mt-1"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button size="sm" variant="outline" onClick={() => setMissionModalOpen(false)} className="text-xs">
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={creatingMission}
              onClick={handleCreateMission}
              className="bg-[#16834A] hover:bg-[#126b3c] text-white text-xs"
            >
              {creatingMission ? 'Publishing...' : 'Publish Mission'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
