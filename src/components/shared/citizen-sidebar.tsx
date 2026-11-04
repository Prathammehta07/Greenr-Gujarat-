'use client'
import React from 'react'
import {
  LayoutDashboard, Target, ScanLine, Stethoscope,
  Users, BookUser, Gift, Bell, User, Settings,
  LogOut, ChevronRight, Award, Compass
} from 'lucide-react'
import { useRouter, type ViewKey } from '@/lib/router'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/hooks/use-toast'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { GreenGujaratLogo } from './logo'

// Simplified to 5 Core Primary Citizen Navigation Items
const CITIZEN_NAV_ITEMS = [
  { view: 'dashboard' as ViewKey, label: 'My Dashboard', icon: LayoutDashboard },
  { view: 'missions' as ViewKey, label: 'Green Missions', icon: Target },
  { view: 'scanner' as ViewKey, label: 'Bill Scanner', icon: ScanLine },
  { view: 'doctor' as ViewKey, label: 'AI Energy Doctor', icon: Stethoscope },
  { view: 'community' as ViewKey, label: 'Community Hub', icon: Users },
]

interface CitizenSidebarProps {
  currentView: ViewKey
  onNavigate?: () => void
}

export function CitizenSidebar({ currentView, onNavigate }: CitizenSidebarProps) {
  const router = useRouter()
  const { user, logout } = useAuth()
  const { toast } = useToast()

  const handleLogout = async () => {
    await logout()
    toast({ title: 'Logged out', description: 'See you again on your Mission LiFE journey!' })
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
          roleTitle="Citizen Portal"
          roleSubtitle="Mission LiFE"
          roleTheme="citizen"
          onClick={() => navigateTo('dashboard')}
          className="w-full"
        />
      </div>

      {/* Role Pill */}
      <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-100/60 flex items-center justify-between text-xs">
        <span className="text-emerald-900 font-medium">Logged in as Citizen</span>
        <Badge className="bg-[#16834A] hover:bg-[#16834A] text-white text-[10px] px-2 py-0.5">
          CITIZEN
        </Badge>
      </div>

      {/* 5 Core Navigation Items */}
      <div className="flex-1 px-3 py-4 space-y-1.5">
        <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Citizen Menu
        </div>
        {CITIZEN_NAV_ITEMS.map((item) => {
          const isActive = currentView === item.view || (item.view === 'dashboard' && currentView === 'citizen-dashboard')
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
            </button>
          )
        })}

        {/* Quick Extras Pill Card */}
        <div className="pt-4 px-1">
          <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 space-y-2">
            <div className="text-[11px] font-semibold text-emerald-900 flex items-center justify-between">
              <span>My Sustainability</span>
              <span className="text-[10px] bg-emerald-200/60 text-emerald-800 px-1.5 py-0.2 rounded font-bold">Active</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => navigateTo('passport')}
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  currentView === 'passport'
                    ? 'bg-[#16834A] text-white border-transparent'
                    : 'bg-white hover:bg-emerald-100/50 text-emerald-800 border-emerald-200/60'
                }`}
              >
                <Award className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">Passport</span>
              </button>
              <button
                onClick={() => navigateTo('rewards')}
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  currentView === 'rewards'
                    ? 'bg-[#16834A] text-white border-transparent'
                    : 'bg-white hover:bg-emerald-100/50 text-emerald-800 border-emerald-200/60'
                }`}
              >
                <Gift className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">Rewards</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* User Footer & Logout */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/60 space-y-2">
        <button
          onClick={() => navigateTo('profile')}
          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition-colors text-left"
        >
          <Avatar className="h-8 w-8 ring-2 ring-emerald-500/30">
            <AvatarFallback style={{ backgroundColor: user?.profile?.avatarColor || '#16834A' }} className="text-white text-xs font-semibold">
              {(user?.name || 'C').split(' ').map(n => n[0]).slice(0, 2).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-slate-900 truncate">{user?.name || 'Citizen'}</div>
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
