// Role-Based Access Control (RBAC) System for GREEN GUJARAT
import type { Role } from '@/types'
import type { ViewKey } from './router'

export const ROLES: Record<string, Role> = {
  CITIZEN: 'CITIZEN',
  MODERATOR: 'MODERATOR',
  ADMIN: 'ADMIN',
}

// Permissions Matrix: which roles can access each ViewKey
export const VIEW_PERMISSIONS: Record<ViewKey, Role[]> = {
  // Public views
  landing: ['CITIZEN', 'MODERATOR', 'ADMIN'],
  login: ['CITIZEN', 'MODERATOR', 'ADMIN'],
  register: ['CITIZEN', 'MODERATOR', 'ADMIN'],
  forgot: ['CITIZEN', 'MODERATOR', 'ADMIN'],

  // Shared account views
  profile: ['CITIZEN', 'MODERATOR', 'ADMIN'],
  notifications: ['CITIZEN', 'MODERATOR', 'ADMIN'],
  settings: ['CITIZEN', 'MODERATOR', 'ADMIN'],

  // Citizen-specific views
  dashboard: ['CITIZEN'],
  'citizen-dashboard': ['CITIZEN'],
  footprint: ['CITIZEN'],
  missions: ['CITIZEN'],
  passport: ['CITIZEN'],
  scanner: ['CITIZEN'],
  doctor: ['CITIZEN'],
  solar: ['CITIZEN'],
  ai: ['CITIZEN'],
  community: ['CITIZEN'],
  map: ['CITIZEN'],
  leaderboard: ['CITIZEN'],
  twin: ['CITIZEN'],
  rewards: ['CITIZEN'],

  // Moderator-specific views
  'moderator-dashboard': ['MODERATOR'],
  'mod-submissions': ['MODERATOR'],
  'mod-pending': ['MODERATOR'],
  'mod-approved': ['MODERATOR'],
  'mod-rejected': ['MODERATOR'],
  'mod-evidence': ['MODERATOR'],
  'mod-posts': ['MODERATOR'],
  'mod-reports': ['MODERATOR'],
  'mod-discussions': ['MODERATOR'],
  'mod-user-reports': ['MODERATOR'],
  'mod-activities': ['MODERATOR'],
  'mod-map': ['MODERATOR'],
  'mod-campaigns': ['MODERATOR'],
  'mod-history': ['MODERATOR'],
  'mod-analytics': ['MODERATOR'],

  // Admin-specific views
  'admin-dashboard': ['ADMIN'],
  'admin-citizens': ['ADMIN'],
  'admin-moderators': ['ADMIN'],
  'admin-user-verification': ['ADMIN'],
  'admin-user-activities': ['ADMIN'],
  'admin-missions': ['ADMIN'],
  'admin-campaigns': ['ADMIN'],
  'admin-passport': ['ADMIN'],
  'admin-rewards': ['ADMIN'],
  'admin-score': ['ADMIN'],
  'admin-community': ['ADMIN'],
  'admin-reports': ['ADMIN'],
  'admin-community-moderation': ['ADMIN'],
  'admin-map': ['ADMIN'],
  'admin-analytics': ['ADMIN'],
  'admin-districts': ['ADMIN'],
  'admin-energy-reports': ['ADMIN'],
  'admin-co2-reports': ['ADMIN'],
  'admin-leaderboard': ['ADMIN'],
  'admin-ai-monitoring': ['ADMIN'],
  'admin-tools': ['ADMIN'],
  'admin-settings': ['ADMIN'],
  'admin-audit-logs': ['ADMIN'],
  admin: ['ADMIN'], // GEDA Admin Control Center
}

export function normalizeRole(role?: string | null): Role {
  if (!role) return 'CITIZEN'
  const upper = role.toUpperCase()
  if (upper === 'ADMIN') return 'ADMIN'
  if (upper === 'MODERATOR') return 'MODERATOR'
  return 'CITIZEN'
}

export function canAccessView(role: string | undefined | null, view: ViewKey): boolean {
  const norm = normalizeRole(role)
  const allowed = VIEW_PERMISSIONS[view]
  if (!allowed) return false
  return allowed.includes(norm)
}

export function getDefaultDashboard(role: string | undefined | null): ViewKey {
  const norm = normalizeRole(role)
  switch (norm) {
    case 'ADMIN':
      return 'admin-dashboard'
    case 'MODERATOR':
      return 'moderator-dashboard'
    case 'CITIZEN':
    default:
      return 'dashboard'
  }
}

export function getRoleBadgeInfo(role: string | undefined | null) {
  const norm = normalizeRole(role)
  switch (norm) {
    case 'ADMIN':
      return {
        label: 'GEDA Admin',
        color: 'bg-emerald-700 text-white',
        border: 'border-emerald-800',
        description: 'Complete GEDA Platform Administration'
      }
    case 'MODERATOR':
      return {
        label: 'Community Moderator',
        color: 'bg-blue-600 text-white',
        border: 'border-blue-700',
        description: 'Verification & Community Moderation'
      }
    case 'CITIZEN':
    default:
      return {
        label: 'Citizen',
        color: 'bg-green-600 text-white',
        border: 'border-green-700',
        description: 'Mission LiFE Citizen'
      }
  }
}
