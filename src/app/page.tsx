'use client'
import { useEffect, useState } from 'react'
import { RouterProvider, useRouter, type ViewKey } from '@/lib/router'
import { useAuth } from '@/lib/auth-context'
import { canAccessView, getDefaultDashboard, normalizeRole } from '@/lib/rbac'
import { AppShell } from '@/components/shared/app-shell'
import { LandingView } from '@/components/views/landing-view'
import { LoginView, RegisterView, ForgotView } from '@/components/views/auth-views'
import { CitizenDashboardView } from '@/components/views/citizen-dashboard-view'
import { ModeratorDashboardView } from '@/components/views/moderator-dashboard-view'
import { AdminDashboardView } from '@/components/views/admin-dashboard-view'
import { ScannerView } from '@/components/views/scanner-view'
import { DoctorView } from '@/components/views/doctor-view'
import { MissionsView } from '@/components/views/missions-view'
import { PassportView } from '@/components/views/passport-view'
import { LeaderboardView } from '@/components/views/leaderboard-view'
import { SolarView } from '@/components/views/solar-view'
import { AiChatView } from '@/components/views/ai-chat-view'
import { CommunityView } from '@/components/views/community-view'
import { ProfileView } from '@/components/views/profile-view'
import { NotificationsView } from '@/components/views/notifications-view'
import { FootprintView } from '@/components/views/footprint-view'
import { RewardsView } from '@/components/views/rewards-view'
import { SettingsView } from '@/components/views/settings-view'
import { AdminView } from '@/components/views/admin-view'
import {
  AdminCitizensPage,
  AdminModeratorsPage,
  AdminUserVerificationPage,
  AdminUserActivitiesPage,
  AdminMissionsPage,
  AdminCampaignsPage,
  AdminPassportPage,
  AdminRewardsPage,
  AdminScorePage,
  AdminCommunityPage,
  AdminReportsPage,
  AdminCommunityModerationPage,
  AdminMapPage,
  AdminAnalyticsPage,
  AdminDistrictsPage,
  AdminEnergyReportsPage,
  AdminCo2ReportsPage,
  AdminLeaderboardPage,
  AdminAiMonitoringPage,
  AdminToolsPage,
  AdminSettingsPage,
  AdminAuditLogsPage
} from '@/components/views/admin-pages'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ShieldAlert } from 'lucide-react'
import dynamic from 'next/dynamic'

const MapView = dynamic(() => import('@/components/views/map-view').then(mod => mod.MapView), {
  ssr: false,
  loading: () => <div className="p-8 text-center text-muted-foreground">Loading Green Map...</div>,
})

const TwinView = dynamic(() => import('@/components/views/twin-view').then(mod => mod.TwinView), {
  ssr: false,
  loading: () => <div className="p-8 text-center text-muted-foreground">Loading Gujarat Digital Twin...</div>,
})

function AppRouter() {
  const { view, navigate } = useRouter()
  const { user, loading } = useAuth()

  // Public views (no auth required)
  if (view === 'landing') return <LandingView />
  if (view === 'login') return <LoginView />
  if (view === 'register') return <RegisterView />
  if (view === 'forgot') return <ForgotView />

  // Auth gate
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#16834A] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-600">Loading GREEN GUJARAT…</p>
        </div>
      </div>
    )
  }

  // Unauthenticated user attempting to access protected route
  if (!user) {
    return <LoginView />
  }

  const role = normalizeRole(user.role)

  // Enforce Role-Based Access Control on current View
  const allowed = canAccessView(role, view)

  if (!allowed) {
    const defaultView = getDefaultDashboard(role)
    return (
      <AppShell currentView={defaultView}>
        <div className="max-w-xl mx-auto my-12 space-y-4">
          <Alert variant="destructive" className="border-rose-300 bg-rose-50 text-rose-900">
            <ShieldAlert className="h-5 w-5 text-rose-600" />
            <AlertTitle className="font-bold text-sm">Access Denied: Restricted Module</AlertTitle>
            <AlertDescription className="text-xs mt-1">
              Your account role (<span className="font-bold uppercase">{role}</span>) does not have authorization to view the requested route (<code>#{view}</code>).
            </AlertDescription>
          </Alert>
          <div className="text-center">
            <button
              onClick={() => navigate(defaultView)}
              className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-lg bg-[#16834A] text-white hover:bg-[#126b3c]"
            >
              Return to Your Role Dashboard
            </button>
          </div>
        </div>
      </AppShell>
    )
  }

  // Protected views wrapped in app shell
  const renderView = () => {
    switch (view) {
      // CITIZEN DASHBOARD & MODULES
      case 'dashboard':
      case 'citizen-dashboard':
        return <CitizenDashboardView />
      case 'footprint':
        return <FootprintView />
      case 'rewards':
        return <RewardsView />
      case 'missions':
        return <MissionsView />
      case 'passport':
        return <PassportView />
      case 'scanner':
        return <ScannerView />
      case 'doctor':
        return <DoctorView />
      case 'solar':
        return <SolarView />
      case 'ai':
        return <AiChatView />
      case 'community':
        return <CommunityView />
      case 'map':
        return <MapView />
      case 'leaderboard':
        return <LeaderboardView />
      case 'twin':
        return <TwinView />

      // MODERATOR DASHBOARD & MODULES
      case 'moderator-dashboard':
      case 'mod-submissions':
      case 'mod-pending':
      case 'mod-approved':
      case 'mod-rejected':
      case 'mod-evidence':
        return <ModeratorDashboardView initialTab="overview" />
      case 'mod-posts':
      case 'mod-reports':
      case 'mod-discussions':
      case 'mod-user-reports':
      case 'mod-activities':
        return <ModeratorDashboardView initialTab="reports" />
      case 'mod-history':
      case 'mod-analytics':
        return <ModeratorDashboardView initialTab="history" />
      case 'mod-map':
        return <MapView />
      case 'mod-campaigns':
        return <ModeratorDashboardView initialTab="overview" />

      // ADMIN DASHBOARD & SEPARATE DEDICATED PAGES
      case 'admin-dashboard':
        return <AdminDashboardView />
      case 'admin-citizens':
        return <AdminCitizensPage />
      case 'admin-moderators':
        return <AdminModeratorsPage />
      case 'admin-user-verification':
        return <AdminUserVerificationPage />
      case 'admin-user-activities':
        return <AdminUserActivitiesPage />
      case 'admin-missions':
        return <AdminMissionsPage />
      case 'admin-campaigns':
        return <AdminCampaignsPage />
      case 'admin-passport':
        return <AdminPassportPage />
      case 'admin-rewards':
        return <AdminRewardsPage />
      case 'admin-score':
        return <AdminScorePage />
      case 'admin-community':
        return <AdminCommunityPage />
      case 'admin-reports':
        return <AdminReportsPage />
      case 'admin-community-moderation':
        return <AdminCommunityModerationPage />
      case 'admin-map':
        return <AdminMapPage />
      case 'admin-analytics':
        return <AdminAnalyticsPage />
      case 'admin-districts':
        return <AdminDistrictsPage />
      case 'admin-energy-reports':
        return <AdminEnergyReportsPage />
      case 'admin-co2-reports':
        return <AdminCo2ReportsPage />
      case 'admin-leaderboard':
        return <AdminLeaderboardPage />
      case 'admin-ai-monitoring':
        return <AdminAiMonitoringPage />
      case 'admin-tools':
        return <AdminToolsPage />
      case 'admin-settings':
        return <AdminSettingsPage />
      case 'admin-audit-logs':
        return <AdminAuditLogsPage />
      case 'admin':
        return <AdminView initialTab="overview" />

      // SHARED ACCOUNT VIEWS
      case 'notifications':
        return <NotificationsView />
      case 'profile':
        return <ProfileView />
      case 'settings':
        return <SettingsView />

      default:
        return role === 'ADMIN' ? <AdminDashboardView /> : role === 'MODERATOR' ? <ModeratorDashboardView /> : <CitizenDashboardView />
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
