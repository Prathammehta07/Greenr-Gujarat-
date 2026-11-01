'use client'
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { api } from './api-client'
import type { Role, Language } from '@/types'

interface AuthState {
  user: {
    id: string
    email: string
    name: string
    role: Role
    preferredLang: Language
    isDemo: boolean
    publicName?: string
    consentPublic?: boolean
    profile?: {
      districtId?: string
      districtName?: string
      cityVillage?: string
      householdSize?: number
      homeType?: string
      monthlyKwh?: number | null
      hasRooftopSolar?: boolean
      solarCapacityKw?: number | null
      bio?: string
      avatarColor?: string
    } | null
  } | null
  loading: boolean
}

interface AuthContextValue extends AuthState {
  refresh: () => Promise<void>
  logout: () => Promise<void>
  lang: Language
  setLang: (l: Language) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, loading: true })
  const [lang, setLangState] = useState<Language>('en')

  const refresh = useCallback(async () => {
    try {
      const data = await api.get<{ user: AuthState['user'] }>('/auth/me')
      setState({ user: data.user, loading: false })
      if (data.user?.preferredLang) setLangState(data.user.preferredLang as Language)
    } catch {
      setState({ user: null, loading: false })
    }
  }, [])

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout') } catch {}
    setState({ user: null, loading: false })
  }, [])

  const setLang = useCallback((l: Language) => {
    setLangState(l)
    // persist to profile if logged in
    if (state.user) {
      api.patch('/profile', { preferredLang: l }).catch(() => {})
    }
  }, [state.user])

  useEffect(() => {
    refresh()
  }, [refresh])

  return (
    <AuthContext.Provider value={{ ...state, refresh, logout, lang, setLang }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
