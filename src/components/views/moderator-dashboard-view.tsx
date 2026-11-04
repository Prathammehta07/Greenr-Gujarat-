'use client'
import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  ShieldAlert, Clock, CheckCircle2, XCircle, Flag, Users, Activity,
  FileSearch, MessageSquare, AlertTriangle, Eye, ThumbsUp, ThumbsDown,
  RefreshCw, Check, X, Shield, Lock, ExternalLink, Calendar, Filter
} from 'lucide-react'
import { api } from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/lib/auth-context'
import { useRouter, type ViewKey } from '@/lib/router'

interface ModeratorMetrics {
  pendingVerifications: number
  approvedSubmissions: number
  rejectedSubmissions: number
  openReports: number
  activeMembers: number
  totalDiscussions: number
  verificationRate: number
}

interface PendingSubmission {
  id: string
  missionId: string
  missionTitle: string
  category: string
  points: number
  userId: string
  userName: string
  userEmail: string
  district: string
  evidenceText?: string
  evidenceFile?: string
  status: string
  createdAt: string
}

interface OpenReport {
  id: string
  reason: string
  details?: string
  postId?: string
  postContent: string
  postAuthor: string
  reporterName: string
  status: string
  createdAt: string
}

interface RecentReview {
  id: string
  missionTitle: string
  userName: string
  status: string
  points: number
  reviewNote?: string
  reviewedAt: string
}

interface ModeratorData {
  metrics: ModeratorMetrics
  pendingSubmissions: PendingSubmission[]
  openReports: OpenReport[]
  recentReviews: RecentReview[]
  categoryBreakdown: { category: string; count: number }[]
}

interface ModeratorDashboardProps {
  initialTab?: string
}

export function ModeratorDashboardView({ initialTab = 'overview' }: ModeratorDashboardProps) {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState(initialTab)
  const [data, setData] = useState<ModeratorData | null>(null)
  const [loading, setLoading] = useState(true)

  // Review modal state
  const [reviewItem, setReviewItem] = useState<PendingSubmission | null>(null)
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve')
  const [reviewNote, setReviewNote] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  // Evidence preview modal
  const [previewItem, setPreviewItem] = useState<PendingSubmission | null>(null)

  // Report resolution modal
  const [reportItem, setReportItem] = useState<OpenReport | null>(null)
  const [resolvingReport, setResolvingReport] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      const res = await api.get<ModeratorData>('/moderator/metrics')
      setData(res)
    } catch {
      toast({
        title: 'Error loading moderation data',
        description: 'Could not fetch current verification queues.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Update activeTab if initialTab changes from parent
  useEffect(() => {
    if (initialTab) setActiveTab(initialTab)
  }, [initialTab])

  const handleReviewSubmit = async () => {
    if (!reviewItem) return
    try {
      setSubmittingReview(true)
      await api.post('/admin/submissions', {
        submissionId: reviewItem.id,
        action: reviewAction,
        note: reviewNote || (reviewAction === 'approve' ? 'Verified evidence submitted.' : 'Evidence insufficient for verification.')
      })
      toast({
        title: reviewAction === 'approve' ? 'Mission Approved' : 'Mission Rejected',
        description: reviewAction === 'approve'
          ? `Awarded ${reviewItem.points} Green Points to ${reviewItem.userName}.`
          : `Rejection notice sent to citizen.`
      })
      setReviewItem(null)
      setReviewNote('')
      loadData()
    } catch (e) {
      toast({
        title: 'Review action failed',
        description: e instanceof Error ? e.message : 'Please try again',
        variant: 'destructive'
      })
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleResolveReport = async (action: 'hide' | 'dismiss') => {
    if (!reportItem) return
    try {
      setResolvingReport(true)
      await api.post('/admin/campaigns', {
        action: 'resolve_report',
        reportId: reportItem.id,
        resolution: action === 'hide' ? 'Content hidden due to policy violation' : 'Reviewed and dismissed as clean',
        hidePost: action === 'hide'
      })
      toast({
        title: action === 'hide' ? 'Inappropriate Content Hidden' : 'Report Dismissed',
        description: action === 'hide' ? 'Post has been removed from community view.' : 'No violation found.'
      })
      setReportItem(null)
      loadData()
    } catch (e) {
      toast({
        title: 'Report action failed',
        description: e instanceof Error ? e.message : 'Please try again',
        variant: 'destructive'
      })
    } finally {
      setResolvingReport(false)
    }
  }

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    )
  }

  const metrics = data?.metrics || {
    pendingVerifications: 0,
    approvedSubmissions: 0,
    rejectedSubmissions: 0,
    openReports: 0,
    activeMembers: 0,
    totalDiscussions: 0,
    verificationRate: 100
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Moderator Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#1E40AF] via-[#2563EB] to-[#3B82F6] p-6 lg:p-8 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider mb-2 text-blue-100">
              <ShieldAlert className="h-3.5 w-3.5" /> GEDA Community Moderation Portal
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
              Community Moderation Dashboard
            </h1>
            <p className="text-sm text-blue-100 mt-1 max-w-2xl">
              Verify Mission LiFE citizen submissions, authenticate uploaded green evidence, and safeguard healthy community engagement across Gujarat.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              onClick={loadData}
              variant="outline"
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white border-white/25 text-xs h-9"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh Queue
            </Button>
          </div>
        </div>
      </div>

      {/* Moderator Restrictions Reminder Banner */}
      <Alert className="bg-amber-50/80 border-amber-200 text-amber-900">
        <Lock className="h-4 w-4 text-amber-700 mt-0.5" />
        <AlertTitle className="text-xs font-bold text-amber-800 uppercase tracking-wide">
          Moderator Scope & Permissions
        </AlertTitle>
        <AlertDescription className="text-xs text-amber-700/90 mt-0.5">
          You have permission to review mission evidence, approve/reject submissions, and moderate reported posts.
          System settings, user role elevation, and audit logs are restricted to GEDA Administration.
        </AlertDescription>
      </Alert>

      {/* Moderation Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Verifications */}
        <Card className={`border-slate-200/80 shadow-xs ${metrics.pendingVerifications > 0 ? 'bg-amber-50/40 border-amber-200' : ''}`}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Review</span>
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-amber-600">{metrics.pendingVerifications}</span>
              <span className="text-xs text-slate-500">submissions</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">Requires evidence check</p>
          </CardContent>
        </Card>

        {/* Approved Missions */}
        <Card className="border-slate-200/80 shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Approved</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#16834A] flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#16834A]">{metrics.approvedSubmissions}</span>
              <span className="text-xs text-slate-500">verified</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">Points credited to citizens</p>
          </CardContent>
        </Card>

        {/* Open Reports */}
        <Card className={`border-slate-200/80 shadow-xs ${metrics.openReports > 0 ? 'bg-rose-50/40 border-rose-200' : ''}`}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Reported Posts</span>
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                <Flag className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-rose-600">{metrics.openReports}</span>
              <span className="text-xs text-slate-500">open flags</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">Spam & inappropriate flags</p>
          </CardContent>
        </Card>

        {/* Active Community Members */}
        <Card className="border-slate-200/80 shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Members</span>
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">{metrics.activeMembers}</span>
              <span className="text-xs text-slate-500">citizens active</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">In Gujarat Mission LiFE</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Queue Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'overview'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Mission Verification Queue ({data?.pendingSubmissions.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'reports'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Reported Content Queue ({data?.openReports.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'history'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Verification History ({data?.recentReviews.length || 0})
        </button>
      </div>

      {/* TAB 1: Mission Verification Queue */}
      {activeTab === 'overview' && (
        <Card className="border-slate-200/80 shadow-xs">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileSearch className="h-4 w-4 text-blue-600" />
                Pending Mission Submissions
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Inspect evidence text and uploaded activity artifacts before awarding Green Points
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs text-blue-700 bg-blue-50 border-blue-200">
              {data?.pendingSubmissions.length || 0} Awaiting Review
            </Badge>
          </CardHeader>
          <CardContent>
            {(!data?.pendingSubmissions || data.pendingSubmissions.length === 0) ? (
              <div className="text-center py-12 text-slate-400">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                <h4 className="font-bold text-slate-700 text-sm">All caught up!</h4>
                <p className="text-xs text-slate-500 mt-1">There are no pending submissions requiring verification right now.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {data.pendingSubmissions.map((sub) => (
                  <div key={sub.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-900">{sub.missionTitle}</span>
                        <Badge variant="secondary" className="text-[10px] uppercase font-bold">
                          {sub.category}
                        </Badge>
                        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 text-[10px]">
                          +{sub.points} pts
                        </Badge>
                      </div>

                      <div className="text-xs text-slate-600 flex items-center gap-2">
                        <span className="font-semibold text-slate-800">{sub.userName}</span>
                        <span className="text-slate-300">•</span>
                        <span>{sub.district}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-400">{new Date(sub.createdAt).toLocaleString()}</span>
                      </div>

                      {sub.evidenceText && (
                        <div className="p-2.5 rounded-lg bg-slate-50 text-xs text-slate-700 border border-slate-200/60 line-clamp-2">
                          <span className="font-semibold text-slate-900 mr-1">Submitted Evidence:</span>
                          {sub.evidenceText}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPreviewItem(sub)}
                        className="text-xs h-8 text-slate-700"
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" /> View Evidence
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          setReviewItem(sub)
                          setReviewAction('approve')
                        }}
                        className="bg-[#16834A] hover:bg-[#126b3c] text-white text-xs h-8"
                      >
                        <Check className="h-3.5 w-3.5 mr-1" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setReviewItem(sub)
                          setReviewAction('reject')
                        }}
                        className="text-xs h-8"
                      >
                        <X className="h-3.5 w-3.5 mr-1" /> Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB 2: Reported Content Queue */}
      {activeTab === 'reports' && (
        <Card className="border-slate-200/80 shadow-xs">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Flag className="h-4 w-4 text-rose-600" />
                Reported Community Posts & Comments
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Review flagged posts to prevent spam, non-green content, or inappropriate activities
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs text-rose-700 bg-rose-50 border-rose-200">
              {data?.openReports.length || 0} Open Flags
            </Badge>
          </CardHeader>
          <CardContent>
            {(!data?.openReports || data.openReports.length === 0) ? (
              <div className="text-center py-12 text-slate-400">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                <h4 className="font-bold text-slate-700 text-sm">Community is clean!</h4>
                <p className="text-xs text-slate-500 mt-1">No community reports pending review.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {data.openReports.map((rep) => (
                  <div key={rep.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className="bg-rose-100 text-rose-800 text-[10px] font-bold">
                          {rep.reason}
                        </Badge>
                        <span className="text-xs text-slate-400">
                          Reported by {rep.reporterName} on {new Date(rep.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800">
                        <div className="font-semibold text-slate-700 mb-1">Post by {rep.postAuthor}:</div>
                        <p className="italic text-slate-900">&quot;{rep.postContent}&quot;</p>
                        {rep.details && (
                          <div className="text-[11px] text-slate-500 mt-1">
                            Reporter note: {rep.details}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        onClick={() => {
                          setReportItem(rep)
                          handleResolveReport('hide')
                        }}
                        className="bg-rose-600 hover:bg-rose-700 text-white text-xs h-8"
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1" /> Hide Content
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setReportItem(rep)
                          handleResolveReport('dismiss')
                        }}
                        className="text-xs h-8 text-slate-700"
                      >
                        <Check className="h-3.5 w-3.5 mr-1" /> Dismiss
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB 3: Verification History */}
      {activeTab === 'history' && (
        <Card className="border-slate-200/80 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600" />
              Recent Moderation History
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Audit trail of previously reviewed mission submissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(!data?.recentReviews || data.recentReviews.length === 0) ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No recent review history found.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {data.recentReviews.map((rev) => (
                  <div key={rev.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{rev.missionTitle}</div>
                      <div className="text-xs text-slate-500">
                        Citizen: {rev.userName} • {rev.reviewedAt ? new Date(rev.reviewedAt).toLocaleDateString() : 'Recently'}
                      </div>
                      {rev.reviewNote && (
                        <div className="text-[11px] text-slate-600 italic mt-0.5">&quot;{rev.reviewNote}&quot;</div>
                      )}
                    </div>
                    <div>
                      {rev.status === 'APPROVED' ? (
                        <Badge className="bg-emerald-100 text-[#16834A] text-xs font-semibold">
                          Approved (+{rev.points} pts)
                        </Badge>
                      ) : (
                        <Badge className="bg-rose-100 text-rose-800 text-xs font-semibold">
                          Rejected
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Approve / Reject Dialog */}
      <Dialog open={!!reviewItem} onOpenChange={() => setReviewItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              {reviewAction === 'approve' ? 'Approve Mission Submission' : 'Reject Mission Submission'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              {reviewAction === 'approve'
                ? `Award ${reviewItem?.points} Green Points to ${reviewItem?.userName}.`
                : `Specify reasons why this submission does not meet verification criteria.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="text-xs font-medium text-slate-700">
              Mission: <span className="font-bold text-slate-900">{reviewItem?.missionTitle}</span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Review Note (optional feedback)</label>
              <Textarea
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder={reviewAction === 'approve' ? 'Clear evidence verified. Excellent work!' : 'Please upload photo with readable date or clearer focus.'}
                className="text-xs min-h-[80px]"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setReviewItem(null)} className="text-xs">
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={submittingReview}
              onClick={handleReviewSubmit}
              className={`text-xs text-white ${reviewAction === 'approve' ? 'bg-[#16834A] hover:bg-[#126b3c]' : 'bg-rose-600 hover:bg-rose-700'}`}
            >
              {submittingReview ? 'Processing...' : reviewAction === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Evidence Full Preview Modal */}
      <Dialog open={!!previewItem} onOpenChange={() => setPreviewItem(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileSearch className="h-4 w-4 text-blue-600" />
              Submission Evidence Review
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              {previewItem?.missionTitle} by {previewItem?.userName} ({previewItem?.district})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-xs font-bold text-slate-700 mb-1">Citizen Statement:</div>
              <p className="text-xs text-slate-800 whitespace-pre-wrap">
                {previewItem?.evidenceText || 'No text evidence entered.'}
              </p>
            </div>

            {previewItem?.evidenceFile && (
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-slate-700">Attached Artifact:</div>
                <div className="p-4 rounded-lg bg-slate-100 border border-dashed border-slate-300 text-center">
                  <div className="text-xs text-slate-600 font-mono mb-2">{previewItem.evidenceFile}</div>
                  <Badge variant="outline" className="text-[10px] text-blue-700 bg-white">
                    Simulated verified photo capture
                  </Badge>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button size="sm" variant="outline" onClick={() => setPreviewItem(null)} className="text-xs">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
