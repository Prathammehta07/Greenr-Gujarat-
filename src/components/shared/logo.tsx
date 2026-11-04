'use client'
import React from 'react'

interface GreenGujaratIconProps {
  className?: string
  size?: number
}

/**
 * Green Gujarat Official Brand Mark SVG
 * Features: Solar Rays + Sun Core, Mission LiFE Leaf with Vein Spine, Clean Energy Blue Swirl & Sprout
 */
export function GreenGujaratIcon({ className = 'w-10 h-10', size }: GreenGujaratIconProps) {
  const style = size ? { width: size, height: size } : undefined
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-label="Green Gujarat Logo"
    >
      <defs>
        <linearGradient id="ggIconGreen" x1="15%" y1="90%" x2="85%" y2="10%">
          <stop offset="0%" stopColor="#0E5E33" />
          <stop offset="45%" stopColor="#16834A" />
          <stop offset="100%" stopColor="#22C55E" />
        </linearGradient>

        <linearGradient id="ggIconLightGreen" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#16834A" />
          <stop offset="100%" stopColor="#86EFAC" />
        </linearGradient>

        <linearGradient id="ggIconSun" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        <linearGradient id="ggIconBlue" x1="10%" y1="10%" x2="90%" y2="90%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="50%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1E40AF" />
        </linearGradient>

        <linearGradient id="ggIconBadge" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F0FDF4" />
        </linearGradient>

        <radialGradient id="ggIconGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
        </radialGradient>

        <filter id="ggIconShadow" x="-10%" y="-10%" width="130%" height="130%" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#0E5E33" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* Ambient Radial Soft Glow */}
      <circle cx="60" cy="60" r="54" fill="url(#ggIconGlow)" />

      {/* Shield Base Contour */}
      <rect
        x="8"
        y="8"
        width="104"
        height="104"
        rx="26"
        fill="url(#ggIconBadge)"
        stroke="#86EFAC"
        strokeWidth="2"
        strokeOpacity="0.75"
        filter="url(#ggIconShadow)"
      />

      {/* Solar Rays Arc */}
      <g stroke="url(#ggIconSun)" strokeWidth="2.5" strokeLinecap="round" opacity="0.95">
        <line x1="38" y1="36" x2="30" y2="28" />
        <line x1="48" y1="30" x2="48" y2="20" />
        <line x1="58" y1="36" x2="66" y2="28" />
        <line x1="28" y1="46" x2="18" y2="46" />
      </g>

      {/* Solar Core / Sun Disk */}
      <circle cx="44" cy="48" r="14" fill="url(#ggIconSun)" />

      {/* Clean Energy Dynamic Blue Arc (Wind & Hydro) */}
      <path
        d="M26 78 C34 90, 52 94, 68 88 C58 84, 52 76, 50 68 C40 70, 32 72, 26 78 Z"
        fill="url(#ggIconBlue)"
        opacity="0.92"
      />

      {/* Primary Green Mission LiFE Leaf */}
      <path
        d="M46 88 C46 88, 54 62, 78 44 C88 36, 96 30, 98 22 C98 22, 98 34, 88 52 C76 74, 58 86, 46 88 Z"
        fill="url(#ggIconGreen)"
      />

      {/* Secondary Complementary Leaf Curve */}
      <path
        d="M46 88 C46 88, 62 82, 76 68 C86 58, 92 48, 98 22 C88 28, 72 36, 62 48 C52 60, 48 76, 46 88 Z"
        fill="url(#ggIconLightGreen)"
        opacity="0.85"
      />

      {/* Central Leaf Vein Spine */}
      <path
        d="M48 86 Q68 62 96 24"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.9"
      />

      {/* Delicate Vein Branches */}
      <path d="M60 70 Q68 68 76 70" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
      <path d="M70 56 Q78 52 86 54" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
      <path d="M78 44 Q86 40 92 40" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />

      {/* Energy Golden Sprout Accent */}
      <circle cx="98" cy="22" r="3.2" fill="#FDE047" stroke="#16834A" strokeWidth="1" />
    </svg>
  )
}

interface GreenGujaratLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  roleTitle?: string
  roleSubtitle?: string
  roleTheme?: 'citizen' | 'moderator' | 'admin' | 'default'
  className?: string
  onClick?: () => void
}

export function GreenGujaratLogo({
  size = 'md',
  showText = true,
  roleTitle,
  roleSubtitle,
  roleTheme = 'default',
  className = '',
  onClick
}: GreenGujaratLogoProps) {
  const iconSizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }[size]

  const titleSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  }[size]

  const roleColorClass = {
    citizen: 'text-emerald-700',
    moderator: 'text-blue-700',
    admin: 'text-emerald-800 font-semibold',
    default: 'text-emerald-700'
  }[roleTheme]

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 select-none ${onClick ? 'cursor-pointer group' : ''} ${className}`}
    >
      <div className="shrink-0 transition-transform duration-200 group-hover:scale-105">
        <GreenGujaratIcon className={iconSizeClasses} />
      </div>

      {showText && (
        <div className="flex-1 min-w-0">
          <div className={`font-black tracking-tight text-slate-900 leading-tight flex items-center gap-1.5 ${titleSizeClasses}`}>
            <span>GREEN GUJARAT</span>
          </div>

          <div className={`text-[11px] leading-tight flex items-center gap-1 mt-0.5 ${roleColorClass}`}>
            <span>{roleTitle || 'Mission LiFE'}</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">{roleSubtitle || 'Govt. of Gujarat'}</span>
          </div>
        </div>
      )}
    </div>
  )
}
