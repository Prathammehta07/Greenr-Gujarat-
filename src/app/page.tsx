'use client'
import { useEffect } from 'react'
import { RouterProvider, useRouter } from '@/lib/router'
import { useAuth } from '@/lib/auth-context'
import { AppShell } from '@/components/shared/app-shell'
import { LandingView } from '@/components/views/landing-view'
import { LoginView, RegisterView, ForgotView } from '@/components/views/auth-views'
import { DashboardView } from '@/components/views/dashboard-view'
import { ScannerView } from '@/components/views/scanner-view'
import { DoctorView } from '@/components/views/doctor-view'
import { MissionsView } from '@/components/views/missions-view'
import { PassportView } from '@/components/views/passport-view'
import { LeaderboardView } from '@/components/views/leaderboard-view'
import { SolarView } from '@/components/views/solar-view'
import { AiChatView } from '@/components/views/ai-chat-view'
import { CommunityView } from '@/components/views/community-view'
import { MapView } from '@/components/views/map-view'
import { TwinView } from '@/components/views/twin-view'
import { AdminView } from '@/components/views/admin-view'
import { ProfileView } from '@/components/views/profile-view'

function AppRouter() {
  const { view, navigate } = useRouter()
  const { user, loading } = useAuth()

  // Public views (no auth)
  if (view === 'landing') return <LandingView />
  if (view === 'login') return <LoginView />
  if (view === 'register') return <RegisterView />
  if (view === 'forgot') return <ForgotView />

  // Auth gate
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading GREEN GUJARAT…</p>
        </div>
      </div>
    )
  }
  if (!user) {
    // redirect to login for any protected view
    useEffect(() => { navigate('login') }, [])
    return null
  }

  // Protected views wrapped in app shell
  const renderView = () => {
    switch (view) {
      case 'dashboard': return <DashboardView />
      case 'scanner': return <ScannerView />
      case 'doctor': return <DoctorView />
      case 'missions': return <MissionsView />
      case 'passport': return <PassportView />
      case 'leaderboard': return <LeaderboardView />
      case 'solar': return <SolarView />
      case 'ai': return <AiChatView />
      case 'community': return <CommunityView />
      case 'map': return <MapView />
      case 'twin': return <TwinView />
      case 'admin': return <AdminView />
      case 'profile': return <ProfileView />
      default: return <DashboardView />
    }
  }

  return <AppShell currentView={view}>{renderView()}</AppShell>
}

export default function Home() {
  return (
    <RouterProvider>
      <AppRouter />
    </RouterProvider>
  )
}
