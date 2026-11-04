'use client'
import React from 'react'
import {
  LayoutDashboard, Users, Target, BarChart3, Shield,
  LogOut, ChevronRight
} from 'lucide-react'
import { useRouter, type ViewKey } from '@/lib/router'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/hooks/use-toast'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { GreenGujaratLogo } from './logo'

// Simplified to 5 Core Primary Admin Navigation Items
const ADMIN_NAV_ITEMS = [
  { view: 'admin-dashboard' as ViewKey, label: 'State Dashboard', icon: LayoutDashboard },
  { view: 'admin-citizens' as ViewKey, label: 'User Management', icon: Users },
  { view: 'admin-missions' as ViewKey, label: 'Mission Management', icon: Target },
  { view: 'admin-analytics' as ViewKey, label: 'State Analytics', icon: BarChart3 },
  { view: 'admin' as ViewKey, label: 'Admin Control Center', icon: Shield, badge: 'Full' },
]

interface AdminSidebarProps {
  currentView: ViewKey
  onNavigate?: () => void
}

export function AdminSidebar({ currentView, onNavigate }: AdminSidebarProps) {
  const router = useRouter()
  const { user, logout } = useAuth()
  const { toast } = useToast()

  const handleLogout = async () => {
    await logout()
    toast({ title: 'Logged out', description: 'GEDA Admin session concluded safely.' })
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
          roleTitle="GEDA Administration"
          roleSubtitle="Govt. of Gujarat"
          roleTheme="admin"
          onClick={() => navigateTo('admin-dashboard')}
          className="w-full"
        />
      </div>

      {/* Role Pill */}
      <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-100/60 flex items-center justify-between text-xs">
        <span className="text-emerald-900 font-semibold">GEDA Authority</span>
        <Badge className="bg-[#16834A] hover:bg-[#16834A] text-white text-[10px] px-2 py-0.5 font-bold">
          ADMIN
        </Badge>
      </div>

      {/* 5 Core Navigation Items */}
      <div className="flex-1 px-3 py-4 space-y-1.5">
        <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          GEDA Admin Menu
        </div>
        {ADMIN_NAV_ITEMS.map((item) => {
          const isActive = currentView === item.view
          const Icon = item.icon
          return (
            <button
              key={item.view}
              onClick={() => navigateTo(item.view)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-[#16834A] text-white shadow-sm shadow-emerald-700/25 ring-1 ring-emerald-600/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <span className="truncate">{item.label}</span>
              {item.badge && (
                <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
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
          <Avatar className="h-8 w-8 ring-2 ring-emerald-600/30">
            <AvatarFallback className="bg-emerald-800 text-white text-xs font-semibold">
              {(user?.name || 'A').split(' ').map(n => n[0]).slice(0, 2).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-slate-900 truncate">{user?.name || 'Administrator'}</div>
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
