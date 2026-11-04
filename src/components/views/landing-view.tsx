'use client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Leaf, Zap, Sun, Users, Trophy, MapPin, ArrowRight, Sparkles,
  Footprints, Recycle, Droplets, Wind, ShieldCheck, CheckCircle2,
  ChevronRight, Award, Compass, BarChart3, Clock, Sparkle,
  Check, ArrowUpRight, TrendingUp, ScanLine, UserCheck, Shield,
  Globe2, Building2, Flame
} from 'lucide-react'
import { useRouter } from '@/lib/router'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api-client'
import { GreenGujaratIcon } from '@/components/shared/logo'

interface ImpactStats {
  realCitizens: number
  demoAccounts: number
  totalParticipants: number
  activeMissions: number
  verifiedActions: number
  electricitySavedKwh: number
  co2ReducedKg: number
  communities: number
  verifiedGreenLocations: number
  note: string
}

const FEATURES = [
  {
    icon: Zap,
    title: 'Smart Bill Scanner',
    desc: 'Instant OCR scanner for Torrent, DGVCL, PGVCL, MGVCL, UGVCL bills. Extracts kWh, evaluates tariff tier, and calculates carbon footprint.',
    tag: 'AI Powered',
    color: 'from-amber-500/20 to-yellow-500/10 text-amber-500 border-amber-500/30',
    link: 'scanner',
    cta: 'Scan Your Bill'
  },
  {
    icon: Leaf,
    title: 'Green Score & Passport',
    desc: 'Dynamic personal sustainability score calculated from audited actions. Earn verifiable blockchain-style badges and official impact certificates.',
    tag: 'Gamified',
    color: 'from-emerald-500/20 to-green-500/10 text-emerald-500 border-emerald-500/30',
    link: 'passport',
    cta: 'View Green Passport'
  },
  {
    icon: Sun,
    title: 'Smart Solar Advisor',
    desc: 'Input your roof area and bill. Computes optimal kW capacity, PM Surya Ghar central subsidies (up to ₹78,000), and 25-year financial returns.',
    tag: 'High ROI',
    color: 'from-orange-500/20 to-amber-500/10 text-orange-500 border-orange-500/30',
    link: 'solar',
    cta: 'Calculate Solar'
  },
  {
    icon: Footprints,
    title: 'Daily Green Missions',
    desc: 'Bite-sized Mission LiFE daily micro-habits. Complete 24°C AC challenge, bucket baths, and tree plantations. Submit photo proof to score points.',
    tag: 'Daily Impact',
    color: 'from-teal-500/20 to-emerald-500/10 text-teal-500 border-teal-500/30',
    link: 'missions',
    cta: 'Take a Mission'
  },
  {
    icon: Users,
    title: 'Community Hub',
    desc: 'Connect with RWAs, schools, colleges, and eco-groups in your municipal ward. Organize tree plantation rallies and community cleanups.',
    tag: 'Social',
    color: 'from-blue-500/20 to-indigo-500/10 text-blue-500 border-blue-500/30',
    link: 'community',
    cta: 'Join Communities'
  },
  {
    icon: MapPin,
    title: 'Green Map of Gujarat',
    desc: 'Interactive state map locating verified EV fast chargers, solar panel installations, certified compost hubs, and recycling centers.',
    tag: 'Interactive',
    color: 'from-purple-500/20 to-pink-500/10 text-purple-500 border-purple-500/30',
    link: 'map',
    cta: 'Explore Map'
  }
]

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Create Your Profile',
    icon: UserCheck,
    desc: 'Select your Gujarat district (Ahmedabad, Surat, Rajkot, etc.), household size, and monthly energy baseline.',
    badge: 'Takes 30 seconds'
  },
  {
    step: '02',
    title: 'Scan Electricity Bill',
    icon: ScanLine,
    desc: 'Upload a phone snap of your DISCOM bill. Our AI OCR extracts units consumed and evaluates carbon footprint.',
    badge: 'All DISCOMs supported'
  },
  {
    step: '03',
    title: 'Take Daily Missions',
    icon: Footprints,
    desc: 'Adopt simple lifestyle habits: set AC to 24°C, plant native trees, or cycle to work. Upload photo evidence.',
    badge: 'Verified by moderators'
  },
  {
    step: '04',
    title: 'Earn & Lead Gujarat',
    icon: Trophy,
    desc: 'Accumulate Green Points, climb your district leaderboard, unlock official certificates, and earn civic rewards.',
    badge: 'District leaderboards'
  }
]

const CHALLENGES = [
  { icon: Zap, title: '24°C AC Challenge', points: 35, cat: 'Electricity', difficulty: 'Easy', time: 'Daily' },
  { icon: Droplets, title: 'Bucket Bath Week', points: 20, cat: 'Water', difficulty: 'Easy', time: '7 Days' },
  { icon: Wind, title: 'Cycle to Work / Market', points: 30, cat: 'Transport', difficulty: 'Medium', time: 'Weekly' },
  { icon: Recycle, title: 'Home Wet Waste Composting', points: 50, cat: 'Waste', difficulty: 'Medium', time: 'Ongoing' },
  { icon: Leaf, title: 'Plant a Native Tree (Neem/Peepal)', points: 50, cat: 'Tree', difficulty: 'Hard', time: 'One-time' },
  { icon: Sun, title: 'Rooftop Solar Survey', points: 40, cat: 'Renewable', difficulty: 'Easy', time: 'One-time' }
]

export function LandingView() {
  const router = useRouter()
  const { user } = useAuth()
  const [stats, setStats] = useState<ImpactStats | null>(null)
  const [selectedChallengeCat, setSelectedChallengeCat] = useState<string>('All')

  useEffect(() => {
    api.get<ImpactStats>('/impact-stats').then(setStats).catch(() => {})
  }, [])

  const filteredChallenges = selectedChallengeCat === 'All'
    ? CHALLENGES
    : CHALLENGES.filter(c => c.cat === selectedChallengeCat)

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-emerald-500/20 selection:text-emerald-900">
      
      {/* 1. Sleek Navigation Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/85 border-b border-border/50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => router.navigate('landing')}>
            <div className="transition-transform duration-200 group-hover:scale-105">
              <GreenGujaratIcon className="w-10 h-10" />
            </div>
            <div>
              <div className="font-extrabold text-base tracking-tight flex items-center gap-1.5 text-foreground">
                GREEN GUJARAT
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Mission LiFE
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground hidden sm:block">Govt. of Gujarat Clean Energy Initiative</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#solar" className="hover:text-foreground transition-colors">Solar Advisor</a>
            <a href="#impact" className="hover:text-foreground transition-colors">Live Impact</a>
            <a href="#community" className="hover:text-foreground transition-colors">Community</a>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <Button onClick={() => router.navigate('dashboard')} className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-md shadow-emerald-600/20">
                Go to Dashboard
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => router.navigate('login')} className="text-foreground hover:bg-accent">
                  Sign In
                </Button>
                <Button
                  size="sm"
                  onClick={() => router.navigate('register')}
                  className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-md shadow-emerald-600/20 font-medium"
                >
                  Join Green Gujarat
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section with Rich Panoramic Background Image */}
      <section className="relative overflow-hidden min-h-[640px] lg:min-h-[720px] flex items-center">
        {/* Background Image Container with Panoramic Gujarat Landscape */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/gujarat_green_hero.jpg"
            alt="Gujarat Green Energy Landscape with Solar and Wind Turbines"
            className="w-full h-full object-cover object-center filter brightness-[0.96] contrast-[1.02]"
          />
          {/* Multi-layered Vignette & Directional Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/35 sm:to-background/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />
          <div className="absolute inset-0 bg-emerald-950/10 pointer-events-none" />
        </div>

        {/* Ambient Decorative Light Glow */}
        <div className="absolute top-1/4 left-1/3 -translate-x-1/2 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 w-full">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            
            {/* Left Column: Heading and CTAs */}
            <div className="lg:col-span-7 space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill text-xs font-semibold text-emerald-800 dark:text-emerald-300 shadow-sm border border-emerald-500/30">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Mission LiFE · Government of Gujarat Theme</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.12]">
                Make Every Action Count for a{' '}
                <span className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-500 bg-clip-text text-transparent underline decoration-emerald-500/30 decoration-wavy decoration-2">
                  Greener Gujarat
                </span>.
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-foreground/80 dark:text-foreground/90 leading-relaxed max-w-xl font-normal drop-shadow-xs">
                Measure your carbon footprint, reduce electricity consumption, adopt rooftop solar, complete sustainable lifestyle missions, and join community-driven environmental initiatives across Gujarat.
              </p>

              {/* Tagline */}
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Small Actions. Big Impact. One Green Gujarat.</span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold text-base px-6 h-12 shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02]"
                  onClick={() => router.navigate(user ? 'dashboard' : 'register')}
                >
                  {user ? 'Go to Dashboard' : 'Join Green Gujarat'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="glass-pill text-foreground hover:bg-white/80 dark:hover:bg-card text-base px-6 h-12 font-medium border-border/70 shadow-sm"
                  onClick={() => router.navigate(user ? 'missions' : 'login')}
                >
                  Explore Missions
                </Button>

                <Button
                  size="lg"
                  variant="ghost"
                  className="text-foreground/80 hover:text-foreground text-sm font-medium px-4 h-12"
                  onClick={() => router.navigate(user ? 'solar' : 'login')}
                >
                  <Sun className="h-4 w-4 mr-2 text-amber-500" />
                  Solar Advisor
                </Button>
              </div>

              {/* Quick Demo Access Bar */}
              <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground/70">Quick Demo Accounts:</span>
                <button
                  type="button"
                  onClick={() => router.navigate('login')}
                  className="px-2.5 py-1 rounded-md glass-pill hover:border-emerald-500/50 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                >
                  Citizen
                </button>
                <button
                  type="button"
                  onClick={() => router.navigate('login')}
                  className="px-2.5 py-1 rounded-md glass-pill hover:border-emerald-500/50 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                >
                  Moderator
                </button>
                <button
                  type="button"
                  onClick={() => router.navigate('login')}
                  className="px-2.5 py-1 rounded-md glass-pill hover:border-emerald-500/50 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                >
                  Admin
                </button>
                <span className="text-[11px] text-muted-foreground/80">· See login page for credentials</span>
              </div>
            </div>

            {/* Right Column: Floating Glassmorphic Live Impact Command Hub */}
            <div className="lg:col-span-5 relative">
              <div className="glass-panel rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden transition-all duration-300 hover:shadow-emerald-500/10">
                {/* Header of Impact Card */}
                <div className="flex items-center justify-between pb-4 mb-5 border-b border-border/40">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-bold tracking-wider uppercase text-foreground/80">
                      Live Gujarat Impact
                    </span>
                  </div>
                  <Badge variant="secondary" className="text-[11px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20">
                    Real-time
                  </Badge>
                </div>

                {/* 4 Core Stat Cards */}
                <div className="grid grid-cols-2 gap-3.5">
                  <StatTile
                    label="kWh Saved"
                    value={stats ? `${(stats.electricitySavedKwh / 1000).toFixed(1)}k` : '1.7k'}
                    icon={Zap}
                    color="text-amber-500 bg-amber-500/10"
                    trend="+12% this week"
                  />
                  <StatTile
                    label="kg CO₂ Cut"
                    value={stats ? `${(stats.co2ReducedKg / 1000).toFixed(1)}k` : '11.2k'}
                    icon={Leaf}
                    color="text-emerald-500 bg-emerald-500/10"
                    trend="Clean Air Goal"
                  />
                  <StatTile
                    label="Citizens"
                    value={stats ? stats.totalParticipants.toString() : '14'}
                    icon={Users}
                    color="text-sky-500 bg-sky-500/10"
                    trend="Across 33 Districts"
                  />
                  <StatTile
                    label="Verified Actions"
                    value={stats ? stats.verifiedActions.toString() : '1'}
                    icon={Trophy}
                    color="text-indigo-500 bg-indigo-500/10"
                    trend="Audited & Scored"
                  />
                </div>

                {/* Featured Mission Ribbon */}
                <div className="mt-5 pt-4 border-t border-border/40 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-foreground/80">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <Award className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">Featured Mission:</span> 24°C AC Challenge (+35 pts)
                    </div>
                  </div>
                  <button
                    onClick={() => router.navigate(user ? 'missions' : 'register')}
                    className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center"
                  >
                    Join <ChevronRight className="h-3 w-3 ml-0.5" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Trust & Scope Strip */}
      <section className="border-y border-border/60 bg-gradient-to-r from-emerald-500/5 via-teal-500/10 to-emerald-500/5 backdrop-blur-xs py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="flex items-center justify-center gap-2.5 text-sm text-foreground/80">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <MapPin className="h-4 w-4" />
              </div>
              <div><span className="font-bold text-foreground">33 Districts</span> Active</div>
            </div>
            <div className="flex items-center justify-center gap-2.5 text-sm text-foreground/80">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div><span className="font-bold text-foreground">100% Free &amp; Open</span> Source</div>
            </div>
            <div className="flex items-center justify-center gap-2.5 text-sm text-foreground/80">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Sun className="h-4 w-4" />
              </div>
              <div><span className="font-bold text-foreground">PM Surya Ghar</span> Subsidy</div>
            </div>
            <div className="flex items-center justify-center gap-2.5 text-sm text-foreground/80">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <Zap className="h-4 w-4" />
              </div>
              <div><span className="font-bold text-foreground">AI OCR Scanner</span> for Bills</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Features Section (Redesigned with Rich Aesthetics, Action CTAs, and Spotlight) */}
      <section id="features" className="py-20 relative bg-gradient-to-b from-background via-emerald-500/[0.02] to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 space-y-3">
            <Badge variant="outline" className="px-3 py-1 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/5">
              Comprehensive Platform Capabilities
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Everything You Need to Live Greener &amp; Save More.
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-base">
              From automated electricity bill auditing to district leaderboards, access tools designed for immediate civic impact.
            </p>
          </div>

          {/* 6 Feature Cards with Vibrant Accents & Hover Dynamics */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <div
                key={f.title}
                className="group relative rounded-2xl border border-border/80 bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-emerald-500/40 hover:-translate-y-1.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
                      <f.icon className="h-6 w-6" />
                    </div>
                    <span className="text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-accent text-accent-foreground border border-border/50">
                      {f.tag}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    {f.desc}
                  </p>
                </div>
                <div className="pt-4 border-t border-border/50">
                  <button
                    onClick={() => router.navigate(user ? (f.link as any) : 'register')}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors"
                  >
                    {f.cta}
                    <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Feature Spotlight Showcase Banner: AI Bill Scanner & Carbon Doctor */}
          <div className="mt-14 rounded-3xl overflow-hidden border border-emerald-500/20 bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 text-white shadow-2xl">
            <div className="grid lg:grid-cols-12 gap-8 items-center p-8 sm:p-12">
              <div className="lg:col-span-7 space-y-5">
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                  <Sparkles className="h-3.5 w-3.5 mr-1" />
                  Spotlight Tool
                </Badge>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Snap Any Electricity Bill. Get Instant Carbon &amp; Tariff Audit.
                </h3>
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                  Our built-in OCR scans domestic bills across all 4 Gujarat DISCOMs (DGVCL, MGVCL, PGVCL, UGVCL) plus Torrent Power. It parses units, uncovers hidden vampire loads, computes exact CO₂ emissions, and recommends tailored solar capacities.
                </p>
                <div className="grid sm:grid-cols-3 gap-3 pt-2">
                  <div className="bg-white/10 rounded-xl p-3 border border-white/10">
                    <div className="text-xs text-gray-300">Supported Formats</div>
                    <div className="text-base font-bold text-emerald-400">PDF, JPG, PNG</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3 border border-white/10">
                    <div className="text-xs text-gray-300">Extraction Speed</div>
                    <div className="text-base font-bold text-amber-400">&lt; 3 Seconds</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3 border border-white/10">
                    <div className="text-xs text-gray-300">Reward Points</div>
                    <div className="text-base font-bold text-teal-300">+25 pts/scan</div>
                  </div>
                </div>
                <div className="pt-2">
                  <Button
                    size="lg"
                    className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold shadow-lg shadow-emerald-500/20"
                    onClick={() => router.navigate(user ? 'scanner' : 'register')}
                  >
                    <ScanLine className="h-4 w-4 mr-2" />
                    Try Bill Scanner Now
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
              <div className="lg:col-span-5">
                <div className="relative rounded-2xl overflow-hidden border border-white/20 shadow-xl group">
                  <img
                    src="/images/gujarat_bill_scanner.jpg"
                    alt="AI Bill Scanner Mobile Interface"
                    className="w-full h-[280px] sm:h-[340px] object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                    <span className="text-xs text-gray-200 font-medium">
                      AI OCR Scanner extracts 3,450 kWh &amp; calculates offset potential in real-time
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 5. How It Works (Redesigned with Connected Pipeline Flow & Modern Cards) */}
      <section id="how-it-works" className="py-20 relative bg-accent/30 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 space-y-3">
            <Badge variant="outline" className="px-3 py-1 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/5">
              Four Step Journey
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Four Simple Steps to a Greener You.
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-base">
              Anyone can contribute. Here is how your daily actions turn into official verifiable impact.
            </p>
          </div>

          {/* Connected Step Cards with Progress Trail */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {HOW_IT_WORKS.map((s, idx) => (
              <div
                key={s.step}
                className="group relative rounded-2xl bg-card border border-border/80 p-6 shadow-sm hover:shadow-xl hover:border-emerald-500/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Top Step Number and Icon */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-lg shadow-xs group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                      {s.step}
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center text-muted-foreground group-hover:text-emerald-600 transition-colors">
                      <s.icon className="h-4 w-4" />
                    </div>
                  </div>

                  <h3 className="font-bold text-lg text-foreground mb-2 group-hover:text-emerald-600 transition-colors">
                    {s.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {s.desc}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-border/50 flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span>{s.badge}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Live Impact Dashboard (Redesigned with High-Tech Dark Emerald Command Station) */}
      <section id="impact" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 text-white p-8 sm:p-12 shadow-2xl relative overflow-hidden border border-emerald-500/30">
            {/* Ambient Glow Orbs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header of Section */}
            <div className="relative z-10 text-center max-w-3xl mx-auto mb-12 space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold tracking-wider uppercase">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Live Gujarat Climate Telemetry
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Real Numbers, Growing Every Day.
              </h2>
              <p className="text-sm sm:text-base text-gray-300">
                {stats?.note ?? 'Statistics are derived from platform records across all 33 districts. Demo accounts are segregated.'}
              </p>
            </div>

            {/* 8 Glowing Command Station Stat Cards */}
            <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <DarkImpactTile
                icon={Users}
                value={stats?.totalParticipants ?? '14'}
                label="Registered Citizens"
                subtext="Across 33 Districts"
                glow="text-sky-400 bg-sky-500/20"
              />
              <DarkImpactTile
                icon={Footprints}
                value={stats?.activeMissions ?? '15'}
                label="Active Missions"
                subtext="Electricity, Water, Trees"
                glow="text-teal-400 bg-teal-500/20"
              />
              <DarkImpactTile
                icon={Trophy}
                value={stats?.verifiedActions ?? '1'}
                label="Verified Impact Actions"
                subtext="Audited with Proofs"
                glow="text-amber-400 bg-amber-500/20"
              />
              <DarkImpactTile
                icon={Leaf}
                value={stats?.communities ?? '5'}
                label="Green Communities"
                subtext="RWAs &amp; Eco-Clubs"
                glow="text-emerald-400 bg-emerald-500/20"
              />
              <DarkImpactTile
                icon={Zap}
                value={stats ? stats.electricitySavedKwh.toLocaleString() : '1,747'}
                label="Electricity Saved (kWh)"
                subtext="Calculated from bills"
                glow="text-yellow-400 bg-yellow-500/20"
              />
              <DarkImpactTile
                icon={Leaf}
                value={stats ? stats.co2ReducedKg.toLocaleString() : '11,239'}
                label="CO₂ Reduced (kg)"
                subtext="Clean air equivalent"
                glow="text-green-400 bg-green-500/20"
              />
              <DarkImpactTile
                icon={MapPin}
                value={stats?.verifiedGreenLocations ?? '8'}
                label="Verified Green Spots"
                subtext="EV &amp; Recycling Hubs"
                glow="text-purple-400 bg-purple-500/20"
              />
              <DarkImpactTile
                icon={Sparkles}
                value={stats?.demoAccounts ?? '13'}
                label="Demo Test Accounts"
                subtext="For rapid testing"
                glow="text-pink-400 bg-pink-500/20"
              />
            </div>

            {/* Verification Footer Note */}
            <div className="relative z-10 mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Verification calculations aligned with Central Electricity Authority (CEA) emission factors for Gujarat.</span>
              </div>
              <button
                onClick={() => router.navigate(user ? 'leaderboard' : 'login')}
                className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
              >
                View District Leaderboard <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 7. Rooftop Solar Spotlight (with Photorealistic Gujarati Villa Render) */}
      <section id="solar" className="py-20 bg-accent/40 relative overflow-hidden border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Information */}
            <div className="lg:col-span-6 space-y-6">
              <Badge variant="outline" className="bg-background text-amber-600 border-amber-500/30">
                <Sun className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
                Gujarat Solar Country
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                Turn Abundant Gujarat Sunlight into Zero Electricity Bills.
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                Gujarat receives 5–6 kWh/m²/day of solar radiation — among the highest in India. Under the PM Surya Ghar
                Muft Bijli Yojana and state net-metering policies, a typical 3 kW rooftop system pays for itself in 4–5 years
                and slashes domestic power bills by up to 80%.
              </p>

              <div className="space-y-3.5 pt-1">
                {[
                  { text: 'Instant rooftop area sizing & recommended kW capacity', icon: CheckCircle2 },
                  { text: 'PM Surya Ghar Central Subsidy calculation (up to ₹78,000)', icon: CheckCircle2 },
                  { text: 'Estimated annual bill savings & payback period projection', icon: CheckCircle2 },
                  { text: 'Direct link to GEDA empanelled rooftop solar vendors', icon: CheckCircle2 }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <item.icon className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-foreground/90">{item.text}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Button
                  size="lg"
                  className="bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-md shadow-amber-600/20"
                  onClick={() => router.navigate(user ? 'solar' : 'register')}
                >
                  <Sun className="h-4 w-4 mr-2" />
                  Launch Smart Solar Advisor
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* Right Column: Visual Showcase with Generated Rooftop Image */}
            <div className="lg:col-span-6">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-border/70 group">
                <img
                  src="/images/gujarat_solar_rooftop.jpg"
                  alt="Modern Gujarati Residence with Rooftop Solar Panels and Energy Stats"
                  className="w-full h-[360px] sm:h-[420px] object-cover group-hover:scale-[1.02] transition-transform duration-500"
                />
                
                {/* Floating Metric Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-6">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-black/60 backdrop-blur-md rounded-xl p-3 border border-white/10 text-white">
                      <div className="text-[11px] text-gray-300">Recommended</div>
                      <div className="text-lg font-bold text-amber-400">3 kW</div>
                      <div className="text-[10px] text-gray-400">~280 kWh/mo</div>
                    </div>
                    <div className="bg-black/60 backdrop-blur-md rounded-xl p-3 border border-white/10 text-white">
                      <div className="text-[11px] text-gray-300">Annual Savings</div>
                      <div className="text-lg font-bold text-emerald-400">₹24,000+</div>
                      <div className="text-[10px] text-gray-400">Direct on bill</div>
                    </div>
                    <div className="bg-black/60 backdrop-blur-md rounded-xl p-3 border border-white/10 text-white">
                      <div className="text-[11px] text-gray-300">Payback</div>
                      <div className="text-lg font-bold text-sky-400">4.5 yrs</div>
                      <div className="text-[10px] text-gray-400">25 yr lifespan</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 8. Daily Green Challenges Preview */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-3">
            <Badge variant="outline" className="px-3 py-1 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/5">
              Mission LiFE Action Library
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Start with a Green Challenge Today.
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-base">
              Complete any mission, submit a photo proof, and earn your verified Green Points.
            </p>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
              {['All', 'Electricity', 'Water', 'Transport', 'Waste', 'Tree', 'Renewable'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedChallengeCat(cat)}
                  className={`text-xs px-3.5 py-1.5 rounded-full font-medium transition-all ${
                    selectedChallengeCat === cat
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-accent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredChallenges.map(c => (
              <div
                key={c.title}
                className="group rounded-2xl border border-border/80 bg-card p-5 shadow-sm hover:shadow-lg hover:border-emerald-500/40 transition-all flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                  <c.icon className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-semibold text-muted-foreground">{c.cat}</span>
                    <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                      +{c.points} pts
                    </Badge>
                    <span className="text-[10px] text-muted-foreground/80">{c.time}</span>
                  </div>
                  <h3 className="font-semibold text-sm sm:text-base text-foreground truncate group-hover:text-emerald-600 transition-colors">
                    {c.title}
                  </h3>
                </div>
                <button
                  onClick={() => router.navigate(user ? 'missions' : 'register')}
                  className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-muted-foreground hover:text-emerald-600 hover:bg-emerald-500/10 transition-colors shrink-0"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button
              variant="outline"
              size="lg"
              className="border-border hover:border-emerald-500 text-foreground font-medium"
              onClick={() => router.navigate(user ? 'missions' : 'register')}
            >
              See All Missions &amp; Leaderboards <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* 9. Community Section (Redesigned with Generated Community Photo Showcase) */}
      <section id="community" className="py-20 bg-accent/30 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-14 space-y-3">
            <Badge variant="outline" className="px-3 py-1 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/5">
              Civic Engagement &amp; Groups
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Sustainability is a Team Effort.
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-base">
              Join RWAs, schools, colleges, and NGOs across Gujarat. Share your green milestones and collaborate with active neighbours.
            </p>
          </div>

          {/* Banner with Community Tree Plantation & Cycling Image */}
          <div className="mb-10 rounded-3xl overflow-hidden border border-border/80 shadow-xl relative group">
            <img
              src="/images/gujarat_community_green.jpg"
              alt="Gujarat Citizens Participating in Tree Plantation and Cycling Clean Drive"
              className="w-full h-[260px] sm:h-[340px] object-cover group-hover:scale-[1.01] transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent flex items-end p-6 sm:p-8">
              <div className="text-white space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/30 backdrop-blur-md text-[11px] font-semibold text-emerald-200 mb-1 border border-emerald-400/30">
                  <Sparkles className="h-3 w-3" />
                  Active Citizen Movement
                </div>
                <h3 className="text-xl sm:text-2xl font-bold">Over 400+ Citizens in Ahmedabad &amp; Surat Driving Weekly Green Drives</h3>
                <p className="text-xs sm:text-sm text-gray-200 max-w-2xl">
                  From cycle-to-work rallies along the Sabarmati riverfront to society composting workshops in Surat, see how civic communities make sustainability personal.
                </p>
              </div>
            </div>
          </div>

          {/* 3 Upgraded Community Hub Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <CommunityCard
              name="Ahmedabad Cyclists Forum"
              category="NGO"
              members="420+ Commuters"
              location="Ahmedabad &amp; Gandhinagar"
              highlight="Weekly zero-emission cycling rallies on dedicated lanes"
              desc="Active citizens promoting cycling as sustainable urban commute in Ahmedabad & Gandhinagar."
              onClick={() => router.navigate(user ? 'community' : 'register')}
            />
            <CommunityCard
              name="Surat Solar Sangathan"
              category="RWA"
              members="310+ Solar Adopters"
              location="Surat, South Gujarat"
              highlight="Net-metering reviews &amp; rooftop maintenance drives"
              desc="Rooftop solar adopters sharing maintenance tips, inverter metrics, and DISCOM net-metering reviews."
              onClick={() => router.navigate(user ? 'community' : 'register')}
            />
            <CommunityCard
              name="Vadodara Eco Club"
              category="College"
              members="180+ Student Leaders"
              location="Vadodara, Central Gujarat"
              highlight="Campus wet waste composting &amp; native neem drives"
              desc="University students driving zero-waste composting and native tree plantation drives across campuses."
              onClick={() => router.navigate(user ? 'community' : 'register')}
            />
          </div>

          <div className="text-center mt-10">
            <Button
              variant="outline"
              size="lg"
              className="border-border hover:border-emerald-500 font-medium text-foreground"
              onClick={() => router.navigate(user ? 'community' : 'register')}
            >
              Explore All Gujarat Communities <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* 10. Comprehensive Footer */}
      <footer className="border-t bg-card mt-auto text-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <GreenGujaratIcon className="w-8 h-8" />
                <span className="font-extrabold text-base tracking-tight">GREEN GUJARAT</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Mission LiFE Citizen Engagement Platform — making domestic energy conservation, rooftop solar, and sustainable living measurable and rewarding.
              </p>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Small Actions. Big Impact. One Green Gujarat.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-sm mb-3 text-foreground">Platform Navigation</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => router.navigate('missions')} className="hover:text-foreground">Green Missions</button></li>
                <li><button onClick={() => router.navigate('scanner')} className="hover:text-foreground">Smart Bill Scanner</button></li>
                <li><button onClick={() => router.navigate('solar')} className="hover:text-foreground">Rooftop Solar Advisor</button></li>
                <li><button onClick={() => router.navigate('map')} className="hover:text-foreground">Green Map of Gujarat</button></li>
                <li><button onClick={() => router.navigate('community')} className="hover:text-foreground">Community Hub</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sm mb-3 text-foreground">Hackathon &amp; Problem Statement</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Gujarat Energy Development Agency (GEDA)*</li>
                <li>Problem Statement: HC26-GEDA01</li>
                <li>Theme: Green Energy &amp; Sustainability</li>
                <li>Platform: Web Application (Next.js &amp; Prisma)</li>
              </ul>
              <p className="text-[11px] text-muted-foreground/70 mt-2 italic">
                * Developed for hackathon demonstration. Demonstrates full citizen lifecycle from bill scan to solar adoption.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-sm mb-3 text-foreground">Contact &amp; Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Email: contact@greengujarat.gov.in (Demo)</li>
                <li>Helpdesk: Gandhinagar, Gujarat, India</li>
                <li>Support: 1800-GREEN-GUJ (Toll Free)</li>
              </ul>
              <div className="mt-4 pt-3 border-t border-border/50">
                <Button size="sm" variant="outline" className="w-full text-xs font-medium" onClick={() => router.navigate('login')}>
                  Access Demo Credentials
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
            <div>
              © {new Date().getFullYear()} GREEN GUJARAT — Built with passion for Problem Statement HC26-GEDA01.
            </div>
            <div className="flex items-center gap-4">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Mission LiFE Guidelines</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function StatTile({
  label,
  value,
  icon: Icon,
  color,
  trend
}: {
  label: string
  value: string
  icon: React.ElementType
  color: string
  trend: string
}) {
  return (
    <div className="bg-card/90 dark:bg-card/70 border border-border/60 hover:border-emerald-500/30 rounded-2xl p-4 shadow-sm transition-all hover:scale-[1.02] flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-[10px] font-medium text-muted-foreground">{trend}</span>
      </div>
      <div>
        <div className="text-2xl font-black text-foreground tracking-tight">{value}</div>
        <div className="text-xs font-medium text-muted-foreground mt-0.5">{label}</div>
      </div>
    </div>
  )
}

function DarkImpactTile({
  icon: Icon,
  value,
  label,
  subtext,
  glow
}: {
  icon: React.ElementType
  value: string | number
  label: string
  subtext: string
  glow: string
}) {
  return (
    <div className="bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 rounded-2xl p-5 sm:p-6 transition-all hover:scale-[1.03] shadow-lg flex flex-col justify-between group">
      <div>
        <div className={`w-10 h-10 rounded-xl ${glow} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-1">
          {value}
        </div>
        <div className="text-xs sm:text-sm font-semibold text-gray-200">
          {label}
        </div>
      </div>
      <div className="text-[11px] text-emerald-300/80 mt-3 pt-2 border-t border-white/10">
        {subtext}
      </div>
    </div>
  )
}

function CommunityCard({
  name,
  category,
  members,
  location,
  highlight,
  desc,
  onClick
}: {
  name: string
  category: string
  members: string
  location: string
  highlight: string
  desc: string
  onClick: () => void
}) {
  return (
    <div className="group rounded-2xl bg-card border border-border/80 p-6 shadow-sm hover:shadow-xl hover:border-emerald-500/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <Badge variant="outline" className="text-xs bg-accent text-accent-foreground font-semibold">
            {category}
          </Badge>
          <span className="text-xs text-muted-foreground font-medium">{members}</span>
        </div>

        <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-emerald-600 transition-colors">
          {name}
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
          <MapPin className="h-3.5 w-3.5 text-emerald-600" />
          <span>{location}</span>
        </div>

        <div className="p-2.5 rounded-xl bg-accent/60 border border-border/50 text-xs text-foreground/90 font-medium mb-4">
          ✨ {highlight}
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          {desc}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-border/50">
        <button
          onClick={onClick}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 transition-colors"
        >
          Join Community Hub
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  )
}
