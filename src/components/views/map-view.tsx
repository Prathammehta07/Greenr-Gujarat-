'use client'
import { useEffect, useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MapPin, Zap, Sun, Recycle, Calendar, Leaf, Search, Info, ShieldCheck, AlertTriangle } from 'lucide-react'
import { api } from '@/lib/api-client'

// Leaflet imports — need to load CSS
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix default marker icons (Leaflet + bundler issue)
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface Pin {
  id: string
  name: string
  category: 'EV_CHARGER' | 'SOLAR_INSTALL' | 'RECYCLING' | 'EVENT' | 'INITIATIVE'
  latitude: number
  longitude: number
  address?: string
  operator?: string
  district?: string
  isVerified: boolean
  isSample: boolean
  metadata?: Record<string, string> | null
}

const CAT_META = {
  EV_CHARGER: { label: 'EV Charger', icon: Zap, color: '#16A34A' },
  SOLAR_INSTALL: { label: 'Solar Install', icon: Sun, color: '#EA580C' },
  RECYCLING: { label: 'Recycling', icon: Recycle, color: '#0891B2' },
  EVENT: { label: 'Event', icon: Calendar, color: '#7C3AED' },
  INITIATIVE: { label: 'Initiative', icon: Leaf, color: '#16834A' }
} as const

export function MapView() {
  const [pins, setPins] = useState<Pin[]>([])
  const [filtered, setFiltered] = useState<Pin[]>([])
  const [activeCats, setActiveCats] = useState<Set<string>>(new Set(['EV_CHARGER', 'SOLAR_INSTALL', 'RECYCLING', 'EVENT', 'INITIATIVE']))
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Pin | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const layerRef = useRef<L.LayerGroup | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    api.get<{ pins: Pin[]; total: number; verifiedCount: number; sampleCount: number; disclaimer: string }>('/map/pins').then(r => {
      setPins(r.pins)
      setFiltered(r.pins)
    }).finally(() => setLoading(false))
  }, [])

  // initialize map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = L.map(containerRef.current).setView([22.2587, 71.1924], 6) // Gujarat center
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map)
    layerRef.current = L.layerGroup().addTo(map)
    mapRef.current = map
    return () => { map.remove(); mapRef.current = null }
  }, [])

  // update markers when filtered changes
  useEffect(() => {
    if (!layerRef.current) return
    layerRef.current.clearLayers()
    filtered.forEach(p => {
      const meta = CAT_META[p.category]
      const icon = L.divIcon({
        html: `<div style="background:${meta.color};width:24px;height:24px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;"><span style="transform:rotate(45deg);color:white;font-size:10px;font-weight:bold;">${p.isSample ? 'S' : '✓'}</span></div>`,
        className: '',
        iconSize: [24, 24],
        iconAnchor: [12, 24],
      })
      const marker = L.marker([p.latitude, p.longitude], { icon }).addTo(layerRef.current!)
      marker.bindPopup(`
        <div style="font-family:system-ui;min-width:160px;">
          <div style="font-weight:600;font-size:13px;margin-bottom:4px;">${p.name}</div>
          <div style="font-size:11px;color:#666;margin-bottom:4px;">${meta.label}${p.district ? ' · ' + p.district : ''}</div>
          ${p.operator ? `<div style="font-size:11px;color:#666;">Operator: ${p.operator}</div>` : ''}
          ${p.address ? `<div style="font-size:11px;color:#666;">${p.address}</div>` : ''}
          <div style="margin-top:6px;font-size:10px;">
            ${p.isVerified ? '<span style="background:#dcfce7;color:#166534;padding:1px 6px;border-radius:4px;">Verified</span>' : '<span style="background:#fef3c7;color:#92400e;padding:1px 6px;border-radius:4px;">Unverified</span>'}
            ${p.isSample ? '<span style="background:#fee2e2;color:#991b1b;padding:1px 6px;border-radius:4px;margin-left:4px;">Sample</span>' : ''}
          </div>
        </div>
      `)
      marker.on('click', () => setSelected(p))
    })
  }, [filtered])

  // apply filters
  useEffect(() => {
    let r = pins.filter(p => activeCats.has(p.category))
    if (search) {
      const q = search.toLowerCase()
      r = r.filter(p => p.name.toLowerCase().includes(q) || p.district?.toLowerCase().includes(q) || p.address?.toLowerCase().includes(q))
    }
    setFiltered(r)
  }, [pins, activeCats, search])

  const toggleCat = (cat: string) => {
    setActiveCats(prev => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat); else next.add(cat)
      return next
    })
  }

  const verifiedCount = pins.filter(p => p.isVerified).length
  const sampleCount = pins.filter(p => p.isSample).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2"><MapPin className="h-7 w-7 text-primary" /> Green Community Map</h1>
        <p className="text-muted-foreground">Find verified EV chargers, solar installations, recycling centres, events, and initiatives across Gujarat.</p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="text-xs">
          Pins marked <Badge variant="secondary" className="text-[10px] mx-1">Sample</Badge> are demonstrative only and not real-world locations.
          Pins marked <Badge className="text-[10px] mx-1">Verified</Badge> have been confirmed by GEDA moderators. We do not invent real business locations or falsely label unverified locations as verified.
        </AlertDescription>
      </Alert>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Filters */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
            <CardDescription>{filtered.length} of {pins.length} pins shown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Name, district..." className="pl-8" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Categories</Label>
              {Object.entries(CAT_META).map(([key, meta]) => (
                <button
                  key={key}
                  onClick={() => toggleCat(key)}
                  className={`w-full flex items-center gap-2 p-2 rounded-lg border text-sm ${activeCats.has(key) ? 'bg-accent border-primary/30' : 'opacity-50'}`}
                >
                  <meta.icon className="h-4 w-4" style={{ color: meta.color }} />
                  <span className="flex-1 text-left">{meta.label}</span>
                  <span className="text-xs text-muted-foreground">{pins.filter(p => p.category === key).length}</span>
                </button>
              ))}
            </div>
            <div className="pt-2 border-t space-y-1 text-xs">
              <div className="flex items-center gap-1.5 text-primary"><ShieldCheck className="h-3 w-3" /> {verifiedCount} verified</div>
              <div className="flex items-center gap-1.5 text-amber-600"><AlertTriangle className="h-3 w-3" /> {sampleCount} sample (demo)</div>
            </div>
          </CardContent>
        </Card>

        {/* Map */}
        <Card className="lg:col-span-3">
          <CardContent className="p-0">
            <div ref={containerRef} className="w-full h-[500px] rounded-xl overflow-hidden" />
          </CardContent>
        </Card>
      </div>

      {/* Selected pin details */}
      {selected && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {(() => {
                    const Icon = CAT_META[selected.category].icon
                    return <Icon className="h-5 w-5" style={{ color: CAT_META[selected.category].color }} />
                  })()}
                  {selected.name}
                </CardTitle>
                <CardDescription>{CAT_META[selected.category].label}{selected.district ? ' · ' + selected.district : ''}</CardDescription>
              </div>
              <div className="flex gap-1">
                {selected.isVerified && <Badge variant="default"><ShieldCheck className="h-3 w-3 mr-1" /> Verified</Badge>}
                {selected.isSample && <Badge variant="destructive">Sample</Badge>}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              {selected.operator && <div><dt className="text-xs text-muted-foreground">Operator</dt><dd>{selected.operator}</dd></div>}
              {selected.address && <div><dt className="text-xs text-muted-foreground">Address</dt><dd>{selected.address}</dd></div>}
              <div><dt className="text-xs text-muted-foreground">Coordinates</dt><dd>{selected.latitude.toFixed(4)}, {selected.longitude.toFixed(4)}</dd></div>
            </dl>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-xs font-medium text-muted-foreground">{children}</label>
}
