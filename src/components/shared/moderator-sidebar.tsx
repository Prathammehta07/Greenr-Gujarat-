'use client'
import React from 'react'
import {
  LayoutDashboard, Clock, Flag, MessageSquare, History,
  LogOut, ChevronRight
} from 'lucide-react'
import { useRouter, type ViewKey } from '@/lib/router'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/hooks/use-toast'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { GreenGujaratLogo } from './logo'

// Simplified to 5 Core Primary Moderator Navigation Items
const MODERATOR_NAV_ITEMS = [
  { view: 'moderator-dashboard' as ViewKey, label: 'Moderator Overview', icon: LayoutDashboard },
  { view: 'mod-pending' as ViewKey, label: 'Pending Verifications', icon: Clock, badge: 'Live' },
  { view: 'mod-reports' as ViewKey, label: 'Reported Content', icon: Flag, badge: 'Alert' },
  { view: 'mod-posts' as ViewKey, label: 'Community Feed', icon: MessageSquare },
  { view: 'mod-history' as ViewKey, label: 'Verification History', icon: History },
]

interface ModeratorSidebarProps {
  currentView: ViewKey
  onNavigate?: () => void
}

export function ModeratorSidebar({ currentView, onNavigate }: ModeratorSidebarProps) {
  const router = useRouter()
  const { user, logout } = useAuth()
  const { toast } = useToast()

  const handleLogout = async () => {
    await logout()
    toast({ title: 'Logged out', description: 'Moderator session ended successfully.' })
    router.navigate('landing')
  }

  const navigateTo = (v: ViewKey) => {
    router.navigate(v)
    if (onNavigate) onNavigate()
  }

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-100 flex items-center">
        <GreenGujaratLogo
          size="md"
          roleTitle="Community Moderation"
          roleSubtitle="GEDA"
          roleTheme="moderator"
          onClick={() => navigateTo('moderator-dashboard')}
          className="w-full"
        />
      </div>

      {/* Role Pill */}
      <div className="px-4 py-2 bg-blue-50 border-b border-blue-100/60 flex items-center justify-between text-xs">
        <span className="text-blue-900 font-medium">Community Moderator</span>
        <Badge className="bg-[#2563EB] hover:bg-[#2563EB] text-white text-[10px] px-2 py-0.5">
          MODERATOR
        </Badge>
      </div>

      {/* 5 Core Navigation Items */}
      <div className="flex-1 px-3 py-4 space-y-1.5">
        <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Moderator Menu
        </div>
        {MODERATOR_NAV_ITEMS.map((item) => {
          const isActive = currentView === item.view
          const Icon = item.icon
          return (
            <button
              key={item.view}
              onClick={() => navigateTo(item.view)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-[#2563EB] text-white shadow-sm shadow-blue-700/25 ring-1 ring-blue-600/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <span className="truncate">{item.label}</span>
              {item.badge && (
                <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : item.badge === 'Alert'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-blue-100 text-blue-800'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* User Footer & Logout */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/60 space-y-2">
        <button
          onClick={() => navigateTo('profile')}
          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition-colors text-left"
        >
          <Avatar className="h-8 w-8 ring-2 ring-blue-500/30">
            <AvatarFallback className="bg-blue-600 text-white text-xs font-semibold">
              {(user?.name || 'M').split(' ').map(n => n[0]).slice(0, 2).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-slate-900 truncate">{user?.name || 'Moderator'}</div>
            <div className="text-[11px] text-slate-500 truncate">{user?.email}</div>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}
