'use client'
// View router context — manages the current "page" without URL routing
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export type ViewKey =
  | 'landing' | 'login' | 'register' | 'forgot'
  | 'dashboard' | 'missions' | 'passport' | 'scanner' | 'doctor'
  | 'solar' | 'community' | 'map' | 'leaderboard' | 'twin' | 'ai'
  | 'admin' | 'profile'

interface RouterValue {
  view: ViewKey
  params: Record<string, unknown>
  navigate: (view: ViewKey, params?: Record<string, unknown>) => void
  back: () => void
}

const RouterContext = createContext<RouterValue | null>(null)

export function RouterProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<ViewKey>('landing')
  const [params, setParams] = useState<Record<string, unknown>>({})
  const [history, setHistory] = useState<ViewKey[]>([])

  const navigate = useCallback((v: ViewKey, p: Record<string, unknown> = {}) => {
    setHistory(h => [...h, view])
    setView(v)
    setParams(p)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'instant' })
  }, [view])

  const back = useCallback(() => {
    setHistory(h => {
      if (h.length === 0) return h
      const prev = h[h.length - 1]
      setView(prev)
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
