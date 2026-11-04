'use client'
// View router context — manages the current view with URL hash synchronization & history
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

export type ViewKey =
  | 'landing' | 'login' | 'register' | 'forgot'
  // Citizen views
  | 'dashboard' | 'citizen-dashboard' | 'footprint' | 'missions' | 'passport'
  | 'scanner' | 'doctor' | 'solar' | 'ai' | 'community' | 'map' | 'leaderboard' | 'twin'
  | 'rewards'
  // Moderator views
  | 'moderator-dashboard' | 'mod-submissions' | 'mod-pending' | 'mod-approved' | 'mod-rejected'
  | 'mod-evidence' | 'mod-posts' | 'mod-reports' | 'mod-discussions' | 'mod-user-reports'
  | 'mod-activities' | 'mod-map' | 'mod-campaigns' | 'mod-history' | 'mod-analytics'
  // Admin views
  | 'admin-dashboard' | 'admin-citizens' | 'admin-moderators' | 'admin-user-verification'
  | 'admin-user-activities' | 'admin-missions' | 'admin-campaigns' | 'admin-passport'
  | 'admin-rewards' | 'admin-score' | 'admin-community' | 'admin-reports'
  | 'admin-community-moderation' | 'admin-map' | 'admin-analytics' | 'admin-districts'
  | 'admin-energy-reports' | 'admin-co2-reports' | 'admin-leaderboard' | 'admin-ai-monitoring'
  | 'admin-tools' | 'admin-settings' | 'admin-audit-logs' | 'admin'
  // Account views
  | 'profile' | 'notifications' | 'settings'

interface RouterValue {
  view: ViewKey
  params: Record<string, unknown>
  navigate: (view: ViewKey, params?: Record<string, unknown>) => void
  back: () => void
}

const RouterContext = createContext<RouterValue | null>(null)

function getHashView(): ViewKey | null {
  if (typeof window === 'undefined') return null
  const hash = window.location.hash.replace(/^#\/?/, '').trim()
  if (!hash) return null
  return hash as ViewKey
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<ViewKey>(() => {
    return getHashView() || 'landing'
  })
  const [params, setParams] = useState<Record<string, unknown>>({})
  const [history, setHistory] = useState<ViewKey[]>([])

  // Listen for hash changes (e.g. back/forward navigation or manual URL input)
  useEffect(() => {
    const onHashChange = () => {
      const hv = getHashView()
      if (hv && hv !== view) {
        setView(hv)
      }
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [view])

  const navigate = useCallback((v: ViewKey, p: Record<string, unknown> = {}) => {
    setHistory(h => [...h, view])
    setView(v)
    setParams(p)
    if (typeof window !== 'undefined') {
      window.location.hash = `#${v}`
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  }, [view])

  const back = useCallback(() => {
    setHistory(h => {
      if (h.length === 0) return h
      const prev = h[h.length - 1]
      setView(prev)
      if (typeof window !== 'undefined') {
        window.location.hash = `#${prev}`
      }
      return h.slice(0, -1)
    })
  }, [])

  return (
    <RouterContext.Provider value={{ view, params, navigate, back }}>
      {children}
    </RouterContext.Provider>
  )
}

export function useRouter() {
  const ctx = useContext(RouterContext)
  if (!ctx) throw new Error('useRouter must be inside RouterProvider')
  return ctx
}
