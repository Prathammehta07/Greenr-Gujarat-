'use client'
import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Users, ShieldCheck, UserCheck, Activity, Target, Megaphone,
  Award, Gift, Sparkles, Building2, Flag, ShieldAlert, MapPin,
  BarChart3, Map, Zap, Leaf, Trophy, Cpu, Wrench, Sliders, ScrollText,
  CheckCircle2, XCircle, Search, FileDown
} from 'lucide-react'
import { api } from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'

interface PageHeaderProps {
  icon: React.ElementType
  title: string
  description: string
  badgeText?: string
}

function PageHeader({ icon: Icon, title, description, badgeText }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 text-[#16834A] flex items-center justify-center shrink-0">
            <Icon className="h-5 w-5" />
          </div>
          <span>{title}</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">{description}</p>
      </div>
      {badgeText && (
        <Badge variant="outline" className="text-xs font-semibold self-start sm:self-auto text-emerald-800 border-emerald-300 bg-emerald-50">
          {badgeText}
        </Badge>
      )}
    </div>
  )
}

// 1. Citizen Management Page
export function AdminCitizensPage() {
  const [users, setUsers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const { toast } = useToast()

  const load = () => {
    api.get<{ users: any[] }>('/admin/users?role=CITIZEN').then(r => {
      setUsers(r.users || [])
    }).catch(() => {})
  }

  useEffect(() => { load() }, [])

  const toggleStatus = async (user: any) => {
    try {
      await api.patch('/admin/users', { userId: user.id, role: user.role, isActive: !user.isActive })
      toast({ title: 'Status Updated', description: `${user.name} is now ${!user.isActive ? 'Active' : 'Suspended'}.` })
      load()
    } catch {
      toast({ title: 'Failed to update', variant: 'destructive' })
    }
  }

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.district?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <PageHeader
        icon={Users}
        title="Citizen Management"
        description="Manage registered Gujarat citizen accounts, view participation details, and update status."
        badgeText={`${users.length} Citizens`}
      />

      <div className="flex items-center justify-between gap-3">
        <div className="relative w-72">
          <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, district..."
            className="text-xs pl-8 h-8"
          />
        </div>
      </div>

      <Card className="border-slate-200/80 shadow-xs">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs font-semibold">Name</TableHead>
                <TableHead className="text-xs font-semibold">Email</TableHead>
                <TableHead className="text-xs font-semibold">District</TableHead>
                <TableHead className="text-xs font-semibold">Language</TableHead>
                <TableHead className="text-xs font-semibold">Status</TableHead>
                <TableHead className="text-xs font-semibold text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(u => (
                <TableRow key={u.id} className="hover:bg-slate-50/60">
                  <TableCell className="font-semibold text-xs text-slate-900">{u.name}</TableCell>
                  <TableCell className="text-xs text-slate-600">{u.email}</TableCell>
                  <TableCell className="text-xs text-slate-600">{u.district || 'Gujarat'}</TableCell>
                  <TableCell className="text-xs uppercase">{u.preferredLang || 'en'}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      u.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {u.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleStatus(u)}
                      className="h-7 text-xs"
                    >
                      {u.isActive ? 'Suspend' : 'Activate'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-slate-400 text-xs">
                    No citizens found matching search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// 2. Moderator Management Page
export function AdminModeratorsPage() {
  const [mods, setMods] = useState<any[]>([])
  const { toast } = useToast()

  const load = () => {
    api.get<{ users: any[] }>('/admin/users?role=MODERATOR').then(r => {
      setMods(r.users || [])
    }).catch(() => {})
  }

  useEffect(() => { load() }, [])

  return (
    <div className="space-y-4">
      <PageHeader
        icon={ShieldCheck}
        title="Moderator Management"
        description="Oversee verified community moderators and verification rights across Gujarat districts."
        badgeText={`${mods.length} Authorized Moderators`}
      />

      <Card className="border-slate-200/80 shadow-xs">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs font-semibold">Moderator Name</TableHead>
                <TableHead className="text-xs font-semibold">Email</TableHead>
                <TableHead className="text-xs font-semibold">Jurisdiction / District</TableHead>
                <TableHead className="text-xs font-semibold">Scope</TableHead>
                <TableHead className="text-xs font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mods.map(m => (
                <TableRow key={m.id}>
                  <TableCell className="font-semibold text-xs text-slate-900">{m.name}</TableCell>
                  <TableCell className="text-xs text-slate-600">{m.email}</TableCell>
                  <TableCell className="text-xs text-slate-600">{m.district || 'Surat'}</TableCell>
                  <TableCell>
                    <Badge className="bg-blue-100 text-blue-800 text-[10px] font-semibold">
                      Missions & Content
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                      Authorized
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {mods.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-slate-400 text-xs">
                    No moderators found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// 3. User Verification Page
export function AdminUserVerificationPage() {
  const verificationList = [
    { name: 'Aarav Patel', type: 'Residential Rooftop Solar', district: 'Ahmedabad', status: 'VERIFIED', date: '2026-11-01' },
    { name: 'Diya Shah', type: 'Community Moderator Identity', district: 'Surat', status: 'VERIFIED', date: '2026-11-01' },
    { name: 'Mehul Vora', type: 'Solar Net Metering Registration', district: 'Rajkot', status: 'PENDING', date: '2026-11-03' },
    { name: 'Kinjal Solanki', type: 'LiFE Household Baseline', district: 'Vadodara', status: 'VERIFIED', date: '2026-11-02' },
    { name: 'Priyank Trivedi', type: '5-Star Appliance Invoice', district: 'Gandhinagar', status: 'PENDING', date: '2026-11-03' }
  ]

  return (
    <div className="space-y-4">
      <PageHeader
        icon={UserCheck}
        title="User Verification"
        description="Review citizen identity validation, solar installation proofs, and household credentials."
        badgeText="Verification Desk"
      />

      <Card className="border-slate-200/80 shadow-xs">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs font-semibold">Citizen Name</TableHead>
                <TableHead className="text-xs font-semibold">Verification Category</TableHead>
                <TableHead className="text-xs font-semibold">District</TableHead>
                <TableHead className="text-xs font-semibold">Submission Date</TableHead>
                <TableHead className="text-xs font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {verificationList.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-semibold text-xs text-slate-900">{item.name}</TableCell>
                  <TableCell className="text-xs text-slate-600">{item.type}</TableCell>
                  <TableCell className="text-xs text-slate-600">{item.district}</TableCell>
                  <TableCell className="text-xs text-slate-500">{item.date}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      item.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// 4. User Activities Page
export function AdminUserActivitiesPage() {
  const [logs, setLogs] = useState<any[]>([])

  useEffect(() => {
    api.get<{ logs: any[] }>('/admin/audit-logs?limit=25').then(r => setLogs(r.logs || [])).catch(() => {})
  }, [])

  return (
    <div className="space-y-4">
      <PageHeader
        icon={Activity}
        title="User Activities"
        description="Comprehensive audit of citizen and administrator operations, logins, and point credits."
        badgeText="Activity Stream"
      />

      <Card className="border-slate-200/80 shadow-xs">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs font-semibold">Timestamp</TableHead>
                <TableHead className="text-xs font-semibold">Actor / User</TableHead>
                <TableHead className="text-xs font-semibold">Action</TableHead>
                <TableHead className="text-xs font-semibold">Resource</TableHead>
                <TableHead className="text-xs font-semibold">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.slice(0, 15).map(l => (
                <TableRow key={l.id}>
                  <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                    {new Date(l.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell className="font-semibold text-xs text-slate-900">{l.actor}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">{l.action}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">{l.resource}</TableCell>
                  <TableCell className="text-xs text-slate-500 max-w-xs truncate">{l.details || '—'}</TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-slate-400 text-xs">
                    No activity logs recorded yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// 5. Mission Management Page
export function AdminMissionsPage() {
  const [missions, setMissions] = useState<any[]>([])

  useEffect(() => {
    api.get<{ missions: any[] }>('/admin/missions').then(r => setMissions(r.missions || [])).catch(() => {})
  }, [])

  return (
    <div className="space-y-4">
      <PageHeader
        icon={Target}
        title="Mission Management"
        description="Manage Mission LiFE sustainability challenges, category targets, and citizen point rewards."
        badgeText={`${missions.length} Missions`}
      />

      <Card className="border-slate-200/80 shadow-xs">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs font-semibold">Mission Title</TableHead>
                <TableHead className="text-xs font-semibold">Category</TableHead>
                <TableHead className="text-xs font-semibold">Difficulty</TableHead>
                <TableHead className="text-xs font-semibold">Reward</TableHead>
                <TableHead className="text-xs font-semibold">Submissions</TableHead>
                <TableHead className="text-xs font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {missions.map(m => (
                <TableRow key={m.id}>
                  <TableCell className="font-semibold text-xs text-slate-900">{m.title}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-[10px] uppercase font-bold">{m.category}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">{m.difficulty}</TableCell>
                  <TableCell className="text-xs font-bold text-emerald-700">+{m.points} pts</TableCell>
                  <TableCell className="text-xs text-slate-600">{m.submissions || 0}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                      Active
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// 6. Campaign Management Page
export function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([])

  useEffect(() => {
    api.get<{ campaigns: any[] }>('/admin/campaigns?resource=campaigns').then(r => setCampaigns(r.campaigns || [])).catch(() => {})
  }, [])

  return (
    <div className="space-y-4">
      <PageHeader
        icon={Megaphone}
        title="Campaign Management"
        description="Organize, approve, and oversee statewide Gujarat clean energy and Mission LiFE campaigns."
        badgeText={`${campaigns.length} Active Campaigns`}
      />

      <Card className="border-slate-200/80 shadow-xs">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs font-semibold">Campaign Title</TableHead>
                <TableHead className="text-xs font-semibold">Organizer</TableHead>
                <TableHead className="text-xs font-semibold">Community</TableHead>
                <TableHead className="text-xs font-semibold">Location</TableHead>
                <TableHead className="text-xs font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-semibold text-xs text-slate-900">{c.title}</TableCell>
                  <TableCell className="text-xs text-slate-600">{c.organizer || 'GEDA'}</TableCell>
                  <TableCell className="text-xs text-slate-600">{c.community || 'All Gujarat'}</TableCell>
                  <TableCell className="text-xs text-slate-600">{c.location || 'Statewide'}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                      {c.status || 'Active'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {campaigns.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-slate-400 text-xs">
                    No campaigns listed.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// 7. Green Passport Management Page
export function AdminPassportPage() {
  const tiers = [
    { tier: 'Bronze Tier', points: '0 - 100 pts', threshold: 'First Step', citizens: 18, perk: 'Basic Mission LiFE digital card' },
    { tier: 'Silver Tier', points: '101 - 300 pts', threshold: '5 Missions Completed', citizens: 12, perk: 'GEDA official e-certificate' },
    { tier: 'Gold Tier', points: '301 - 600 pts', threshold: '10 Missions + Bill Savings', citizens: 6, perk: 'Priority rooftop solar inspection' },
    { tier: 'Platinum Tier', points: '600+ pts', threshold: '25 Missions + Solar Adopter', citizens: 3, perk: 'State LiFE Champion recognition' }
  ]

  return (
    <div className="space-y-4">
      <PageHeader
        icon={Award}
        title="Green Passport Management"
        description="Oversee citizen passport milestones, tier thresholds, and state accreditation levels."
        badgeText="4 Certification Tiers"
      />

      <Card className="border-slate-200/80 shadow-xs">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs font-semibold">Tier Level</TableHead>
                <TableHead className="text-xs font-semibold">Points Range</TableHead>
                <TableHead className="text-xs font-semibold">Unlock Criteria</TableHead>
                <TableHead className="text-xs font-semibold">Active Citizens</TableHead>
                <TableHead className="text-xs font-semibold">Government Benefit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tiers.map(t => (
                <TableRow key={t.tier}>
                  <TableCell className="font-bold text-xs text-slate-900">{t.tier}</TableCell>
                  <TableCell className="text-xs text-slate-600">{t.points}</TableCell>
                  <TableCell className="text-xs text-slate-600">{t.threshold}</TableCell>
                  <TableCell className="text-xs font-semibold text-emerald-800">{t.citizens} Citizens</TableCell>
                  <TableCell className="text-xs text-slate-700">{t.perk}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// 8. Rewards Management Page
export function AdminRewardsPage() {
  const rewards = [
    { name: 'GEDA Mission LiFE Certificate', points: 100, category: 'Certificate', claims: 14, status: 'Active' },
    { name: 'Energy-Saving LED Pack Voucher (4x 9W)', points: 250, category: 'Hardware Voucher', claims: 8, status: 'Active' },
    { name: 'Priority Rooftop Solar Site Feasibility Survey', points: 400, category: 'Technical Service', claims: 5, status: 'Active' },
    { name: 'Gujarat Electric Mobility Pass (₹200 discount)', points: 500, category: 'Transport Subsidy', claims: 2, status: 'Active' }
  ]

  return (
    <div className="space-y-4">
      <PageHeader
        icon={Gift}
        title="Rewards Management"
        description="Configure redeemable perks, partner retailer discounts, and certified benefits."
        badgeText="4 Reward Catalog Items"
      />

      <Card className="border-slate-200/80 shadow-xs">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs font-semibold">Reward Item</TableHead>
                <TableHead className="text-xs font-semibold">Points Required</TableHead>
                <TableHead className="text-xs font-semibold">Category</TableHead>
                <TableHead className="text-xs font-semibold">Total Claims</TableHead>
                <TableHead className="text-xs font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rewards.map(r => (
                <TableRow key={r.name}>
                  <TableCell className="font-semibold text-xs text-slate-900">{r.name}</TableCell>
                  <TableCell className="text-xs font-bold text-emerald-700">{r.points} pts</TableCell>
                  <TableCell className="text-xs text-slate-600">{r.category}</TableCell>
                  <TableCell className="text-xs text-slate-600">{r.claims}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                      {r.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// 9. Green Score Management Page
export function AdminScorePage() {
  const params = [
    { name: 'Electricity Bill Reduction Weight', weight: '40%', base: 'Calculated savings vs household baseline (kWh)', target: '15% savings/mo' },
    { name: 'Mission LiFE Completion Weight', weight: '30%', base: 'Verified missions completed in approved status', target: '2 missions/mo' },
    { name: 'Rooftop Solar & Renewable Weight', weight: '20%', base: 'Registered rooftop solar capacity or renewable share', target: 'Grid export active' },
    { name: 'Community Engagement Weight', weight: '10%', base: 'Participation in local clean drives and forum sharing', target: 'Monthly active' }
  ]

  return (
    <div className="space-y-4">
      <PageHeader
        icon={Sparkles}
        title="Green Score Management"
        description="Configure algorithmic parameters and weights used to calculate citizen Green Scores."
        badgeText="Algorithm v2.1"
      />

      <Card className="border-slate-200/80 shadow-xs">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs font-semibold">Scoring Dimension</TableHead>
                <TableHead className="text-xs font-semibold">Weightage</TableHead>
                <TableHead className="text-xs font-semibold">Calculation Basis</TableHead>
                <TableHead className="text-xs font-semibold">Benchmark Target</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {params.map(p => (
                <TableRow key={p.name}>
                  <TableCell className="font-bold text-xs text-slate-900">{p.name}</TableCell>
                  <TableCell className="text-xs font-bold text-emerald-700">{p.weight}</TableCell>
                  <TableCell className="text-xs text-slate-600">{p.base}</TableCell>
                  <TableCell className="text-xs text-slate-600">{p.target}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// 10. Community Management Page
export function AdminCommunityPage() {
  const [communities, setCommunities] = useState<any[]>([])

  useEffect(() => {
    api.get<{ communities: any[] }>('/community').then(r => setCommunities(r.communities || [])).catch(() => {})
  }, [])

  return (
    <div className="space-y-4">
      <PageHeader
        icon={Building2}
        title="Community Management"
        description="Manage green groups, school clubs, and residential welfare associations registered in Gujarat."
        badgeText={`${communities.length} Communities`}
      />

      <Card className="border-slate-200/80 shadow-xs">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs font-semibold">Community Group</TableHead>
                <TableHead className="text-xs font-semibold">Category</TableHead>
                <TableHead className="text-xs font-semibold">Description</TableHead>
                <TableHead className="text-xs font-semibold">Members</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {communities.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-semibold text-xs text-slate-900">{c.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">{c.category || 'General'}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 max-w-sm truncate">{c.description}</TableCell>
                  <TableCell className="text-xs font-bold text-slate-800">{c.memberCount || 1}</TableCell>
                </TableRow>
              ))}
              {communities.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-slate-400 text-xs">
                    No communities listed.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// 11. Reported Content Page
export function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([])
  const { toast } = useToast()

  const load = () => {
    api.get<{ reports: any[] }>('/admin/campaigns?resource=reports').then(r => setReports(r.reports || [])).catch(() => {})
  }

  useEffect(() => { load() }, [])

  const resolve = async (id: string, hide: boolean) => {
    try {
      await api.post('/admin/campaigns', {
        action: 'resolve_report',
        reportId: id,
        resolution: hide ? 'Hidden by Admin' : 'Dismissed as clean',
        hidePost: hide
      })
      toast({ title: hide ? 'Content Hidden' : 'Report Dismissed' })
      load()
    } catch {
      toast({ title: 'Action failed', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        icon={Flag}
        title="Reported Content"
        description="Review community reports, remove inappropriate advertisements, and resolve user flags."
        badgeText={`${reports.length} Open Reports`}
      />

      <Card className="border-slate-200/80 shadow-xs">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs font-semibold">Report Reason</TableHead>
                <TableHead className="text-xs font-semibold">Post Author</TableHead>
                <TableHead className="text-xs font-semibold">Content Snippet</TableHead>
                <TableHead className="text-xs font-semibold">Reported By</TableHead>
                <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map(r => (
                <TableRow key={r.id}>
                  <TableCell>
                    <Badge className="bg-rose-100 text-rose-800 text-[10px] font-bold">{r.reason}</Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-xs text-slate-900">{r.postAuthor || 'User'}</TableCell>
                  <TableCell className="text-xs text-slate-600 max-w-xs truncate italic">&quot;{r.postContent}&quot;</TableCell>
                  <TableCell className="text-xs text-slate-500">{r.reporter}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button size="sm" variant="destructive" onClick={() => resolve(r.id, true)} className="h-7 text-xs">
                      Hide Post
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => resolve(r.id, false)} className="h-7 text-xs">
                      Dismiss
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {reports.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-slate-400 text-xs">
                    No open reports in the queue.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// 12. Community Moderation Page
export function AdminCommunityModerationPage() {
  const posts = [
    { author: 'Bhavik Shah', type: 'Solar Adoption', text: 'Installed 4kW rooftop solar system in Satellite, Ahmedabad. Generated 18 units today.', likes: 24, comments: 2, status: 'Active' },
    { author: 'Meera Dave', type: 'Waste Reduction', text: 'Surat society diverted 250 kg wet waste to organic compost this month.', likes: 38, comments: 2, status: 'Active' },
    { author: 'Priyank Trivedi', type: 'Green Mobility', text: 'Cycling 8 km to work at Infocity Gandhinagar instead of using the car.', likes: 19, comments: 1, status: 'Active' },
    { author: 'Kinjal Solanki', type: 'Energy Efficiency', text: 'Replaced halogen lights in our clinic with 7W LEDs. Bill dropped by 32%.', likes: 15, comments: 1, status: 'Active' }
  ]

  return (
    <div className="space-y-4">
      <PageHeader
        icon={ShieldAlert}
        title="Community Moderation"
        description="Monitor active community discussion threads and verify environmental compliance."
        badgeText="Community Discussions"
      />

      <Card className="border-slate-200/80 shadow-xs">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs font-semibold">Author</TableHead>
                <TableHead className="text-xs font-semibold">Category</TableHead>
                <TableHead className="text-xs font-semibold">Discussion Content</TableHead>
                <TableHead className="text-xs font-semibold">Engagement</TableHead>
                <TableHead className="text-xs font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((p, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-semibold text-xs text-slate-900">{p.author}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">{p.type}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 max-w-sm truncate">{p.text}</TableCell>
                  <TableCell className="text-xs text-slate-500">{p.likes} likes · {p.comments} comments</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                      {p.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// 13. Green Map Management Page
export function AdminMapPage() {
  const [pins, setPins] = useState<any[]>([])

  useEffect(() => {
    api.get<{ pins: any[] }>('/map/pins').then(r => setPins(r.pins || [])).catch(() => {})
  }, [])

  return (
    <div className="space-y-4">
      <PageHeader
        icon={MapPin}
        title="Green Map Management"
        description="Manage verified EV fast chargers, solar parks, and recycling drop-offs displayed on the Gujarat map."
        badgeText={`${pins.length} Facilities Listed`}
      />

      <Card className="border-slate-200/80 shadow-xs">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs font-semibold">Facility Name</TableHead>
                <TableHead className="text-xs font-semibold">Category</TableHead>
                <TableHead className="text-xs font-semibold">Operator</TableHead>
                <TableHead className="text-xs font-semibold">Coordinates</TableHead>
                <TableHead className="text-xs font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pins.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-semibold text-xs text-slate-900">{p.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-[10px]">{p.category}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">{p.operator || 'GEDA Verified'}</TableCell>
                  <TableCell className="text-xs text-slate-400 font-mono">{p.latitude?.toFixed(3)}, {p.longitude?.toFixed(3)}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                      Verified
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// 14. Gujarat Green Analytics Page
export function AdminAnalyticsPage() {
  const [metrics, setMetrics] = useState<any>(null)

  useEffect(() => {
    api.get<any>('/admin/admin-metrics').then(setMetrics).catch(() => {})
  }, [])

  const analytics = [
    { metric: 'Total Registered Citizens', current: metrics?.totalCitizens || 39, target: '100,000 Citizens', progress: '39%' },
    { metric: 'Verified Mission LiFE Actions', current: metrics?.missionsCompleted || 16, target: '25,000 Missions', progress: '64%' },
    { metric: 'Cumulative Electricity Saved (kWh)', current: `${metrics?.reportedSavingsKwh || 24800} kWh`, target: '1,000,000 kWh', progress: '25%' },
    { metric: 'Avoided CO2 Emissions (Tonnes)', current: `${((metrics?.estimatedCo2ReductionKg || 17600) / 1000).toFixed(1)} T`, target: '700 Tonnes', progress: '25%' },
    { metric: 'Registered Green Communities', current: metrics?.communities || 5, target: '200 Communities', progress: '25%' }
  ]

  return (
    <div className="space-y-4">
      <PageHeader
        icon={BarChart3}
        title="Gujarat Green Analytics"
        description="Statewide analytics on Mission LiFE citizen adoption, electricity conservation, and carbon reductions."
        badgeText="Annual Targets 2026-27"
      />

      <Card className="border-slate-200/80 shadow-xs">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs font-semibold">State KPI Metric</TableHead>
                <TableHead className="text-xs font-semibold">Achieved to Date</TableHead>
                <TableHead className="text-xs font-semibold">State Target</TableHead>
                <TableHead className="text-xs font-semibold">Target Completion</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analytics.map(a => (
                <TableRow key={a.metric}>
                  <TableCell className="font-bold text-xs text-slate-900">{a.metric}</TableCell>
                  <TableCell className="text-xs font-bold text-emerald-700">{a.current}</TableCell>
                  <TableCell className="text-xs text-slate-600">{a.target}</TableCell>
                  <TableCell className="text-xs font-semibold text-slate-800">{a.progress}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// 15. District-wise Performance Page
export function AdminDistrictsPage() {
  const [districts, setDistricts] = useState<any[]>([])

  useEffect(() => {
    api.get<any>('/admin/admin-metrics').then(r => setDistricts(r.districtParticipation || [])).catch(() => {})
  }, [])

  return (
    <div className="space-y-4">
      <PageHeader
        icon={Map}
        title="District-wise Performance"
        description="Comparative performance ranking across all Gujarat districts in citizen engagement and energy savings."
        badgeText={`${districts.length} Gujarat Districts`}
      />

      <Card className="border-slate-200/80 shadow-xs">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs font-semibold">Rank</TableHead>
                <TableHead className="text-xs font-semibold">District Name</TableHead>
                <TableHead className="text-xs font-semibold">Active Participants</TableHead>
                <TableHead className="text-xs font-semibold">Missions Completed</TableHead>
                <TableHead className="text-xs font-semibold">Reported kWh Saved</TableHead>
                <TableHead className="text-xs font-semibold">Renewables</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {districts.map((d, idx) => (
                <TableRow key={d.district}>
                  <TableCell className="font-bold text-xs text-slate-500">#{idx + 1}</TableCell>
                  <TableCell className="font-bold text-xs text-slate-900">{d.district}</TableCell>
                  <TableCell className="text-xs text-slate-600">{d.users} Citizens</TableCell>
                  <TableCell className="text-xs text-slate-600">{d.missions}</TableCell>
                  <TableCell className="text-xs font-bold text-emerald-700">+{d.savingsKwh || 1200} kWh</TableCell>
                  <TableCell className="text-xs text-slate-600">{d.renewableCount || 20} Adoptions</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// 16. Energy Savings Reports Page
export function AdminEnergyReportsPage() {
  const reports = [
    { month: 'November 2025', homes: 37, savedKwh: 4850, avgKwh: 131, valueInr: '₹36,375', audit: 'Verified' },
    { month: 'October 2025', homes: 35, savedKwh: 4420, avgKwh: 126, valueInr: '₹33,150', audit: 'Verified' },
    { month: 'September 2025', homes: 32, savedKwh: 3950, avgKwh: 123, valueInr: '₹29,625', audit: 'Verified' },
    { month: 'August 2025', homes: 28, savedKwh: 3400, avgKwh: 121, valueInr: '₹25,500', audit: 'Verified' },
    { month: 'July 2025', homes: 25, savedKwh: 2980, avgKwh: 119, valueInr: '₹22,350', audit: 'Verified' }
  ]

  return (
    <div className="space-y-4">
      <PageHeader
        icon={Zap}
        title="Energy Savings Reports"
        description="Monthly consolidated electricity reduction reports verified against consumer DISCOM bills."
        badgeText="DISCOM Tariff: ₹7.5/kWh"
      />

      <Card className="border-slate-200/80 shadow-xs">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs font-semibold">Billing Period</TableHead>
                <TableHead className="text-xs font-semibold">Participating Households</TableHead>
                <TableHead className="text-xs font-semibold">Total Electricity Saved</TableHead>
                <TableHead className="text-xs font-semibold">Average Savings / Home</TableHead>
                <TableHead className="text-xs font-semibold">Total Cost Saved (INR)</TableHead>
                <TableHead className="text-xs font-semibold">Audit Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map(r => (
                <TableRow key={r.month}>
                  <TableCell className="font-bold text-xs text-slate-900">{r.month}</TableCell>
                  <TableCell className="text-xs text-slate-600">{r.homes} Homes</TableCell>
                  <TableCell className="text-xs font-bold text-emerald-700">+{r.savedKwh} kWh</TableCell>
                  <TableCell className="text-xs text-slate-600">{r.avgKwh} kWh</TableCell>
                  <TableCell className="text-xs font-bold text-blue-700">{r.valueInr}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                      {r.audit}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// 17. CO2 Reduction Reports Page
export function AdminCo2ReportsPage() {
  const reports = [
    { month: 'November 2025', energyMwh: 4.85, factor: '0.71 kg/kWh', co2Saved: '3.44 Tonnes', trees: '344 Trees' },
    { month: 'October 2025', energyMwh: 4.42, factor: '0.71 kg/kWh', co2Saved: '3.14 Tonnes', trees: '314 Trees' },
    { month: 'September 2025', energyMwh: 3.95, factor: '0.71 kg/kWh', co2Saved: '2.80 Tonnes', trees: '280 Trees' },
    { month: 'August 2025', energyMwh: 3.40, factor: '0.71 kg/kWh', co2Saved: '2.41 Tonnes', trees: '241 Trees' },
    { month: 'July 2025', energyMwh: 2.98, factor: '0.71 kg/kWh', co2Saved: '2.11 Tonnes', trees: '211 Trees' }
  ]

  return (
    <div className="space-y-4">
      <PageHeader
        icon={Leaf}
        title="CO₂ Reduction Reports"
        description="Calculated statewide carbon abatement using the Central Electricity Authority (CEA) grid baseline factor."
        badgeText="CEA Factor: 0.71 kg/kWh"
      />

      <Card className="border-slate-200/80 shadow-xs">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs font-semibold">Month</TableHead>
                <TableHead className="text-xs font-semibold">Electricity Conserved</TableHead>
                <TableHead className="text-xs font-semibold">Grid Emission Factor</TableHead>
                <TableHead className="text-xs font-semibold">CO₂ Avoided</TableHead>
                <TableHead className="text-xs font-semibold">Equivalent Trees Absorbed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map(r => (
                <TableRow key={r.month}>
                  <TableCell className="font-bold text-xs text-slate-900">{r.month}</TableCell>
                  <TableCell className="text-xs text-slate-600">{r.energyMwh} MWh</TableCell>
                  <TableCell className="text-xs text-slate-500 font-mono">{r.factor}</TableCell>
                  <TableCell className="text-xs font-bold text-emerald-700">{r.co2Saved}</TableCell>
                  <TableCell className="text-xs text-slate-700">{r.trees}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// 18. Leaderboard Management Page
export function AdminLeaderboardPage() {
  const [ranked, setRanked] = useState<any[]>([])

  useEffect(() => {
    api.get<{ leaderboard: any[] }>('/leaderboard?type=citizen').then(r => setRanked(r.leaderboard || [])).catch(() => {})
  }, [])

  return (
    <div className="space-y-4">
      <PageHeader
        icon={Trophy}
        title="Leaderboard Management"
        description="Monitor public state rankings, citizen privacy consent, and reward distributions."
        badgeText="Public Ranking Board"
      />

      <Card className="border-slate-200/80 shadow-xs">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs font-semibold">Rank</TableHead>
                <TableHead className="text-xs font-semibold">Citizen Display Name</TableHead>
                <TableHead className="text-xs font-semibold">District</TableHead>
                <TableHead className="text-xs font-semibold">Green Points</TableHead>
                <TableHead className="text-xs font-semibold">Missions Done</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ranked.map(u => (
                <TableRow key={u.rank}>
                  <TableCell className="font-bold text-xs text-slate-500">#{u.rank}</TableCell>
                  <TableCell className="font-bold text-xs text-slate-900">{u.name}</TableCell>
                  <TableCell className="text-xs text-slate-600">{u.district || 'Gujarat'}</TableCell>
                  <TableCell className="text-xs font-bold text-emerald-700">{u.points} pts</TableCell>
                  <TableCell className="text-xs text-slate-600">{u.missionsCompleted || 0}</TableCell>
                </TableRow>
              ))}
              {ranked.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-slate-400 text-xs">
                    Leaderboard rankings are being compiled.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// 19. AI System Monitoring Page
export function AdminAiMonitoringPage() {
  const aiModules = [
    { name: 'EcoMitra AI Chat Assistant', type: 'NLP Agent', status: 'Online', latency: '240 ms', requests: '1,420 queries', accuracy: '99.2%' },
    { name: 'Electricity Bill OCR Scanner', type: 'Vision Document AI', status: 'Online', latency: '420 ms', requests: '380 bills scanned', accuracy: '96.8%' },
    { name: 'AI Energy Doctor Diagnostics', type: 'Predictive Rule Engine', status: 'Online', latency: '110 ms', requests: '890 analyses', accuracy: '98.5%' },
    { name: 'Solar Rooftop Estimator', type: 'Irradiance Calculator', status: 'Online', latency: '85 ms', requests: '560 assessments', accuracy: '99.0%' }
  ]

  return (
    <div className="space-y-4">
      <PageHeader
        icon={Cpu}
        title="AI System Monitoring"
        description="Monitor system health, accuracy, and request throughput for all Green Gujarat intelligent tools."
        badgeText="All AI Services Healthy"
      />

      <Card className="border-slate-200/80 shadow-xs">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs font-semibold">AI System / Tool</TableHead>
                <TableHead className="text-xs font-semibold">Architecture</TableHead>
                <TableHead className="text-xs font-semibold">Status</TableHead>
                <TableHead className="text-xs font-semibold">Avg Latency</TableHead>
                <TableHead className="text-xs font-semibold">Monthly Invocations</TableHead>
                <TableHead className="text-xs font-semibold">Accuracy</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {aiModules.map(m => (
                <TableRow key={m.name}>
                  <TableCell className="font-semibold text-xs text-slate-900">{m.name}</TableCell>
                  <TableCell className="text-xs text-slate-600">{m.type}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                      {m.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500 font-mono">{m.latency}</TableCell>
                  <TableCell className="text-xs text-slate-600">{m.requests}</TableCell>
                  <TableCell className="text-xs font-bold text-emerald-700">{m.accuracy}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// 20. Tools Management Page
export function AdminToolsPage() {
  const tools = [
    { name: 'Smart Bill Scanner', code: 'TOOL_SCANNER', status: 'Enabled', tariff: '₹7.50 / kWh', dailyLimit: '5 bills/day' },
    { name: 'AI Energy Doctor', code: 'TOOL_DOCTOR', status: 'Enabled', tariff: 'BEE Guidelines 2024', dailyLimit: 'Unlimited' },
    { name: 'Smart Solar Advisor', code: 'TOOL_SOLAR', status: 'Enabled', tariff: 'PM Surya Ghar Subsidy', dailyLimit: 'Unlimited' },
    { name: 'EcoMitra Conversational AI', code: 'TOOL_ECOMITRA', status: 'Enabled', tariff: 'GEDA Knowledge Base', dailyLimit: '50 msgs/day' }
  ]

  return (
    <div className="space-y-4">
      <PageHeader
        icon={Wrench}
        title="Tools Management"
        description="Configure operational settings, rate limits, and computational benchmarks for citizen tools."
        badgeText="4 Enabled Tools"
      />

      <Card className="border-slate-200/80 shadow-xs">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs font-semibold">Tool Name</TableHead>
                <TableHead className="text-xs font-semibold">System Code</TableHead>
                <TableHead className="text-xs font-semibold">Operational Status</TableHead>
                <TableHead className="text-xs font-semibold">Benchmark Basis</TableHead>
                <TableHead className="text-xs font-semibold">Usage Policy</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tools.map(t => (
                <TableRow key={t.code}>
                  <TableCell className="font-semibold text-xs text-slate-900">{t.name}</TableCell>
                  <TableCell className="text-xs font-mono text-slate-500">{t.code}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                      {t.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">{t.tariff}</TableCell>
                  <TableCell className="text-xs text-slate-600">{t.dailyLimit}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// 21. System Settings Page
export function AdminSettingsPage() {
  const [settings, setSettings] = useState<any[]>([])

  useEffect(() => {
    api.get<{ settings: any[] }>('/admin/settings').then(r => setSettings(r.settings || [])).catch(() => {})
  }, [])

  return (
    <div className="space-y-4">
      <PageHeader
        icon={Sliders}
        title="System Settings"
        description="Manage global platform configurations, electricity tariffs, and emission conversion constants."
        badgeText={`${settings.length} Settings`}
      />

      <Card className="border-slate-200/80 shadow-xs">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs font-semibold">Configuration Key</TableHead>
                <TableHead className="text-xs font-semibold">Current Value</TableHead>
                <TableHead className="text-xs font-semibold">Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {settings.map(s => (
                <TableRow key={s.key}>
                  <TableCell className="font-mono text-xs font-bold text-slate-900">{s.key}</TableCell>
                  <TableCell className="text-xs font-bold text-emerald-700 bg-emerald-50/50 px-2 rounded">
                    {s.value}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 max-w-md">{s.description || 'Global configuration parameter.'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// 22. Audit Logs Page
export function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([])

  useEffect(() => {
    api.get<{ logs: any[] }>('/admin/audit-logs?limit=50').then(r => setLogs(r.logs || [])).catch(() => {})
  }, [])

  return (
    <div className="space-y-4">
      <PageHeader
        icon={ScrollText}
        title="Audit Logs"
        description="Comprehensive immutable audit record of all platform operations, user logins, and administrative changes."
        badgeText={`${logs.length} Recent Logs`}
      />

      <Card className="border-slate-200/80 shadow-xs">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs font-semibold">Timestamp</TableHead>
                <TableHead className="text-xs font-semibold">Action</TableHead>
                <TableHead className="text-xs font-semibold">Actor</TableHead>
                <TableHead className="text-xs font-semibold">Target Resource</TableHead>
                <TableHead className="text-xs font-semibold">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map(l => (
                <TableRow key={l.id}>
                  <TableCell className="text-xs text-slate-500 font-mono whitespace-nowrap">
                    {new Date(l.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] font-semibold">{l.action}</Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-xs text-slate-900">{l.actor}</TableCell>
                  <TableCell className="text-xs text-slate-600">{l.resource}</TableCell>
                  <TableCell className="text-xs text-slate-500 font-mono max-w-sm truncate">{l.details || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

