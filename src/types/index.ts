// Centralised type definitions for GREEN GUJARAT
export type Role = 'CITIZEN' | 'MODERATOR' | 'ADMIN'
export type Language = 'en' | 'gu' | 'hi'

export type MissionCategory =
  | 'ELECTRICITY' | 'WATER' | 'TRANSPORT' | 'WASTE'
  | 'TREE' | 'RENEWABLE' | 'CONSUMPTION'

export type SubmissionStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REQUIRES_REVIEW'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: Role
  publicName?: string
  preferredLang: Language
  isDemo: boolean
  token: string
}

export interface DashboardSummary {
  greenScore: number
  totalPoints: number
  monthlyKwh: number
  monthlyEmissionKg: number
  savingsKwh: number
  savingsPercent: number
  badges: { code: string; name: string; icon: string }[]
  activeMissions: ActiveMission[]
  monthlyConsumption: { month: string; kwh: number; baseline: number }[]
  aiSuggestions: AiSuggestion[]
  recentActivities: RecentActivity[]
}

export interface ActiveMission {
  id: string
  missionId: string
  title: string
  category: MissionCategory
  points: number
  status: SubmissionStatus
  progress: number
}

export interface AiSuggestion {
  id: string
  title: string
  detail: string
  estimatedSavingKwh: number
  estimatedSavingRs: number
  appliance: string
}

export interface RecentActivity {
  id: string
  type: string
  description: string
  points: number
  timestamp: string
}

export interface LeaderboardEntry {
  rank: number
  name: string
  district?: string
  points: number
  missionsCompleted: number
  isCurrentUser?: boolean
}

export interface MapPinsResponse {
  pins: MapPinItem[]
  total: number
  sampleCount: number
}

export interface MapPinItem {
  id: string
  name: string
  category: 'EV_CHARGER' | 'SOLAR_INSTALL' | 'RECYCLING' | 'EVENT' | 'INITIATIVE'
  latitude: number
  longitude: number
  address?: string
  operator?: string
  isVerified: boolean
  isSample: boolean
  metadata?: Record<string, string>
}

export interface DistrictTwin {
  districtId: string
  name: string
  participants: number
  missionsCompleted: number
  savingsKwh: number
  co2ReductionKg: number
  renewableAdoptions: number
  isSample: boolean
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  isFallback?: boolean
  language?: Language
}

export interface AdminMetrics {
  totalCitizens: number
  monthlyActiveUsers: number
  missionsCompleted: number
  pendingVerifications: number
  districtParticipation: { district: string; users: number; missions: number }[]
  reportedSavingsKwh: number
  estimatedCo2ReductionKg: number
  activeCampaigns: number
}
