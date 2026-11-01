'use client'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Sun, Calculator, TrendingUp, Clock, Leaf, IndianRupee, Battery, Info, CheckCircle2 } from 'lucide-react'
import { api, ApiError } from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/lib/auth-context'
import { useEffect } from 'react'

interface SolarResult {
  assessmentId: string
  inputs: { monthlyKwh: number; roofAreaSqm: number; location: string; tariff: number; orientation: string; shading: string }
  results: {
    suggestedCapacityKw: number
    estimatedMonthlyGeneration: number
    estimatedInstallationCost: number
    estimatedAnnualSavings: number
    estimatedPaybackYears: number
    estimatedCo2ReductionKg: number
  }
  assumptions: Record<string, string>
  note: string
}

export function SolarView() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [monthlyKwh, setMonthlyKwh] = useState(user?.profile?.monthlyKwh?.toString() || '280')
  const [roofArea, setRoofArea] = useState('50')
  const [location, setLocation] = useState(user?.profile?.districtName || 'Gujarat')
  const [tariff, setTariff] = useState('7.5')
  const [orientation, setOrientation] = useState('SOUTH')
  const [shading, setShading] = useState('NONE')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SolarResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // refresh from profile when user loads
  useEffect(() => {
    if (user?.profile?.monthlyKwh) setMonthlyKwh(user.profile.monthlyKwh.toString())
    if (user?.profile?.districtName) setLocation(user.profile.districtName)
  }, [user])

  const calculate = async () => {
    setError(null)
    setLoading(true)
    try {
      const r = await api.post<SolarResult>('/solar', {
        monthlyKwh: Number(monthlyKwh),
        roofAreaSqm: Number(roofArea),
        location, tariff: Number(tariff), orientation, shading
      })
      setResult(r)
      toast({ title: 'Solar feasibility calculated', description: 'See results below.' })
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Calculation failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2"><Sun className="h-7 w-7 text-primary" /> Smart Solar Advisor</h1>
        <p className="text-muted-foreground">Rooftop solar feasibility calculator for your home. All outputs are estimates based on documented assumptions.</p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Estimates are NOT an official subsidy quote or guaranteed installation price. Always verify with GEDA-approved vendors and the official PM Surya Ghar portal for current subsidies.
        </AlertDescription>
      </Alert>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5 text-primary" /> Your Inputs</CardTitle>
            <CardDescription>Adjust values to see how they affect feasibility.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="kwh">Monthly Consumption (kWh)</Label>
                <Input id="kwh" type="number" value={monthlyKwh} onChange={e => setMonthlyKwh(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="roof">Roof Area (sqm)</Label>
                <Input id="roof" type="number" value={roofArea} onChange={e => setRoofArea(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="loc">Location</Label>
                <Input id="loc" value={location} onChange={e => setLocation(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tariff">Tariff (₹/kWh)</Label>
                <Input id="tariff" type="number" step="0.1" value={tariff} onChange={e => setTariff(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Roof Orientation</Label>
                <Select value={orientation} onValueChange={setOrientation}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SOUTH">South (optimal)</SelectItem>
                    <SelectItem value="FLAT">Flat</SelectItem>
                    <SelectItem value="EAST">East</SelectItem>
                    <SelectItem value="WEST">West</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Shading</Label>
                <Select value={shading} onValueChange={setShading}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">None</SelectItem>
                    <SelectItem value="LIGHT">Light</SelectItem>
                    <SelectItem value="MODERATE">Moderate</SelectItem>
                    <SelectItem value="HEAVY">Heavy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
            <Button onClick={calculate} disabled={loading} className="w-full">
              {loading ? 'Calculating...' : <><Sun className="h-4 w-4 mr-1" /> Calculate Feasibility</>}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle>Feasibility Results</CardTitle>
            <CardDescription>Estimates only — labelled clearly.</CardDescription>
          </CardHeader>
          <CardContent>
            {!result ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                <Sun className="h-12 w-12 mx-auto mb-3 opacity-30" />
                Enter your details and click Calculate.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <ResultCard icon={Battery} label="Recommended Capacity" value={`${result.results.suggestedCapacityKw} kW`} />
                  <ResultCard icon={Sun} label="Monthly Generation" value={`${result.results.estimatedMonthlyGeneration} kWh`} />
                  <ResultCard icon={IndianRupee} label="Installation Cost" value={`₹${(result.results.estimatedInstallationCost / 100000).toFixed(2)} L`} />
                  <ResultCard icon={TrendingUp} label="Annual Savings" value={`₹${result.results.estimatedAnnualSavings.toLocaleString()}`} />
                  <ResultCard icon={Clock} label="Payback Period" value={`${result.results.estimatedPaybackYears} yrs`} />
                  <ResultCard icon={Leaf} label="CO₂ Reduction" value={`${(result.results.estimatedCo2ReductionKg / 1000).toFixed(1)} t/yr`} />
                </div>
                <details className="text-xs">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">View calculation assumptions</summary>
                  <div className="mt-2 space-y-1 p-3 bg-muted rounded-lg">
                    {Object.entries(result.assumptions).map(([k, v]) => (
                      <div key={k}><strong>{k}:</strong> {v}</div>
                    ))}
                  </div>
                </details>
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription className="text-xs">{result.note}</AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Subsidy pathway */}
      <Card>
        <CardHeader>
          <CardTitle>Pathway to Verified Resources</CardTitle>
          <CardDescription>Always verify current schemes via official sources.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <Badge variant="outline" className="mb-2">Central Government</Badge>
              <h4 className="font-semibold text-sm">PM Surya Ghar: Muft Bijli Yojana</h4>
              <p className="text-xs text-muted-foreground mt-1">Subsidy: ₹30,000/kW for 1–2 kW; ₹78,000 for 3 kW+ systems. Apply via pmsuryaghar.gov.in (verify current terms).</p>
            </div>
            <div className="p-4 border rounded-lg">
              <Badge variant="outline" className="mb-2">State Government</Badge>
              <h4 className="font-semibold text-sm">Gujarat State Solar Subsidy</h4>
              <p className="text-xs text-muted-foreground mt-1">Gujarat provides an additional state subsidy over and above the central scheme. Verify via GEDA / GUVNL official portals.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <Badge variant="outline" className="mb-2">Vendor Directory</Badge>
              <h4 className="font-semibold text-sm">GEDA-Approved Vendors</h4>
              <p className="text-xs text-muted-foreground mt-1">Always use GEDA-empanelled vendors for installation. We do not recommend specific vendors.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <Badge variant="outline" className="mb-2">Net Metering</Badge>
              <h4 className="font-semibold text-sm">Net-Metering Connection</h4>
              <p className="text-xs text-muted-foreground mt-1">Gujarat discoms (PGVCL, MGVCL, UGVCL, DGVCL) offer net-metering for rooftop solar. Excess units exported earn credits.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ResultCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="p-3 rounded-lg bg-accent/40 border border-accent">
      <Icon className="h-4 w-4 text-primary mb-1" />
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  )
}
