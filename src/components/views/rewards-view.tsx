'use client'
import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Gift, Award, Sparkles, CheckCircle2, Trophy, ArrowRight, ShieldCheck } from 'lucide-react'
import { api } from '@/lib/api-client'
import { useRouter } from '@/lib/router'
import { useToast } from '@/hooks/use-toast'

interface RewardBadge {
  id: string
  code: string
  name: string
  description: string
  icon: string
  color: string
  points: number
  unlocked: boolean
  awardedAt?: string
}

export function RewardsView() {
  const router = useRouter()
  const { toast } = useToast()
  const [points, setPoints] = useState(0)
  const [badges, setBadges] = useState<RewardBadge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get<{ totalPoints: number }>('/dashboard').catch(() => ({ totalPoints: 0 })),
      api.get<{ badges: RewardBadge[] }>('/badges').catch(() => ({ badges: [] }))
    ])
      .then(([dash, bRes]) => {
        setPoints(dash.totalPoints || 0)
        setBadges(bRes.badges || [])
      })
      .finally(() => setLoading(false))
  }, [])

  const handleClaimPerk = (name: string, cost: number) => {
    if (points < cost) {
      toast({
        title: 'Insufficient Points',
        description: `You need ${cost} Green Points to claim this reward. Complete more missions to earn points!`,
        variant: 'destructive'
      })
      return
    }
    toast({
      title: 'Reward Voucher Claimed!',
      description: `Your ${name} has been issued. Check your email or notifications for details.`
    })
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  const perks = [
    { title: 'GEDA Mission LiFE Certificate', cost: 100, desc: 'Official digital certificate of environmental stewardship signed by GEDA.' },
    { title: 'Energy-Saving LED Pack Voucher', cost: 250, desc: 'Discount voucher redeemable at partner retail outlets across Gujarat.' },
    { title: 'Priority Solar Rooftop Inspection', cost: 400, desc: 'Expedited rooftop technical assessment by accredited solar engineers.' }
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-600 to-[#16834A] p-6 lg:p-8 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold uppercase tracking-wider mb-2 text-amber-100">
              <Gift className="h-3.5 w-3.5" /> Rewards & Green Accreditations
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
              My Green Rewards
            </h1>
            <p className="text-sm text-amber-50 mt-1 max-w-xl">
              Earn official recognition and state-backed sustainability benefits for every verified kilowatt-hour conserved.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-xl border border-white/20 text-center shrink-0">
            <span className="text-xs text-amber-100 uppercase tracking-wider block font-semibold">Available Points</span>
            <span className="text-3xl font-black">{points}</span>
          </div>
        </div>
      </div>

      {/* Badges Collection */}
      <Card className="border-slate-200/80 shadow-xs">
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Award className="h-4 w-4 text-emerald-700" />
            Green Passport Badges
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Badges earned through mission completions and energy efficiency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {badges.map((b) => (
              <div
                key={b.id || b.code}
                className={`p-4 rounded-xl border transition-all text-center flex flex-col items-center justify-between ${
                  b.unlocked
                    ? 'bg-emerald-50/50 border-emerald-300 shadow-xs'
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${
                  b.unlocked ? 'bg-[#16834A] text-white shadow-sm' : 'bg-slate-200 text-slate-400'
                }`}>
                  <Trophy className="h-6 w-6" />
                </div>
                <div className="text-sm font-bold text-slate-900 mb-1">{b.name}</div>
                <p className="text-[11px] text-slate-500 line-clamp-2 mb-3">{b.description}</p>
                {b.unlocked ? (
                  <Badge className="bg-[#16834A] text-white text-[10px]">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Unlocked
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] text-slate-400">
                    Locked
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Redeemable Perks */}
      <Card className="border-slate-200/80 shadow-xs">
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Gift className="h-4 w-4 text-amber-600" />
            Redeemable Perks & Certificates
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Redeem your accumulated Green Points for certified benefits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {perks.map((p) => (
            <div
              key={p.title}
              className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <h4 className="text-sm font-bold text-slate-900">{p.title}</h4>
                <p className="text-xs text-slate-600 mt-0.5">{p.desc}</p>
                <span className="text-xs font-semibold text-amber-700 mt-1 inline-block">
                  Requires {p.cost} Green Points
                </span>
              </div>
              <Button
                size="sm"
                onClick={() => handleClaimPerk(p.title, p.cost)}
                className="bg-[#16834A] hover:bg-[#126b3c] text-white text-xs h-8 shrink-0"
              >
                Claim Perk
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
