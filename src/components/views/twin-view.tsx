'use client'
import { useEffect, useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Cell } from 'recharts'
import { Globe, Users, Footprints, Zap, Leaf, Sun, Info, Map as MapIcon, MapPin, X } from 'lucide-react'
import { api } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

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
  const [mapReady, setMapReady] = useState(false)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const layerGroupRef = useRef<L.LayerGroup | null>(null)

  useEffect(() => {
    api.get<TwinData>('/twin').then(setData).finally(() => setLoading(false))
  }, [])

  // Expose global selector for popup buttons
  useEffect(() => {
    (window as unknown as { __selectDistrict?: (id: string) => void }).__selectDistrict = (id: string) => {
      if (!data) return
      const found = data.districts.find(x => x.districtId === id)
      if (found) setSelected(found)
    }
    return () => {
      delete (window as unknown as { __selectDistrict?: unknown }).__selectDistrict
    }
  }, [data])

  // init map once data loading completes and container is in DOM
  useEffect(() => {
    if (loading || !mapContainerRef.current || mapRef.current) return

    const container = mapContainerRef.current
    if ((container as unknown as { _leaflet_id?: unknown })._leaflet_id) {
      delete (container as unknown as { _leaflet_id?: unknown })._leaflet_id
    }

    const map = L.map(container).setView([22.2587, 71.1924], 7)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map)

    const layerGroup = L.layerGroup().addTo(map)
    layerGroupRef.current = layerGroup
    mapRef.current = map
    setMapReady(true)

    const resizeTimer = setTimeout(() => {
      map.invalidateSize()
    }, 200)

    return () => {
      clearTimeout(resizeTimer)
      setMapReady(false)
      map.remove()
      mapRef.current = null
      layerGroupRef.current = null
    }
  }, [loading])

  // update markers when data is available and map is ready
  useEffect(() => {
    if (!mapReady || !layerGroupRef.current || !data) return

    const layerGroup = layerGroupRef.current
    layerGroup.clearLayers()

    data.districts.forEach(d => {
      if (!d.coordinates) return
      const radius = Math.max(10000, Math.min(45000, Math.sqrt(d.participants) * 1600))
      const color = d.isSample ? '#f59e0b' : '#16834A'

      const circle = L.circle(d.coordinates, {
        radius,
        color,
        fillColor: color,
        fillOpacity: 0.3,
        weight: 2,
      }).addTo(layerGroup)

      const popupContent = `
        <div style="font-family:system-ui,-apple-system,sans-serif;min-width:180px;padding:2px;">
          <div style="font-weight:700;font-size:14px;margin-bottom:6px;color:#1e293b;">${d.name}</div>
          <div style="font-size:12px;display:flex;justify-content:space-between;margin-bottom:3px;">
            <span style="color:#64748b;">Participants:</span> <b>${d.participants.toLocaleString()}</b>
          </div>
          <div style="font-size:12px;display:flex;justify-content:space-between;margin-bottom:3px;">
            <span style="color:#64748b;">Missions:</span> <b>${d.missionsCompleted.toLocaleString()}</b>
          </div>
          <div style="font-size:12px;display:flex;justify-content:space-between;margin-bottom:3px;">
            <span style="color:#64748b;">Savings:</span> <b>${d.savingsKwh.toLocaleString()} kWh</b>
          </div>
          <div style="font-size:12px;display:flex;justify-content:space-between;margin-bottom:3px;">
            <span style="color:#64748b;">CO₂ cut:</span> <b>${d.co2ReductionKg.toLocaleString()} kg</b>
          </div>
          <div style="font-size:12px;display:flex;justify-content:space-between;margin-bottom:3px;">
            <span style="color:#64748b;">Solar:</span> <b>${d.renewableAdoptions.toLocaleString()}</b>
          </div>
          <div style="margin-top:6px;display:flex;justify-content:space-between;align-items:center;">
            ${d.isSample ? '<span style="font-size:10px;color:#d97706;background:#fef3c7;padding:2px 6px;border-radius:4px;">Demo</span>' : '<span style="font-size:10px;color:#16a34a;background:#dcfce7;padding:2px 6px;border-radius:4px;">Verified</span>'}
            <button onclick="window.__selectDistrict && window.__selectDistrict('${d.districtId}')" style="background:#16834A;color:white;border:none;padding:3px 8px;border-radius:4px;font-size:11px;font-weight:600;cursor:pointer;">Select &rarr;</button>
          </div>
        </div>
      `
      circle.bindPopup(popupContent)
      circle.on('click', () => setSelected(d))
      circle.on('popupopen', () => setSelected(d))

      const dotIcon = L.divIcon({
        html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.4);cursor:pointer;"></div>`,
        className: '',
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      })
      const marker = L.marker(d.coordinates, { icon: dotIcon }).addTo(layerGroup)
      marker.bindTooltip(d.name, { direction: 'top', offset: [0, -7] })
      marker.bindPopup(popupContent)
      marker.on('click', () => setSelected(d))
      marker.on('popupopen', () => setSelected(d))
    })
  }, [data, mapReady])

  // Fly to selected district if clicked
  useEffect(() => {
    if (selected?.coordinates && mapRef.current) {
      mapRef.current.flyTo(selected.coordinates, 8, { duration: 0.8 })
    }
  }, [selected])

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
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                {selected ? selected.name : 'Select a District'}
              </CardTitle>
              {selected && (
                <Button variant="ghost" size="sm" onClick={() => setSelected(null)} className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground">
                  <X className="h-3.5 w-3.5 mr-1" /> Reset
                </Button>
              )}
            </div>
            <CardDescription>
              {selected ? 'District sustainability scorecard' : 'Choose a district below or click the map'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            {/* Quick Selector Dropdown */}
            <div className="space-y-1.5">
              <Select
                value={selected?.districtId || ''}
                onValueChange={(val) => {
                  const found = data.districts.find(d => d.districtId === val)
                  if (found) setSelected(found)
                }}
              >
                <SelectTrigger className="w-full text-xs">
                  <SelectValue placeholder="Select or search district..." />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {data.districts.slice().sort((a, b) => a.name.localeCompare(b.name)).map(d => (
                    <SelectItem key={d.districtId} value={d.districtId} className="text-xs">
                      {d.name} {d.isSample ? '(Demo)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!selected ? (
              <div className="space-y-4 pt-2">
                <div className="py-6 px-3 text-center text-sm text-muted-foreground border border-dashed rounded-xl bg-muted/20">
                  <Globe className="h-10 w-10 mx-auto mb-2 text-primary/60 animate-pulse" />
                  <p className="font-medium text-foreground text-xs">Interactive Gujarat Digital Twin</p>
                  <p className="text-[11px] text-muted-foreground mt-1">Click any circle on the map to inspect live metrics, or select a district from the quick picks below.</p>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                    <span>Quick Select (Top Districts):</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {sortedByParticipants.slice(0, 8).map(d => (
                      <Badge
                        key={d.districtId}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all py-1 px-2.5 text-xs font-normal"
                        onClick={() => setSelected(d)}
                      >
                        {d.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-1.5">
                    <Badge variant={selected.isSample ? "secondary" : "default"} className="text-xs">
                      {selected.isSample ? 'Sample Demo' : 'Verified GEDA Data'}
                    </Badge>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    Rank #{sortedByParticipants.findIndex(d => d.districtId === selected.districtId) + 1} of {data.districts.length}
                  </span>
                </div>

                <div className="space-y-2">
                  <Metric label="Participants" value={selected.participants.toLocaleString()} />
                  <Metric label="Missions Completed" value={selected.missionsCompleted.toLocaleString()} />
                  <Metric label="Reported Savings" value={`${selected.savingsKwh.toLocaleString()} kWh`} />
                  <Metric label="CO₂ Reduction" value={`${selected.co2ReductionKg.toLocaleString()} kg`} />
                  <Metric label="Renewable Adoptions" value={selected.renewableAdoptions.toLocaleString()} />
                </div>

                {selected.coordinates && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs flex items-center justify-center gap-1.5 mt-2"
                    onClick={() => {
                      if (selected.coordinates && mapRef.current) {
                        mapRef.current.flyTo(selected.coordinates, 9, { duration: 0.8 })
                      }
                    }}
                  >
                    <MapIcon className="h-3.5 w-3.5 text-primary" /> Center {selected.name} on Map
                  </Button>
                )}
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
              <BarChart
                data={sortedByParticipants.map(d => ({ name: d.name, value: d.participants, isSample: d.isSample }))}
                layout="vertical"
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload.length) {
                    const name = e.activePayload[0].payload.name
                    const found = data.districts.find(d => d.name === name)
                    if (found) setSelected(found)
                  }
                }}
                style={{ cursor: 'pointer' }}
              >
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
              <BarChart
                data={sortedByCo2.map(d => ({ name: d.name, value: d.co2ReductionKg, isSample: d.isSample }))}
                layout="vertical"
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload.length) {
                    const name = e.activePayload[0].payload.name
                    const found = data.districts.find(d => d.name === name)
                    if (found) setSelected(found)
                  }
                }}
                style={{ cursor: 'pointer' }}
              >
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
