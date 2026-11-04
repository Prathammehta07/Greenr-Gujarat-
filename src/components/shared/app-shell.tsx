'use client'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import {
  Menu, Languages, Sparkles, Shield, ShieldAlert,
  Bell, CheckCircle2, AlertTriangle, ExternalLink
} from 'lucide-react'
import { useRouter, type ViewKey } from '@/lib/router'
import { useAuth } from '@/lib/auth-context'
import type { Language } from '@/types'
import { CitizenSidebar } from './citizen-sidebar'
import { ModeratorSidebar } from './moderator-sidebar'
import { AdminSidebar } from './admin-sidebar'
import { normalizeRole } from '@/lib/rbac'
import { GreenGujaratIcon } from './logo'

interface AppShellProps {
  children: React.ReactNode
  currentView: ViewKey
}

export function AppShell({ children, currentView }: AppShellProps) {
  const router = useRouter()
  const { user, lang, setLang } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  if (!user) return null

  const role = normalizeRole(user.role)

  const renderSidebar = (onNav?: () => void) => {
    switch (role) {
      case 'ADMIN':
        return <AdminSidebar currentView={currentView} onNavigate={onNav} />
      case 'MODERATOR':
        return <ModeratorSidebar currentView={currentView} onNavigate={onNav} />
      case 'CITIZEN':
      default:
        return <CitizenSidebar currentView={currentView} onNavigate={onNav} />
    }
  }

  const roleBadge = () => {
    switch (role) {
      case 'ADMIN':
        return (
          <Badge className="bg-emerald-700 hover:bg-emerald-700 text-white font-medium text-xs px-2.5 py-0.5 flex items-center gap-1 shadow-sm">
            <Shield className="h-3 w-3" /> GEDA Administration
          </Badge>
        )
      case 'MODERATOR':
        return (
          <Badge className="bg-blue-600 hover:bg-blue-600 text-white font-medium text-xs px-2.5 py-0.5 flex items-center gap-1 shadow-sm">
            <ShieldAlert className="h-3 w-3" /> Community Moderator
          </Badge>
        )
      case 'CITIZEN':
      default:
        return (
          <Badge className="bg-[#16834A] hover:bg-[#16834A] text-white font-medium text-xs px-2.5 py-0.5 flex items-center gap-1 shadow-sm">
            Mission LiFE Citizen
          </Badge>
        )
    }
  }

  const getViewTitle = (v: ViewKey): string => {
    switch (v) {
      case 'dashboard':
      case 'citizen-dashboard': return 'Citizen Dashboard'
      case 'missions': return 'Daily Green Missions'
      case 'scanner': return 'Smart Bill Scanner'
      case 'doctor': return 'AI Energy Doctor'
      case 'community': return 'Green Community Hub'
      case 'passport': return 'Green Passport'
      case 'rewards': return 'My Rewards'
      case 'solar': return 'Smart Solar Advisor'
      case 'map': return 'Gujarat Green Map'
      case 'twin': return 'Gujarat Green Digital Twin'
      case 'leaderboard': return 'State & District Leaderboard'
      case 'moderator-dashboard': return 'Community Moderation Overview'
      case 'mod-pending': return 'Mission Verification Queue'
      case 'mod-reports': return 'Reported Content & Flags'
      case 'mod-posts': return 'Community Discussion Feed'
      case 'mod-history': return 'Verification History & Audit'
      case 'admin-dashboard': return 'Gujarat State Administration'
      case 'admin-citizens': return 'Citizen & User Registry'
      case 'admin-missions': return 'Green Mission Management'
      case 'admin-analytics': return 'Gujarat State Analytics'
      case 'admin': return 'GEDA Admin Control Center'
      default: return 'Overview'
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-50/50">
      {/* Desktop Sidebar (Fixed Width, Height 100vh) */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col sticky top-0 h-screen z-20">
        {renderSidebar()}
      </aside>

      {/* Mobile Drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-200 flex items-center justify-between px-4 py-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <GreenGujaratIcon className="w-8 h-8 shrink-0" />
            <div className="text-left">
              <span className="font-bold text-sm tracking-tight text-slate-900 block leading-none">GREEN GUJARAT</span>
              <span className="text-[10px] text-slate-500 font-medium">
                {role === 'ADMIN' ? 'GEDA Admin' : role === 'MODERATOR' ? 'Moderator Portal' : 'Citizen Portal'}
              </span>
            </div>
          </div>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-slate-600">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
        </div>
        <SheetContent side="left" className="w-72 p-0">
          {renderSidebar(() => setMobileOpen(false))}
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar (Desktop) */}
        <header className="hidden lg:flex items-center justify-between px-8 py-3.5 border-b border-slate-200/80 bg-white/95 backdrop-blur-xs sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Portal</span>
              <span className="text-slate-300">/</span>
              <span className="text-sm font-bold text-slate-900">{getViewTitle(currentView)}</span>
            </div>
            <div className="h-4 w-px bg-slate-200 mx-1" />
            <div className="text-xs font-medium text-slate-600">
              Welcome, <span className="font-semibold text-slate-900">{user.name}</span>
            </div>
            {roleBadge()}
          </div>

          <div className="flex items-center gap-3">
            {role === 'CITIZEN' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.navigate('ai')}
                className="text-[#16834A] border-emerald-200 hover:bg-emerald-50 h-8 text-xs font-semibold gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5" /> Ask EcoMitra AI
              </Button>
            )}

            {role === 'MODERATOR' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.navigate('mod-pending')}
                className="text-blue-700 border-blue-200 hover:bg-blue-50 h-8 text-xs font-semibold gap-1.5"
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Verification Queue
              </Button>
            )}

            {role === 'ADMIN' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.navigate('admin')}
                className="text-emerald-800 border-emerald-300 hover:bg-emerald-50 h-8 text-xs font-semibold gap-1.5"
              >
                <Shield className="h-3.5 w-3.5" /> Admin Control Center
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.navigate('notifications')}
              className="relative text-slate-600 hover:text-slate-900 h-8 w-8 rounded-lg"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white" />
            </Button>

            <div className="h-4 w-px bg-slate-200" />
            <LangSwitcher lang={lang} setLang={setLang} />
          </div>
        </header>

        {/* View Content */}
        <main className="flex-1 p-4 lg:p-8 pt-18 lg:pt-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

function LangSwitcher({ lang, setLang }: { lang: Language; setLang: (l: Language) => void }) {
  const [open, setOpen] = useState(false)
  const langs: { code: Language; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'gu', label: 'ગુજરાતી' },
    { code: 'hi', label: 'हिन्दी' }
  ]
  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(o => !o)}
        className="h-8 text-xs text-slate-700 hover:text-slate-900 gap-1 px-2.5"
      >
        <Languages className="h-3.5 w-3.5" />
        <span>{langs.find(l => l.code === lang)?.label}</span>
      </Button>
      {open && (
        <div className="absolute right-0 mt-1 w-32 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50">
          {langs.map(l => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code); setOpen(false) }}
              className={`block w-full text-left px-3 py-1.5 text-xs hover:bg-slate-100 transition-colors ${
                lang === l.code ? 'font-semibold text-emerald-700 bg-emerald-50' : 'text-slate-700'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
