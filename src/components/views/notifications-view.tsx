'use client'
import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Bell, CheckCheck, Sparkles, Award, Info, AlertTriangle, ArrowRight } from 'lucide-react'
import { api } from '@/lib/api-client'
import { useRouter, type ViewKey } from '@/lib/router'
import { useToast } from '@/hooks/use-toast'

interface NotificationItem {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  link?: string
  createdAt: string
}

export function NotificationsView() {
  const router = useRouter()
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const res = await api.get<{ notifications: NotificationItem[] }>('/notifications')
      setNotifications(res.notifications || [])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  const markAllRead = async () => {
    try {
      await api.patch('/notifications', {})
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      toast({ title: 'All notifications marked as read' })
    } catch {
      // ignore
    }
  }

  const markReadAndGo = async (notif: NotificationItem) => {
    if (!notif.isRead) {
      api.patch('/notifications', { id: notif.id }).catch(() => {})
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n))
    }
    if (notif.link) {
      router.navigate(notif.link as ViewKey)
    }
  }

  if (loading && notifications.length === 0) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        <Skeleton className="h-10 w-48" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="h-6 w-6 text-[#16834A]" /> Notifications
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Stay updated with your mission approvals, energy alerts, and community announcements
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={markAllRead}
          className="text-xs h-8 text-slate-700"
        >
          <CheckCheck className="h-3.5 w-3.5 mr-1" /> Mark all read
        </Button>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <Card
            key={n.id}
            onClick={() => markReadAndGo(n)}
            className={`cursor-pointer transition-all border ${
              n.isRead
                ? 'bg-white border-slate-200/80 hover:border-slate-300'
                : 'bg-emerald-50/40 border-emerald-200/80 hover:bg-emerald-50'
            }`}
          >
            <CardContent className="p-4 flex items-start gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                n.type === 'AWARD'
                  ? 'bg-amber-100 text-amber-700'
                  : n.type === 'SUCCESS'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-blue-100 text-blue-700'
              }`}>
                {n.type === 'AWARD' ? <Award className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-sm ${n.isRead ? 'font-semibold text-slate-900' : 'font-bold text-emerald-950'}`}>
                    {n.title}
                  </span>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                {n.link && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#16834A] mt-2 hover:underline">
                    Take Action <ArrowRight className="h-3 w-3" />
                  </span>
                )}
              </div>

              {!n.isRead && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0" />
              )}
            </CardContent>
          </Card>
        ))}

        {notifications.length === 0 && (
          <Card className="p-8 text-center border-slate-200">
            <Bell className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">No notifications</h3>
            <p className="text-xs text-slate-500 mt-0.5">You are completely up to date.</p>
          </Card>
        )}
      </div>
    </div>
  )
}
