'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Leaf, LayoutDashboard, Footprints, BookUser, ScanLine, Stethoscope,
  Sun, Users, MapPin, Trophy, Globe, MessageCircle, Shield, Settings,
  Menu, LogOut, Languages, Sparkles
} from 'lucide-react'
import { useRouter, type ViewKey } from '@/lib/router'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/hooks/use-toast'
import type { Language } from '@/types'

interface NavItem {
  view: ViewKey
  label: string
  icon: React.ElementType
  roles?: string[] // restrict to roles; if omitted, all authenticated users
  group: 'citizen' | 'tools' | 'community' | 'admin'
}

const NAV: NavItem[] = [
  { view: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'citizen' },
  { view: 'missions', label: 'Green Missions', icon: Footprints, group: 'citizen' },
  { view: 'passport', label: 'Green Passport', icon: BookUser, group: 'citizen' },
  { view: 'scanner', label: 'Bill Scanner', icon: ScanLine, group: 'tools' },
  { view: 'doctor', label: 'AI Energy Doctor', icon: Stethoscope, group: 'tools' },
  { view: 'solar', label: 'Solar Advisor', icon: Sun, group: 'tools' },
  { view: 'ai', label: 'EcoMitra AI', icon: MessageCircle, group: 'tools' },
  { view: 'community', label: 'Community Hub', icon: Users, group: 'community' },
  { view: 'map', label: 'Green Map', icon: MapPin, group: 'community' },
  { view: 'leaderboard', label: 'Leaderboard', icon: Trophy, group: 'community' },
  { view: 'twin', label: 'Digital Twin', icon: Globe, group: 'community' },
  { view: 'admin', label: 'Admin Center', icon: Shield, roles: ['ADMIN', 'MODERATOR'], group: 'admin' },
  { view: 'profile', label: 'Profile', icon: Settings, group: 'admin' }
]

export function AppShell({ children, currentView }: { children: React.ReactNode; currentView: ViewKey }) {
  const router = useRouter()
  const { user, logout, lang, setLang } = useAuth()
  const { toast } = useToast()
  const [mobileOpen, setMobileOpen] = useState(false)

  if (!user) return null

  const visibleNav = NAV.filter(n => !n.roles || n.roles.includes(user.role))
  const groups: { key: NavItem['group']; label: string }[] = [
    { key: 'citizen', label: 'Personal' },
    { key: 'tools', label: 'Tools' },
    { key: 'community', label: 'Community' },
    { key: 'admin', label: 'Account & Admin' }
  ]

  const handleLogout = async () => {
    await logout()
    toast({ title: 'Logged out', description: 'See you soon!' })
    router.navigate('landing')
  }

  const NavList = () => (
    <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto scroll-thin">
      {groups.map(g => {
        const items = visibleNav.filter(n => n.group === g.key)
        if (items.length === 0) return null
        return (
          <div key={g.key}>
            <div className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{g.label}</div>
            <div className="space-y-1">
              {items.map(item => {
                const active = currentView === item.view
                return (
                  <button
                    key={item.view}
                    onClick={() => { router.navigate(item.view); setMobileOpen(false) }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      active ? 'bg-primary text-primary-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                    {item.view === 'admin' && user.role === 'ADMIN' && (
                      <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0 h-4">ADMIN</Badge>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </nav>
  )

  const Brand = () => (
    <button onClick={() => router.navigate('dashboard')} className="flex items-center gap-2 px-4 py-4 hover:opacity-80">
      <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
        <Leaf className="h-5 w-5 text-primary-foreground" />
      </div>
      <div className="text-left">
        <div className="font-bold text-sm leading-tight">GREEN GUJARAT</div>
        <div className="text-[10px] text-muted-foreground">Mission LiFE</div>
      </div>
    </button>
  )

  const UserCard = () => (
    <div className="p-3 border-t border-sidebar-border">
      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent cursor-pointer" onClick={() => router.navigate('profile')}>
        <Avatar className="h-9 w-9">
          <AvatarFallback style={{ backgroundColor: user.profile?.avatarColor || '#16834A' }} className="text-white text-xs">
            {user.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{user.name}</div>
          <div className="text-xs text-muted-foreground truncate">
            {user.role === 'CITIZEN' ? 'Citizen' : user.role === 'MODERATOR' ? 'Moderator' : 'GEDA Admin'}
            {user.isDemo && ' · Demo'}
          </div>
        </div>
        <button onClick={(e) => { e.stopPropagation(); handleLogout() }} className="text-muted-foreground hover:text-foreground p-1" title="Logout">
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-sidebar border-r border-sidebar-border sticky top-0 h-screen">
        <Brand />
        <NavList />
        <UserCard />
      </aside>

      {/* Mobile drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-background border-b flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Leaf className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-sm">GREEN GUJARAT</span>
          </div>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon"><Menu className="h-5 w-5" /></Button>
          </SheetTrigger>
        </div>
        <SheetContent side="left" className="w-72 p-0">
          <div className="flex flex-col h-full">
            <Brand />
            <NavList />
            <UserCard />
          </div>
        </SheetContent>
      </Sheet>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar (desktop) */}
        <header className="hidden lg:flex items-center justify-between px-6 py-3 border-b bg-card sticky top-0 z-30">
          <div className="text-sm text-muted-foreground">
            Welcome back, <span className="font-medium text-foreground">{user.name.split(' ')[0]}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.navigate('ai')} className="text-primary">
              <Sparkles className="h-4 w-4 mr-1" /> Ask EcoMitra
            </Button>
            <LangSwitcher lang={lang} setLang={setLang} />
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6 pt-16 lg:pt-6">
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
      <Button variant="ghost" size="sm" onClick={() => setOpen(o => !o)}>
        <Languages className="h-4 w-4 mr-1" />
        {langs.find(l => l.code === lang)?.label}
      </Button>
      {open && (
        <div className="absolute right-0 mt-1 w-32 bg-popover border rounded-lg shadow-md z-50">
          {langs.map(l => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code); setOpen(false) }}
              className={`block w-full text-left px-3 py-2 text-sm hover:bg-accent ${lang === l.code ? 'font-semibold text-primary' : ''}`}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
