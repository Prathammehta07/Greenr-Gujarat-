'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Settings, MapPin, Home, Users, Sun, Save, Shield, Trash2, Info } from 'lucide-react'
import { api, ApiError } from '@/lib/api-client'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/hooks/use-toast'

interface District { id: string; name: string; code: string }

export function ProfileView() {
  const { user, refresh } = useAuth()
  const { toast } = useToast()
  const [districts, setDistricts] = useState<District[]>([])
  const [form, setForm] = useState({
    name: '', cityVillage: '', districtId: '', householdSize: 1, homeType: 'APARTMENT',
    monthlyKwh: '', hasRooftopSolar: false, solarCapacityKw: '', bio: '',
    consentPublic: false, consentProfile: true, consentContact: false,
    preferredLang: 'en', avatarColor: '#16834A'
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get<{ districts: District[] }>('/districts').then(r => setDistricts(r.districts)).catch(() => {})
  }, [])

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        cityVillage: user.profile?.cityVillage || '',
        districtId: user.profile?.districtId || '',
        householdSize: user.profile?.householdSize || 1,
        homeType: user.profile?.homeType || 'APARTMENT',
        monthlyKwh: user.profile?.monthlyKwh?.toString() || '',
        hasRooftopSolar: user.profile?.hasRooftopSolar || false,
        solarCapacityKw: user.profile?.solarCapacityKw?.toString() || '',
        bio: user.profile?.bio || '',
        consentPublic: user.consentPublic || false,
        consentProfile: user.consentProfile ?? true,
        consentContact: user.consentContact || false,
        preferredLang: user.preferredLang || 'en',
        avatarColor: user.profile?.avatarColor || '#16834A'
      })
    }
  }, [user])

  const save = async () => {
    setSaving(true)
    try {
      await api.patch('/profile', {
        name: form.name,
        cityVillage: form.cityVillage,
        districtId: form.districtId || undefined,
        householdSize: Number(form.householdSize),
        homeType: form.homeType,
        monthlyKwh: form.monthlyKwh ? Number(form.monthlyKwh) : undefined,
        hasRooftopSolar: form.hasRooftopSolar,
        solarCapacityKw: form.solarCapacityKw ? Number(form.solarCapacityKw) : undefined,
        bio: form.bio,
        consentPublic: form.consentPublic,
        consentProfile: form.consentProfile,
        consentContact: form.consentContact,
        preferredLang: form.preferredLang,
        avatarColor: form.avatarColor
      })
      await refresh()
      toast({ title: 'Profile saved', description: 'Your changes are live.' })
    } catch (e) {
      toast({ title: 'Save failed', description: e instanceof ApiError ? e.message : '', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const deleteAccount = async () => {
    if (!confirm('This will deactivate your account. This action cannot be undone. Continue?')) return
    toast({ title: 'Account deletion requested', description: 'In production this triggers the data-deletion workflow with cooling-off period. (Demo: contact admin.)' })
  }

  if (!user) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2"><Settings className="h-7 w-7 text-primary" /> Profile &amp; Settings</h1>
        <p className="text-muted-foreground">Manage your personal information, household details, and privacy consent.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Avatar card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold" style={{ backgroundColor: form.avatarColor }}>
                {form.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </div>
              <div>
                <div className="font-semibold">{form.name}</div>
                <div className="text-xs text-muted-foreground">{user.email}</div>
                <Badge variant="outline" className="text-[10px] mt-1">{user.role}{user.isDemo && ' · Demo'}</Badge>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Avatar Color</Label>
              <input type="color" value={form.avatarColor} onChange={e => setForm({ ...form, avatarColor: e.target.value })} className="w-full h-9 rounded-md border border-input" />
            </div>
            <div className="space-y-1.5">
              <Label>Public Display Name</Label>
              <Input value={user.publicName || '(not set)'} disabled />
              <p className="text-xs text-muted-foreground">Generated automatically when you opt into leaderboards.</p>
            </div>
          </CardContent>
        </Card>

        {/* Profile form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Personal Information</CardTitle>
            <CardDescription>Used to personalise your dashboard and calculations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>District</Label>
                <Select value={form.districtId} onValueChange={v => setForm({ ...form, districtId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger>
                  <SelectContent>
                    {districts.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city"><MapPin className="h-3 w-3 inline mr-1" />City / Village</Label>
                <Input id="city" value={form.cityVillage} onChange={e => setForm({ ...form, cityVillage: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Preferred Language</Label>
                <Select value={form.preferredLang} onValueChange={v => setForm({ ...form, preferredLang: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="gu">ગુજરાતી</SelectItem>
                    <SelectItem value="hi">हिन्दी</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 pt-3 border-t">
              <div className="space-y-1.5">
                <Label><Users className="h-3 w-3 inline mr-1" />Household Size</Label>
                <Input type="number" min="1" max="20" value={form.householdSize} onChange={e => setForm({ ...form, householdSize: Number(e.target.value) })} />
              </div>
              <div className="space-y-1.5">
                <Label><Home className="h-3 w-3 inline mr-1" />Home Type</Label>
                <Select value={form.homeType} onValueChange={v => setForm({ ...form, homeType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="APARTMENT">Apartment</SelectItem>
                    <SelectItem value="INDEPENDENT_HOUSE">Independent House</SelectItem>
                    <SelectItem value="ROW_HOUSE">Row House</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Monthly Electricity (kWh)</Label>
                <Input type="number" value={form.monthlyKwh} onChange={e => setForm({ ...form, monthlyKwh: e.target.value })} placeholder="e.g. 280" />
              </div>
            </div>

            <div className="pt-3 border-t space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label><Sun className="h-3 w-3 inline mr-1" />Rooftop Solar Installed</Label>
                  <p className="text-xs text-muted-foreground">Toggle if you have rooftop solar at home.</p>
                </div>
                <Switch checked={form.hasRooftopSolar} onCheckedChange={c => setForm({ ...form, hasRooftopSolar: c })} />
              </div>
              {form.hasRooftopSolar && (
                <div className="space-y-1.5">
                  <Label>Solar Capacity (kW)</Label>
                  <Input type="number" step="0.5" value={form.solarCapacityKw} onChange={e => setForm({ ...form, solarCapacityKw: e.target.value })} placeholder="e.g. 3" />
                </div>
              )}
            </div>

            <div className="space-y-1.5 pt-3 border-t">
              <Label htmlFor="bio">Bio (optional)</Label>
              <Textarea id="bio" value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={2} maxLength={200} placeholder="Tell the community about your green journey..." />
            </div>

            <Button onClick={save} disabled={saving}>
              {saving ? 'Saving...' : <><Save className="h-4 w-4 mr-1" /> Save Profile</>}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Consent & Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg"><Shield className="h-5 w-5 text-primary" /> Consent &amp; Privacy</CardTitle>
          <CardDescription>Control how your data is used. You can change these anytime.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ConsentRow
            title="Profile Data Processing"
            desc="Allow GREEN GUJARAT to store your household and electricity data to power your dashboard."
            checked={form.consentProfile}
            onChange={c => setForm({ ...form, consentProfile: c })}
          />
          <ConsentRow
            title="Public Leaderboard Opt-in"
            desc="Show an anonymised display name on citizen/district leaderboards. Your real name and email are never exposed."
            checked={form.consentPublic}
            onChange={c => setForm({ ...form, consentPublic: c })}
          />
          <ConsentRow
            title="Email Communication"
            desc="Receive platform notifications, mission updates, and community digests via email."
            checked={form.consentContact}
            onChange={c => setForm({ ...form, consentContact: c })}
          />
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Your electricity bills are stored privately with restricted access and never exposed in leaderboards, public APIs, or admin views beyond what is necessary for moderation. Privacy-conscious display names are used everywhere.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Data deletion */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg"><Trash2 className="h-5 w-5 text-destructive" /> Data Deletion</CardTitle>
          <CardDescription>Request deletion of your account and associated data.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={deleteAccount}><Trash2 className="h-4 w-4 mr-1" /> Request Account Deletion</Button>
          <p className="text-xs text-muted-foreground mt-2">In production, this triggers a 30-day cooling-off period after which your account and personal data are permanently deleted. Verified mission records may be retained anonymously for aggregate impact reporting.</p>
        </CardContent>
      </Card>
    </div>
  )
}

function ConsentRow({ title, desc, checked, onChange }: { title: string; desc: string; checked: boolean; onChange: (c: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b last:border-0">
      <div>
        <div className="font-medium text-sm">{title}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}
