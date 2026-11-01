'use client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Leaf, Zap, Sun, Users, Trophy, MapPin, ArrowRight, Sparkles, Footprints, Recycle, Droplets, Wind } from 'lucide-react'
import { useRouter } from '@/lib/router'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api-client'

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
  { icon: Zap, title: 'Smart Bill Scanner', desc: 'Upload your electricity bill and we\'ll OCR-extract consumption, calculate carbon footprint, and track savings.' },
  { icon: Leaf, title: 'Green Score & Points', desc: 'Every verified action builds your Green Score. Earn badges and climb the district leaderboard.' },
  { icon: Sun, title: 'Solar Advisor', desc: 'Calculate rooftop solar feasibility, savings, payback period and CO₂ reduction for your home.' },
  { icon: Footprints, title: 'Daily Green Missions', desc: 'Complete bite-sized Mission LiFE actions across electricity, water, transport, waste, and trees.' },
  { icon: Users, title: 'Community Hub', desc: 'Join local green communities, share actions, organise campaigns and learn from neighbours.' },
  { icon: MapPin, title: 'Green Map', desc: 'Find verified EV chargers, solar installations, recycling centres and green events near you.' }
]

const HOW_IT_WORKS = [
  { step: '01', title: 'Register & Set Profile', desc: 'Sign up with your district, household details and electricity usage.' },
  { step: '02', title: 'Scan Bills & Track', desc: 'Upload your electricity bill. We extract usage and compute carbon footprint.' },
  { step: '03', title: 'Complete Missions', desc: 'Take up daily green actions. Submit evidence. Moderators verify your impact.' },
  { step: '04', title: 'Earn & Inspire', desc: 'Climb the leaderboard, earn badges, and download your Green Impact Certificate.' }
]

const CHALLENGES = [
  { icon: Zap, title: '24°C AC Challenge', points: 35, cat: 'Electricity' },
  { icon: Droplets, title: 'Bucket Bath Week', points: 20, cat: 'Water' },
  { icon: Wind, title: 'Cycle to Work', points: 30, cat: 'Transport' },
  { icon: Recycle, title: 'Home Composting', points: 50, cat: 'Waste' },
  { icon: Leaf, title: 'Plant a Native Tree', points: 50, cat: 'Tree' },
  { icon: Sun, title: 'Rooftop Solar Survey', points: 40, cat: 'Renewable' }
]

export function LandingView() {
  const router = useRouter()
  const { user } = useAuth()
  const [stats, setStats] = useState<ImpactStats | null>(null)

  useEffect(() => {
    api.get<ImpactStats>('/impact-stats').then(setStats).catch(() => {})
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative hero-pattern overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="secondary" className="mb-4 bg-accent text-accent-foreground hover:bg-accent">
                <Sparkles className="h-3 w-3 mr-1" />
                Mission LiFE · Government of Gujarat Theme
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight">
                Make Every Action Count for a <span className="text-primary">Greener Gujarat</span>.
              </h1>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-xl">
                Measure your carbon footprint, reduce electricity consumption, adopt rooftop solar, complete sustainable lifestyle missions and join community-driven environmental initiatives across Gujarat.
              </p>
              <p className="mt-2 text-sm italic text-primary font-medium">
                Small Actions. Big Impact. One Green Gujarat.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button size="lg" className="text-base" onClick={() => router.navigate(user ? 'dashboard' : 'register')}>
                  {user ? 'Go to Dashboard' : 'Join Green Gujarat'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button size="lg" variant="outline" className="text-base" onClick={() => router.navigate(user ? 'missions' : 'login')}>
                  Explore Missions
                </Button>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Demo accounts available · Citizen / Moderator / Admin · See login page for credentials.
              </p>
            </div>
            <div className="relative">
              <div className="aspect-square max-w-md mx-auto rounded-3xl bg-gradient-to-br from-primary/10 via-accent to-secondary/10 p-8 flex items-center justify-center shadow-xl">
                <div className="grid grid-cols-2 gap-4 w-full">
                  <StatCard label="kWh Saved" value={stats ? `${(stats.electricitySavedKwh / 1000).toFixed(1)}k` : '—'} icon={Zap} />
                  <StatCard label="kg CO₂ Cut" value={stats ? `${(stats.co2ReducedKg / 1000).toFixed(1)}k` : '—'} icon={Leaf} />
                  <StatCard label="Citizens" value={stats ? stats.totalParticipants.toString() : '—'} icon={Users} />
                  <StatCard label="Verified Actions" value={stats ? stats.verifiedActions.toString() : '—'} icon={Trophy} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission LiFE explanation */}
      <section className="py-16 lg:py-20 bg-card">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="outline" className="mb-3">About Mission LiFE</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">A global movement, made personal for Gujarat.</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Mission LiFE (Lifestyle for Environment) is a global initiative launched by India at COP26 in 2021.
            It calls for individual lifestyle changes — saving water, reducing waste, switching to public transport,
            adopting renewables — to fight climate change. GREEN GUJARAT turns LiFE into actionable daily missions,
            transparent scoring, and community storytelling. Every household that switches an LED bulb, every
            kilometre cycled, every rooftop that goes solar — together they add up to a greener Gujarat.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-3">Features</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold">Everything you need to live greener.</h2>
            <p className="text-muted-foreground mt-3">A complete citizen-engagement platform for green energy and sustainability.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <Card key={f.title} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-2">
                    <f.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 lg:py-20 bg-accent/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-3">How It Works</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold">Four simple steps to a greener you.</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map(s => (
              <Card key={s.step}>
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-primary/30 mb-2">{s.step}</div>
                  <h3 className="font-semibold mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Impact stats */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-3">Live Impact</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold">Real numbers, growing every day.</h2>
            <p className="text-sm text-muted-foreground mt-3 max-w-2xl mx-auto">{stats?.note}</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <BigStat label="Total Participants" value={stats?.totalParticipants ?? '—'} icon={Users} />
            <BigStat label="Active Missions" value={stats?.activeMissions ?? '—'} icon={Footprints} />
            <BigStat label="Verified Actions" value={stats?.verifiedActions ?? '—'} icon={Trophy} />
            <BigStat label="Green Communities" value={stats?.communities ?? '—'} icon={Leaf} />
            <BigStat label="Electricity Saved (kWh)" value={stats?.electricitySavedKwh?.toLocaleString() ?? '—'} icon={Zap} />
            <BigStat label="CO₂ Reduced (kg)" value={stats?.co2ReducedKg?.toLocaleString() ?? '—'} icon={Leaf} />
            <BigStat label="Verified Green Locations" value={stats?.verifiedGreenLocations ?? '—'} icon={MapPin} />
            <BigStat label="Demo Accounts" value={stats?.demoAccounts ?? '—'} icon={Sparkles} />
          </div>
        </div>
      </section>

      {/* Green challenges preview */}
      <section className="py-16 lg:py-20 bg-accent/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-3">Green Challenges</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold">Start with a challenge today.</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CHALLENGES.map(c => (
              <Card key={c.title} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <c.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground">{c.cat}</span>
                      <Badge variant="secondary" className="text-xs">{c.points} pts</Badge>
                    </div>
                    <h3 className="font-semibold">{c.title}</h3>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button variant="outline" onClick={() => router.navigate(user ? 'missions' : 'register')}>
              See all missions <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Solar section */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="mb-3">Solar Energy</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Sunlight to savings — Gujarat is solar country.</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Gujarat receives 5–6 kWh/m²/day of solar radiation — among the best in India. With PM Surya Ghar
                subsidies and net-metering, a 3 kW rooftop system can pay back in 4–6 years and cut your bill by 80%.
                Use our Smart Solar Advisor to get a personalised feasibility estimate in under 60 seconds.
              </p>
              <ul className="space-y-3 mb-6">
                {[
                  'Capacity sizing based on your consumption and roof area',
                  'Estimated monthly generation and annual savings',
                  'Payback period and CO₂ reduction',
                  'Pathway to verified GEDA resources and vendor directories'
                ].map(item => (
                  <li key={item} className="flex items-start gap-3">
                    <Sun className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <Button onClick={() => router.navigate(user ? 'solar' : 'register')}>
                Try Solar Advisor <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
            <Card className="overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-secondary/10 to-primary/10 flex items-center justify-center p-8">
                <div className="text-center">
                  <Sun className="h-24 w-24 text-primary mx-auto mb-4 animate-pulse-soft" />
                  <div className="text-4xl font-bold text-primary">3 kW</div>
                  <p className="text-sm text-muted-foreground mt-1">Recommended for ~280 kWh/month</p>
                  <div className="grid grid-cols-3 gap-3 mt-6 text-left">
                    <div className="bg-card rounded-lg p-3">
                      <div className="text-xs text-muted-foreground">Annual Savings</div>
                      <div className="font-bold text-primary">₹24k</div>
                    </div>
                    <div className="bg-card rounded-lg p-3">
                      <div className="text-xs text-muted-foreground">Payback</div>
                      <div className="font-bold text-primary">5.5 yrs</div>
                    </div>
                    <div className="bg-card rounded-lg p-3">
                      <div className="text-xs text-muted-foreground">CO₂ Cut</div>
                      <div className="font-bold text-primary">3 t/yr</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Community section */}
      <section className="py-16 lg:py-20 bg-accent/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-3">Community</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold">Sustainability is a team sport.</h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              Join RWAs, schools, colleges, and NGOs across Gujarat. Share your green actions, organise campaigns,
              and learn from neighbours who are walking the same path.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Ahmedabad Cyclists Forum', cat: 'NGO', desc: 'Citizens promoting cycling as sustainable urban transport.' },
              { name: 'Surat Solar Sangathan', cat: 'RWA', desc: 'Rooftop solar adopters sharing experiences and vendor reviews.' },
              { name: 'Vadodara Eco Club', cat: 'College', desc: 'College students driving zero-waste and plantation drives.' }
            ].map(c => (
              <Card key={c.name} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{c.cat}</Badge>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-lg mt-2">{c.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{c.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button variant="outline" onClick={() => router.navigate(user ? 'community' : 'register')}>
              Explore Communities <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Leaf className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-lg">GREEN GUJARAT</span>
              </div>
              <p className="text-sm text-muted-foreground">Mission LiFE Citizen Engagement Platform — making sustainability measurable, rewarding, and social.</p>
              <p className="text-xs italic text-muted-foreground mt-2">Small Actions. Big Impact. One Green Gujarat.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Green Missions</li>
                <li>Bill Scanner</li>
                <li>Solar Advisor</li>
                <li>Community Hub</li>
                <li>Green Map</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Organisation</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Gujarat Energy Development Agency (GEDA)*</li>
                <li>Problem Statement: HC26-GEDA01</li>
                <li>Theme: Green Energy &amp; Sustainability</li>
                <li>Platform: Web Application</li>
              </ul>
              <p className="text-xs italic text-muted-foreground mt-2">
                * Placeholder reference. This platform is a hackathon prototype and does not claim official GEDA partnership or endorsement.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Email: hello&#64;greengujarat.example</li>
                <li>Phone: +91 79 0000 0000 (placeholder)</li>
                <li>Address: Gujarat, India (placeholder)</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-3">
                Demo data is clearly labelled. Verified data is sourced from platform records.
              </p>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} GREEN GUJARAT — Hackathon prototype. Built for Problem Statement HC26-GEDA01. Not affiliated with or endorsed by GEDA unless separately authorised.
          </div>
        </div>
      </footer>
    </div>
  )
}

function StatCard({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  return (
    <div className="bg-card/80 backdrop-blur rounded-2xl p-4 shadow-sm">
      <Icon className="h-5 w-5 text-primary mb-2" />
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}

function BigStat({ label, value, icon: Icon }: { label: string; value: string | number; icon: React.ElementType }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <Icon className="h-7 w-7 text-primary mb-2" />
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs text-muted-foreground mt-1">{label}</div>
      </CardContent>
    </Card>
  )
}
