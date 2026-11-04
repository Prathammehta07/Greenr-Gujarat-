'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Leaf, ArrowLeft, Sparkles, Info } from 'lucide-react'
import { useRouter } from '@/lib/router'
import { useAuth } from '@/lib/auth-context'
import { api, ApiError } from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'
import { getDefaultDashboard } from '@/lib/rbac'
import { GreenGujaratLogo } from '@/components/shared/logo'

interface District { id: string; name: string; code: string }

export function LoginView() {
  const router = useRouter()
  const { refresh } = useAuth()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fillDemo = (role: 'CITIZEN' | 'MODERATOR' | 'ADMIN') => {
    setEmail(`${role.toLowerCase()}@demo.greengujarat.in`)
    setPassword('GreenGujarat@2026')
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await api.post<{ user: { role: string; name: string } }>('/auth/login', { email, password })
      await refresh()
      const role = res.user?.role
      const targetDashboard = getDefaultDashboard(role)
      toast({ title: 'Welcome back!', description: `Logged in as ${res.user?.name || 'User'}.` })
      router.navigate(targetDashboard)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Welcome back" subtitle="Log in to continue your green journey.">
      <form onSubmit={submit} className="space-y-4">
        {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Logging in...' : 'Log in'}
        </Button>
        <div className="flex justify-between text-sm">
          <button type="button" onClick={() => router.navigate('forgot')} className="text-primary hover:underline">Forgot password?</button>
          <button type="button" onClick={() => router.navigate('register')} className="text-primary hover:underline">Create account</button>
        </div>
      </form>

      <div className="mt-6 pt-6 border-t">
        <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
          <Sparkles className="h-3 w-3" />
          <span>Demo accounts — click to autofill</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => fillDemo('CITIZEN')}>Citizen</Button>
          <Button type="button" size="sm" variant="outline" onClick={() => fillDemo('MODERATOR')}>Moderator</Button>
          <Button type="button" size="sm" variant="outline" onClick={() => fillDemo('ADMIN')}>Admin</Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Password for all demo accounts: <code className="bg-muted px-1 rounded">GreenGujarat@2026</code></p>
      </div>
    </AuthShell>
  )
}

export function RegisterView() {
  const router = useRouter()
  const { refresh } = useAuth()
  const { toast } = useToast()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [districtId, setDistrictId] = useState('')
  const [preferredLang, setPreferredLang] = useState('en')
  const [consentPublic, setConsentPublic] = useState(true)
  const [districts, setDistricts] = useState<District[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // load districts on mount
  useEffect(() => {
    api.get<{ districts: District[] }>('/districts').then(d => setDistricts(d.districts)).catch(() => {})
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await api.post('/auth/register', { name, email, password, districtId: districtId || undefined, preferredLang, consentPublic })
      await refresh()
      toast({ title: 'Welcome to GREEN GUJARAT!', description: 'Your account is ready. Complete your profile to start earning points.' })
      router.navigate('dashboard')
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Create your account" subtitle="Join the GREEN GUJARAT movement.">
      <form onSubmit={submit} className="space-y-4">
        {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" required value={name} onChange={e => setName(e.target.value)} placeholder="Your name" autoComplete="name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 8 characters" autoComplete="new-password" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="district">District</Label>
            <Select value={districtId} onValueChange={setDistrictId}>
              <SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger>
              <SelectContent>
                {districts.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="lang">Preferred Language</Label>
            <Select value={preferredLang} onValueChange={setPreferredLang}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="gu">ગુજરાતી</SelectItem>
                <SelectItem value="hi">हिन्दी</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <label className="flex items-start gap-3 text-sm cursor-pointer">
          <input type="checkbox" checked={consentPublic} onChange={e => setConsentPublic(e.target.checked)} className="mt-1" />
          <span className="text-muted-foreground">I consent to appear on public leaderboards with an anonymised display name. (Optional — you can change this anytime.)</span>
        </label>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
        </Button>
        <div className="text-center text-sm">
          Already have an account?{' '}
          <button type="button" onClick={() => router.navigate('login')} className="text-primary hover:underline">Log in</button>
        </div>
      </form>
    </AuthShell>
  )
}

export function ForgotView() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ devToken?: string; message: string } | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const r = await api.post<{ success: boolean; message: string; devToken?: string; devNote?: string }>('/auth/forgot-password', { email })
      setResult({ message: r.message, devToken: r.devToken })
      toast({ title: 'Reset link generated', description: r.devNote || 'Check your email in production.' })
    } catch {
      setResult({ message: 'If the email exists, a reset link has been sent.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Reset password" subtitle="We'll send you a reset link.">
      {result ? (
        <div className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>{result.message}</AlertDescription>
          </Alert>
          {result.devToken && (
            <Alert>
              <AlertDescription>
                <strong>DEV MODE:</strong> Your reset token is below. In production this would be emailed as a link.
                <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto scroll-thin">{result.devToken}</pre>
                <Button size="sm" className="mt-2" onClick={() => router.navigate('login')}>Back to login</Button>
              </AlertDescription>
            </Alert>
          )}
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Sending...' : 'Send reset link'}
          </Button>
          <button type="button" onClick={() => router.navigate('login')} className="text-sm text-primary hover:underline block mx-auto">
            Back to login
          </button>
        </form>
      )}
    </AuthShell>
  )
}

function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  const router = useRouter()
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-12 hero-pattern">
        <div className="w-full max-w-md">
          <button onClick={() => router.navigate('landing')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </button>
          <div className="mb-6 cursor-pointer" onClick={() => router.navigate('landing')}>
            <GreenGujaratLogo size="lg" roleTitle="Mission LiFE" roleSubtitle="Citizen Engagement" />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{subtitle}</CardDescription>
            </CardHeader>
            <CardContent>{children}</CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
