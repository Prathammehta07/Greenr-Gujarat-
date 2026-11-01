'use client'
import { useEffect, useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Cell } from 'recharts'
import { Globe, Users, Footprints, Zap, Leaf, Sun, Info, Map as MapIcon } from 'lucide-react'
import { api } from '@/lib/api-client'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl

interface TwinDistrict {
  districtId: string
  name: string
  participants: number
  missionsCompleted: number
  savingsKwh: number
  co2ReductionKg: number
  renewableAdoptions: number
  isSample: boolean
  coordinates: [number, number] | null
}
interface TwinData {
  districts: TwinDistrict[]
  totals: { districts: number; participants: number; missionsCompleted: number; savingsKwh: number; co2ReductionKg: number; renewableAdoptions: number }
  disclaimer: string
}

export function TwinView() {
  const [data, setData] = useState<TwinData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<TwinDistrict | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    api.get<TwinData>('/twin').then(setData).finally(() => setLoading(false))
  }, [])

  // init map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return
    const map = L.map(mapContainerRef.current).setView([22.2587, 71.1924], 6)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map)
    mapRef.current = map
    return () => { map.remove(); mapRef.current = null }
  }, [])

  // update markers when data loads
  useEffect(() => {
    if (!mapRef.current || !data) return
    // Clear existing layers except tiles
    mapRef.current.eachLayer(layer => {
      if (layer instanceof L.Marker || layer instanceof L.Circle) {
        mapRef.current!.removeLayer(layer)
      }
    })
    data.districts.forEach(d => {
      if (!d.coordinates) return
      const radius = Math.max(8000, Math.min(50000, d.participants * 100))
      const color = d.isSample ? '#f59e0b' : '#16834A'
      const circle = L.circle(d.coordinates, {
        radius,
        color,
        fillColor: color,
        fillOpacity: 0.25,
        weight: 2,
      }).addTo(mapRef.current!)
      circle.bindPopup(`
        <div style="font-family:system-ui;min-width:180px;">
          <div style="font-weight:600;font-size:13px;margin-bottom:4px;">${d.name}</div>
          <div style="font-size:11px;">Participants: ${d.participants}</div>
          <div style="font-size:11px;">Missions: ${d.missionsCompleted}</div>
          <div style="font-size:11px;">Savings: ${d.savingsKwh.toLocaleString()} kWh</div>
          <div style="font-size:11px;">CO₂ cut: ${d.co2ReductionKg.toLocaleString()} kg</div>
          <div style="font-size:11px;">Renewable: ${d.renewableAdoptions}</div>
          ${d.isSample ? '<div style="font-size:10px;color:#f59e0b;margin-top:4px;">Sample data</div>' : ''}
        </div>
      `)
      circle.on('click', () => setSelected(d))
      // also add a small marker
      L.marker(d.coordinates).addTo(mapRef.current!).bindTooltip(d.name, { direction: 'top', offset: [0, -10] })
    })
  }, [data])

  if (loading) return <div className="grid lg:grid-cols-3 gap-6">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />)}</div>
  if (!data) return <div>Failed to load digital twin data.</div>

  const sortedByParticipants = [...data.districts].sort((a, b) => b.participants - a.participants).slice(0, 10)
  const sortedByCo2 = [...data.districts].sort((a, b) => b.co2ReductionKg - a.co2ReductionKg).slice(0, 10)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2"><Globe className="h-7 w-7 text-primary" /> Gujarat Green Digital Twin</h1>
        <p className="text-muted-foreground">District-level interactive visualisation of participation, savings, and renewable adoption across Gujarat.</p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="text-xs">{data.disclaimer}</AlertDescription>
      </Alert>

      {/* Totals */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <TotalCard icon={Users} label="Participants" value={data.totals.participants.toLocaleString()} />
        <TotalCard icon={Footprints} label="Missions" value={data.totals.missionsCompleted.toLocaleString()} />
        <TotalCard icon={Zap} label="kWh Saved" value={data.totals.savingsKwh.toLocaleString()} />
        <TotalCard icon={Leaf} label="kg CO₂ Cut" value={data.totals.co2ReductionKg.toLocaleString()} />
        <TotalCard icon={Sun} label="Solar Adoptions" value={data.totals.renewableAdoptions.toLocaleString()} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MapIcon className="h-5 w-5 text-primary" /> District Participation Map</CardTitle>
            <CardDescription>Circle size = participants · click for details</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div ref={mapContainerRef} className="w-full h-[500px] rounded-xl overflow-hidden" />
          </CardContent>
        </Card>

        {/* Selected district */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{selected ? selected.name : 'Select a district'}</CardTitle>
            <CardDescription>{selected ? 'Detailed metrics' : 'Click a circle on the map'}</CardDescription>
          </CardHeader>
          <CardContent>
            {!selected ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                <Globe className="h-10 w-10 mx-auto mb-2 opacity-30" />
                Click any district circle on the map to see details.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {selected.isSample && <Badge variant="secondary">Sample data</Badge>}
                </div>
                <div className="space-y-2">
                  <Metric label="Participants" value={selected.participants.toLocaleString()} />
                  <Metric label="Missions Completed" value={selected.missionsCompleted.toLocaleString()} />
                  <Metric label="Reported Savings" value={`${selected.savingsKwh.toLocaleString()} kWh`} />
                  <Metric label="CO₂ Reduction" value={`${selected.co2ReductionKg.toLocaleString()} kg`} />
                  <Metric label="Renewable Adoptions" value={selected.renewableAdoptions.toLocaleString()} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Districts by Participation</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sortedByParticipants.map(d => ({ name: d.name, value: d.participants, isSample: d.isSample }))} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={80} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {sortedByParticipants.map((d, i) => <Cell key={i} fill={d.isSample ? '#f59e0b' : 'hsl(var(--primary))'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 10 Districts by CO₂ Reduction</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sortedByCo2.map(d => ({ name: d.name, value: d.co2ReductionKg, isSample: d.isSample }))} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={80} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {sortedByCo2.map((d, i) => <Cell key={i} fill={d.isSample ? '#f59e0b' : 'hsl(var(--chart-4))'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-primary" /> Real participant data</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-amber-500" /> Sample data (clearly labelled)</div>
      </div>
    </div>
  )
}

function TotalCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="pt-5">
        <Icon className="h-5 w-5 text-primary mb-2" />
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 border-b last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  )
}
