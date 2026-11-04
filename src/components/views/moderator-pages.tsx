'use client'
import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import {
  ClipboardList, Clock, CheckCircle2, XCircle, FileSearch,
  MessageSquare, Flag, MessagesSquare, AlertTriangle, Activity,
  MapPin, Megaphone, History, BarChart3, Check, X, Eye
} from 'lucide-react'
import { api } from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'

interface ModHeaderProps {
  icon: React.ElementType
  title: string
  description: string
  badgeText?: string
}

function ModHeader({ icon: Icon, title, description, badgeText }: ModHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-blue-100 text-[#2563EB] flex items-center justify-center shrink-0">
            <Icon className="h-5 w-5" />
          </div>
          <span>{title}</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">{description}</p>
      </div>
      {badgeText && (
        <Badge variant="outline" className="text-xs font-semibold self-start sm:self-auto text-blue-800 border-blue-300 bg-blue-50">
          {badgeText}
        </Badge>
      )}
    </div>
  )
}

// 1. Mission Submissions (All)
export function ModSubmissionsPage() {
  const [submissions, setSubmissions] = useState<any[]>([])

  useEffect(() => {
    Promise.all([
      api.get<{ submissions: any[] }>('/admin/submissions?status=PENDING').catch(() => ({ submissions: [] })),
      api.get<{ submissions: any[] }>('/admin/submissions?status=APPROVED').catch(() => ({ submissions: [] })),
      api.get<{ submissions: any[] }>('/admin/submissions?status=REJECTED').catch(() => ({ submissions: [] }))
    ]).then(([p, a, r]) => {
      setSubmissions([...(p.submissions || []), ...(a.submissions || []), ...(r.submissions || [])])
    })
  }, [])

  return (
    <div className="space-y-4">
      <ModHeader
        icon={ClipboardList}
        title="Mission Submissions"
        description="Comprehensive log of all citizen sustainability mission submissions across Gujarat."
        badgeText={`${submissions.length} Total Submissions`}
      />

      <Card className="border-slate-200/80 shadow-xs">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs font-semibold">Citizen</TableHead>
                <TableHead className="text-xs font-semibold">Mission Title</TableHead>
                <TableHead className="text-xs font-semibold">Category</TableHead>
                <TableHead className="text-xs font-semibold">Points</TableHead>
                <TableHead className="text-xs font-semibold">Status</TableHead>
                <TableHead className="text-xs font-semibold">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-semibold text-xs text-slate-900">{s.userName}</TableCell>
                  <TableCell className="text-xs text-slate-700">{s.missionTitle}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] uppercase">{s.category}</Badge>
                  </TableCell>
                  <TableCell className="text-xs font-bold text-emerald-700">+{s.points} pts</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      s.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : s.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                    }`}>
                      {s.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
              {submissions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-slate-400 text-xs">
                    No submissions found.
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

// 2. Pending Verification Page
export function ModPendingPage() {
  const [pending, setPending] = useState<any[]>([])
  const { toast } = useToast()

  const load = () => {
    api.get<{ submissions: any[] }>('/admin/submissions?status=PENDING').then(r => setPending(r.submissions || [])).catch(() => {})
  }

  useEffect(() => { load() }, [])

  const review = async (id: string, action: 'approve' | 'reject') => {
    try {
      await api.post('/admin/submissions', {
        submissionId: id,
        action,
        note: action === 'approve' ? 'Verified evidence submitted.' : 'Evidence insufficient for verification.'
      })
      toast({
        title: action === 'approve' ? 'Mission Approved' : 'Mission Rejected',
        description: action === 'approve' ? 'Points awarded to citizen.' : 'Rejection notice sent.'
      })
      load()
    } catch {
      toast({ title: 'Review action failed', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-4">
      <ModHeader
        icon={Clock}
        title="Pending Verification"
        description="Submissions requiring moderator evidence review before Green Points are credited to citizens."
        badgeText={`${pending.length} Awaiting Review`}
      />

      <Card className="border-slate-200/80 shadow-xs">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs font-semibold">Citizen</TableHead>
                <TableHead className="text-xs font-semibold">Mission</TableHead>
                <TableHead className="text-xs font-semibold">Submitted Evidence Statement</TableHead>
                <TableHead className="text-xs font-semibold">Points</TableHead>
                <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pending.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-semibold text-xs text-slate-900">{s.userName}</TableCell>
                  <TableCell className="text-xs font-medium text-slate-800">{s.missionTitle}</TableCell>
                  <TableCell className="text-xs text-slate-600 max-w-sm truncate italic">
                    &quot;{s.evidenceText || 'No text note provided.'}&quot;
                  </TableCell>
                  <TableCell className="text-xs font-bold text-emerald-700">+{s.points} pts</TableCell>
                  <TableCell className="text-right space-x-1.5 whitespace-nowrap">
                    <Button size="sm" onClick={() => review(s.id, 'approve')} className="h-7 text-xs bg-[#16834A] hover:bg-[#126b3c] text-white">
                      <Check className="h-3 w-3 mr-1" /> Approve
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => review(s.id, 'reject')} className="h-7 text-xs">
                      <X className="h-3 w-3 mr-1" /> Reject
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {pending.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-400 text-xs">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600 mx-auto mb-1 opacity-70" />
                    All pending submissions have been verified!
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

// 3. Approved Missions Page
export function ModApprovedPage() {
  const [approved, setApproved] = useState<any[]>([])

  useEffect(() => {
    api.get<{ submissions: any[] }>('/admin/submissions?status=APPROVED').then(r => setApproved(r.submissions || [])).catch(() => {})
  }, [])

  return (
    <div className="space-y-4">
      <ModHeader
        icon={CheckCircle2}
        title="Approved Missions"
        description="All mission submissions that passed moderator verification with points credited."
        badgeText={`${approved.length} Approved`}
      />

      <Card className="border-slate-200/80 shadow-xs">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs font-semibold">Citizen Name</TableHead>
                <TableHead className="text-xs font-semibold">Mission Completed</TableHead>
                <TableHead className="text-xs font-semibold">Category</TableHead>
                <TableHead className="text-xs font-semibold">Points Credited</TableHead>
                <TableHead className="text-xs font-semibold">Reviewer Feedback</TableHead>
                <TableHead className="text-xs font-semibold">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {approved.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-semibold text-xs text-slate-900">{s.userName}</TableCell>
                  <TableCell className="text-xs text-slate-800">{s.missionTitle}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] uppercase">{s.category}</Badge>
                  </TableCell>
                  <TableCell className="text-xs font-bold text-emerald-700">+{s.points} pts</TableCell>
                  <TableCell className="text-xs text-slate-600 italic">&quot;{s.reviewNote || 'Verified evidence.'}&quot;</TableCell>
                  <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
              {approved.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-slate-400 text-xs">
                    No approved submissions found.
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

// 4. Rejected Missions Page
export function ModRejectedPage() {
  const [rejected, setRejected] = useState<any[]>([])

  useEffect(() => {
    api.get<{ submissions: any[] }>('/admin/submissions?status=REJECTED').then(r => setRejected(r.submissions || [])).catch(() => {})
  }, [])

  return (
    <div className="space-y-4">
      <ModHeader
        icon={XCircle}
        title="Rejected Missions"
        description="Submissions that failed verification requirements or lacked valid photo evidence."
        badgeText={`${rejected.length} Rejected`}
      />

      <Card className="border-slate-200/80 shadow-xs">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs font-semibold">Citizen Name</TableHead>
                <TableHead className="text-xs font-semibold">Mission</TableHead>
                <TableHead className="text-xs font-semibold">Category</TableHead>
                <TableHead className="text-xs font-semibold">Moderator Feedback / Reason</TableHead>
                <TableHead className="text-xs font-semibold">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rejected.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-semibold text-xs text-slate-900">{s.userName}</TableCell>
                  <TableCell className="text-xs text-slate-800">{s.missionTitle}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] uppercase">{s.category}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-rose-700 italic">&quot;{s.reviewNote || 'Photo unclear or criteria not met.'}&quot;</TableCell>
                  <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
              {rejected.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-slate-400 text-xs">
                    No rejected submissions recorded.
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

// 5. Mission Evidence Review Page
export function ModEvidencePage() {
  const [evidenceList, setEvidenceList] = useState<any[]>([])
  const [selected, setSelected] = useState<any | null>(null)

  useEffect(() => {
    api.get<{ submissions: any[] }>('/admin/submissions?status=PENDING').then(r => setEvidenceList(r.submissions || [])).catch(() => {})
  }, [])

  return (
    <div className="space-y-4">
      <ModHeader
        icon={FileSearch}
        title="Mission Evidence Review"
        description="Deep inspection of uploaded photos, meter readings, receipts, and sustainability artifacts."
        badgeText="Evidence Inspector"
      />

      <Card className="border-slate-200/80 shadow-xs">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs font-semibold">Mission Task</TableHead>
                <TableHead className="text-xs font-semibold">Citizen</TableHead>
                <TableHead className="text-xs font-semibold">Evidence Summary</TableHead>
                <TableHead className="text-xs font-semibold">Uploaded File</TableHead>
                <TableHead className="text-xs font-semibold">Submission Date</TableHead>
                <TableHead className="text-xs font-semibold text-right">Inspect</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {evidenceList.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-semibold text-xs text-slate-900">{s.missionTitle}</TableCell>
                  <TableCell className="text-xs text-slate-700">{s.userName}</TableCell>
                  <TableCell className="text-xs text-slate-600 max-w-xs truncate">{s.evidenceText || 'Photo evidence attached'}</TableCell>
                  <TableCell className="text-xs font-mono text-blue-700 truncate max-w-[120px]">{s.evidenceFile || '/uploads/evidence.jpg'}</TableCell>
                  <TableCell className="text-xs text-slate-500 whitespace-nowrap">{new Date(s.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => setSelected(s)} className="h-7 text-xs">
                      <Eye className="h-3 w-3 mr-1" /> View Full
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {evidenceList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-slate-400 text-xs">
                    No evidence awaiting inspection.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">Evidence Detail</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">{selected?.missionTitle} by {selected?.userName}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-semibold text-slate-700 block mb-1">Citizen Statement:</span>
              <p className="text-slate-800 italic">{selected?.evidenceText || 'No text notes provided.'}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-semibold text-slate-700 block mb-1">Simulated File Artifact:</span>
              <p className="font-mono text-blue-700">{selected?.evidenceFile || 'evidence.jpg'}</p>
            </div>
          </div>
          <DialogFooter>
            <Button size="sm" variant="outline" onClick={() => setSelected(null)} className="text-xs">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// 6. Community Posts Page
export function ModPostsPage() {
  const posts = [
    { author: 'Bhavik Shah', category: 'Solar Adoption', content: 'Installed 4kW rooftop solar system in Satellite, Ahmedabad. Generated 18 units today.', likes: 24, comments: 2, status: 'Active' },
    { author: 'Meera Dave', category: 'Waste Reduction', content: 'Surat society diverted 250 kg wet waste to organic compost this month.', likes: 38, comments: 2, status: 'Active' },
    { author: 'Priyank Trivedi', category: 'Green Mobility', content: 'Cycling 8 km to work at Infocity Gandhinagar instead of using the car.', likes: 19, comments: 1, status: 'Active' },
    { author: 'Kinjal Solanki', category: 'Energy Efficiency', content: 'Replaced halogen lights in our clinic with 7W LEDs. Bill dropped by 32%.', likes: 15, comments: 1, status: 'Active' },
    { author: 'Kunal Soni', category: 'Water Conservation', content: 'Installed dual-flush cisterns across 12 flats in our society in Vadodara.', likes: 21, comments: 3, status: 'Active' }
  ]

  return (
    <div className="space-y-4">
      <ModHeader
        icon={MessageSquare}
        title="Community Posts"
        description="Monitor citizen public posts, environmental discussions, and society clean initiatives."
        badgeText={`${posts.length} Posts Active`}
      />

      <Card className="border-slate-200/80 shadow-xs">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs font-semibold">Author</TableHead>
                <TableHead className="text-xs font-semibold">Category</TableHead>
                <TableHead className="text-xs font-semibold">Post Content</TableHead>
                <TableHead className="text-xs font-semibold">Engagement</TableHead>
                <TableHead className="text-xs font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((p, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-semibold text-xs text-slate-900">{p.author}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">{p.category}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 max-w-sm truncate">{p.content}</TableCell>
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

// 7. Reported Content Page
export function ModReportsPage() {
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
        resolution: hide ? 'Hidden by Moderator' : 'Dismissed as clean',
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
      <ModHeader
        icon={Flag}
        title="Reported Content"
        description="Review community reports, hide inappropriate advertisements or spam, and resolve user flags."
        badgeText={`${reports.length} Open Flags`}
      />

      <Card className="border-slate-200/80 shadow-xs">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs font-semibold">Report Reason</TableHead>
                <TableHead className="text-xs font-semibold">Author</TableHead>
                <TableHead className="text-xs font-semibold">Reported Content</TableHead>
                <TableHead className="text-xs font-semibold">Reported By</TableHead>
                <TableHead className="text-xs font-semibold text-right">Moderator Actions</TableHead>
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
                  <TableCell className="text-right space-x-1.5 whitespace-nowrap">
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
                    No open reports in queue.
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

// 8. Comments & Discussions Page
export function ModDiscussionsPage() {
  const discussions = [
    { commenter: 'Yashraj Jadeja', post: 'Rooftop Solar 4kW in Satellite', text: 'Which inverter brand did you opt for? Any hybrid grid-tie issues?', date: '2026-11-03', status: 'Clean' },
    { commenter: 'Binita Chokshi', post: 'Surat Society Wet Waste Composting', text: 'Inspirational model! Does your RWA accept outside society visitors on weekends?', date: '2026-11-02', status: 'Clean' },
    { commenter: 'Manish Gadhvi', post: 'BRTS Cycling Corridors Gandhinagar', text: 'Cycle corridor safety lights are excellent near Sector 11.', date: '2026-11-01', status: 'Clean' },
    { commenter: 'Rupal Kapadia', post: 'Clinic LED Conversion', text: 'How many units did you replace? We are planning the same in our school building.', date: '2026-11-01', status: 'Clean' }
  ]

  return (
    <div className="space-y-4">
      <ModHeader
        icon={MessagesSquare}
        title="Comments & Discussions"
        description="Monitor citizen conversation threads, replies, and community question replies across Gujarat."
        badgeText="Community Threads"
      />

      <Card className="border-slate-200/80 shadow-xs">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs font-semibold">Commenter</TableHead>
                <TableHead className="text-xs font-semibold">Thread Topic</TableHead>
                <TableHead className="text-xs font-semibold">Comment Message</TableHead>
                <TableHead className="text-xs font-semibold">Date</TableHead>
                <TableHead className="text-xs font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {discussions.map((d, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-semibold text-xs text-slate-900">{d.commenter}</TableCell>
                  <TableCell className="text-xs text-slate-600">{d.post}</TableCell>
                  <TableCell className="text-xs text-slate-700 max-w-sm truncate italic">&quot;{d.text}&quot;</TableCell>
                  <TableCell className="text-xs text-slate-500 whitespace-nowrap">{d.date}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                      {d.status}
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

// 9. User Reports Page
export function ModUserReportsPage() {
  const userReports = [
    { id: 'REP-101', category: 'Commercial Spam', reporter: 'Meera Dave', target: 'Unverified battery promotion link', date: '2026-11-03', status: 'Open' },
    { id: 'REP-102', category: 'Off-topic Content', reporter: 'Bhavik Shah', target: 'Political debate in tree plantation thread', date: '2026-11-02', status: 'Resolved' },
    { id: 'REP-103', category: 'Duplicate Submission', reporter: 'Priyank Trivedi', target: 'Same AC challenge uploaded twice', date: '2026-11-01', status: 'Resolved' }
  ]

  return (
    <div className="space-y-4">
      <ModHeader
        icon={AlertTriangle}
        title="User Reports"
        description="Log of user reports and policy compliance alerts filed by community members."
        badgeText="Incident Queue"
      />

      <Card className="border-slate-200/80 shadow-xs">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs font-semibold">Report ID</TableHead>
                <TableHead className="text-xs font-semibold">Category</TableHead>
                <TableHead className="text-xs font-semibold">Filed By</TableHead>
                <TableHead className="text-xs font-semibold">Incident Details</TableHead>
                <TableHead className="text-xs font-semibold">Date</TableHead>
                <TableHead className="text-xs font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userReports.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs font-bold text-slate-900">{r.id}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">{r.category}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">{r.reporter}</TableCell>
                  <TableCell className="text-xs text-slate-700">{r.target}</TableCell>
                  <TableCell className="text-xs text-slate-500 whitespace-nowrap">{r.date}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      r.status === 'Open' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
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

// 10. Community Activities Page
export function ModActivitiesPage() {
  const activities = [
    { citizen: 'Meera Dave', action: 'Joined Community', detail: 'Surat Solar Sangathan', time: '10 mins ago' },
    { citizen: 'Bhavik Shah', action: 'Submitted Evidence', detail: 'LED Bulb Replacement Challenge (Ahmedabad)', time: '35 mins ago' },
    { citizen: 'Priyank Trivedi', action: 'Earned Badge', detail: 'Green Warrior (Gandhinagar)', time: '1 hour ago' },
    { citizen: 'Kinjal Solanki', action: 'Completed Mission', detail: '24°C AC Challenge (Vadodara)', time: '2 hours ago' },
    { citizen: 'Kunal Soni', action: 'Shared Discussion', detail: 'Rainwater harvesting filter setup', time: '4 hours ago' }
  ]

  return (
    <div className="space-y-4">
      <ModHeader
        icon={Activity}
        title="Community Activities"
        description="Live stream of citizen participation, joined communities, and Mission LiFE actions."
        badgeText="Real-time Stream"
      />

      <Card className="border-slate-200/80 shadow-xs">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs font-semibold">Citizen Name</TableHead>
                <TableHead className="text-xs font-semibold">Action Type</TableHead>
                <TableHead className="text-xs font-semibold">Activity Details</TableHead>
                <TableHead className="text-xs font-semibold">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((a, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-semibold text-xs text-slate-900">{a.citizen}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">{a.action}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-slate-700">{a.detail}</TableCell>
                  <TableCell className="text-xs text-slate-500 whitespace-nowrap">{a.time}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// 11. Green Map Monitoring Page
export function ModMapPage() {
  const [pins, setPins] = useState<any[]>([])

  useEffect(() => {
    api.get<{ pins: any[] }>('/map/pins').then(r => setPins(r.pins || [])).catch(() => {})
  }, [])

  return (
    <div className="space-y-4">
      <ModHeader
        icon={MapPin}
        title="Green Map Monitoring"
        description="Audit and verify physical location and operational accuracy for Gujarat green facilities."
        badgeText={`${pins.length} Facilities Under Monitoring`}
      />

      <Card className="border-slate-200/80 shadow-xs">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs font-semibold">Facility Name</TableHead>
                <TableHead className="text-xs font-semibold">Category</TableHead>
                <TableHead className="text-xs font-semibold">Operator / Sponsor</TableHead>
                <TableHead className="text-xs font-semibold">Location Coordinates</TableHead>
                <TableHead className="text-xs font-semibold">Audit Status</TableHead>
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

// 12. Campaign Monitoring Page
export function ModCampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([])

  useEffect(() => {
    api.get<{ campaigns: any[] }>('/admin/campaigns?resource=campaigns').then(r => setCampaigns(r.campaigns || [])).catch(() => {})
  }, [])

  return (
    <div className="space-y-4">
      <ModHeader
        icon={Megaphone}
        title="Campaign Monitoring"
        description="Monitor citizen turnout, organizer compliance, and field engagement during sustainability drives."
        badgeText="Community Drives"
      />

      <Card className="border-slate-200/80 shadow-xs">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs font-semibold">Campaign Drive</TableHead>
                <TableHead className="text-xs font-semibold">Organizer</TableHead>
                <TableHead className="text-xs font-semibold">Location / District</TableHead>
                <TableHead className="text-xs font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-semibold text-xs text-slate-900">{c.title}</TableCell>
                  <TableCell className="text-xs text-slate-600">{c.organizer || 'Community RWA'}</TableCell>
                  <TableCell className="text-xs text-slate-600">{c.location || 'Gujarat'}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                      {c.status || 'Active'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {campaigns.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-slate-400 text-xs">
                    No active campaigns listed.
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

// 13. Verification History Page
export function ModHistoryPage() {
  const [history, setHistory] = useState<any[]>([])

  useEffect(() => {
    api.get<{ recentReviews: any[] }>('/moderator/metrics').then(r => setHistory(r.recentReviews || [])).catch(() => {})
  }, [])

  return (
    <div className="space-y-4">
      <ModHeader
        icon={History}
        title="Verification History"
        description="Immutable chronological record of mission submissions approved and rejected by moderators."
        badgeText="Audit Trail"
      />

      <Card className="border-slate-200/80 shadow-xs">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs font-semibold">Mission Completed</TableHead>
                <TableHead className="text-xs font-semibold">Citizen</TableHead>
                <TableHead className="text-xs font-semibold">Outcome</TableHead>
                <TableHead className="text-xs font-semibold">Points Awarded</TableHead>
                <TableHead className="text-xs font-semibold">Reviewer Note</TableHead>
                <TableHead className="text-xs font-semibold">Reviewed Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map(h => (
                <TableRow key={h.id}>
                  <TableCell className="font-semibold text-xs text-slate-900">{h.missionTitle}</TableCell>
                  <TableCell className="text-xs text-slate-700">{h.userName}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      h.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {h.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs font-bold text-emerald-700">+{h.points} pts</TableCell>
                  <TableCell className="text-xs text-slate-600 italic">&quot;{h.reviewNote || 'Verified'}&quot;</TableCell>
                  <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                    {h.reviewedAt ? new Date(h.reviewedAt).toLocaleDateString() : 'Recent'}
                  </TableCell>
                </TableRow>
              ))}
              {history.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-slate-400 text-xs">
                    No moderation history logged.
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

// 14. Moderation Analytics Page
export function ModAnalyticsPage() {
  const kpis = [
    { metric: 'Average Verification Response Time', current: '1.4 hours', benchmark: '< 4.0 hours', status: 'Excellent' },
    { metric: 'Mission Evidence Approval Rate', current: '78.5%', benchmark: '70% - 85%', status: 'Normal' },
    { metric: 'Report Resolution Turnaround', current: '42 mins', benchmark: '< 2 hours', status: 'Optimal' },
    { metric: 'Daily Submissions Processed', current: '28 submissions/day', benchmark: '> 20/day', status: 'Active' },
    { metric: 'False Flag Dismissal Rate', current: '12.0%', benchmark: '< 15%', status: 'Healthy' }
  ]

  return (
    <div className="space-y-4">
      <ModHeader
        icon={BarChart3}
        title="Moderation Analytics"
        description="Operational metrics, verification response SLAs, and community health performance."
        badgeText="SLA Compliance: 99.4%"
      />

      <Card className="border-slate-200/80 shadow-xs">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs font-semibold">Moderation Dimension</TableHead>
                <TableHead className="text-xs font-semibold">Current Value</TableHead>
                <TableHead className="text-xs font-semibold">Target Benchmark</TableHead>
                <TableHead className="text-xs font-semibold">Quality Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kpis.map(k => (
                <TableRow key={k.metric}>
                  <TableCell className="font-semibold text-xs text-slate-900">{k.metric}</TableCell>
                  <TableCell className="text-xs font-bold text-blue-700">{k.current}</TableCell>
                  <TableCell className="text-xs text-slate-600">{k.benchmark}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                      {k.status}
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

