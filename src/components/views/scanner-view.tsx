'use client'
import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Upload, FileCheck2, AlertCircle, ScanLine, History, CheckCircle2, ShieldCheck, Leaf } from 'lucide-react'
import { api, ApiError } from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'

interface OcrResult {
  billId: string
  fileName: string
  fileType: string
  fileSize: number
  ocr: {
    consumerName?: string
    consumerNumber?: string
    billingPeriod?: string
    unitsConsumed?: number
    amount?: number
    billDate?: string
    rawText?: string
    confidence: string
    note: string
  }
  status: string
}

interface Bill {
  id: string
  fileName: string
  billingPeriod: string | null
  unitsConsumed: number | null
  amount: number | null
  status: string
  billDate: string | null
  createdAt: string
}

export function ScannerView() {
  const { toast } = useToast()
  const [uploading, setUploading] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [ocr, setOcr] = useState<OcrResult | null>(null)
  const [bills, setBills] = useState<Bill[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // confirmation form fields
  const [units, setUnits] = useState('')
  const [amount, setAmount] = useState('')
  const [period, setPeriod] = useState('')
  const [month, setMonth] = useState('')

  const onFile = async (file: File) => {
    setError(null)
    setUploading(true)
    setOcr(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const r = await api.post<OcrResult>('/bills/upload', fd)
      setOcr(r)
      setUnits(r.ocr.unitsConsumed?.toString() || '')
      setAmount(r.ocr.amount?.toString() || '')
      setPeriod(r.ocr.billingPeriod || '')
      setMonth(r.ocr.billDate ? r.ocr.billDate.slice(0, 7) : new Date().toISOString().slice(0, 7))
      toast({ title: 'Bill scanned', description: 'Please verify the extracted fields below.' })
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const confirm = async () => {
    if (!ocr) return
    setConfirming(true)
    setError(null)
    try {
      const r = await api.post<{ pointsAwarded: number; footprint: { savingsKwh: number } }>('/bills', {
        billId: ocr.billId,
        unitsConsumed: Number(units),
        amount: amount ? Number(amount) : undefined,
        billingPeriod: period,
        month
      })
      toast({
        title: 'Bill confirmed!',
        description: r.pointsAwarded > 0
          ? `${r.pointsAwarded} green points awarded for saving ${Math.round(r.footprint.savingsKwh)} kWh vs your baseline.`
          : 'Footprint record updated. Try the Energy Doctor for tips.'
      })
      setOcr(null)
      setBills(null)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Confirmation failed')
    } finally {
      setConfirming(false)
    }
  }

  const loadHistory = async () => {
    try {
      const r = await api.get<{ bills: Bill[] }>('/bills')
      setBills(r.bills)
    } catch {
      setBills([])
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">Smart Electricity Bill Scanner</h1>
        <p className="text-muted-foreground">Upload your electricity bill (image or PDF). We'll OCR-extract consumption and compute your carbon footprint.</p>
      </div>

      <Alert>
        <ShieldCheck className="h-4 w-4" />
        <AlertDescription>
          Your bill files are stored privately and never exposed in leaderboards or public APIs. OCR results are <strong>always</strong> shown for your confirmation before saving.
        </AlertDescription>
      </Alert>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Bill</CardTitle>
            <CardDescription>JPEG, PNG, WebP or PDF · Max 8 MB</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="border-2 border-dashed rounded-xl p-8 text-center hover:border-primary hover:bg-accent/30 transition-colors cursor-pointer"
              onClick={() => fileRef.current?.click()}
              onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files[0]) onFile(e.dataTransfer.files[0]) }}
              onDragOver={(e) => e.preventDefault()}
            >
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className="hidden"
                onChange={(e) => { if (e.target.files?.[0]) onFile(e.target.files[0]) }}
              />
              {uploading ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-muted-foreground">Running OCR...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Click to upload or drag &amp; drop</p>
                    <p className="text-xs text-muted-foreground mt-1">JPEG, PNG, WebP, PDF · max 8 MB</p>
                  </div>
                </div>
              )}
            </div>
            {error && <Alert variant="destructive" className="mt-3"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
          </CardContent>
        </Card>

        {/* OCR confirmation */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Confirm Extracted Fields</CardTitle>
              {ocr && <Badge variant="secondary"><ScanLine className="h-3 w-3 mr-1" /> OCR {ocr.ocr.confidence}</Badge>}
            </div>
            <CardDescription>Review and edit before saving to your records.</CardDescription>
          </CardHeader>
          <CardContent>
            {!ocr ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                <ScanLine className="h-10 w-10 mx-auto mb-3 opacity-30" />
                Upload a bill to see extracted fields here.
              </div>
            ) : (
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">{ocr.ocr.note}</AlertDescription>
                </Alert>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="units">Units Consumed (kWh) *</Label>
                    <Input id="units" type="number" value={units} onChange={e => setUnits(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="amount">Amount (₹)</Label>
                    <Input id="amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="period">Billing Period</Label>
                    <Input id="period" value={period} onChange={e => setPeriod(e.target.value)} placeholder="e.g. Oct 2025" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="month">Month (YYYY-MM)</Label>
                    <Input id="month" value={month} onChange={e => setMonth(e.target.value)} placeholder="2025-10" />
                  </div>
                </div>
                <details className="text-xs">
                  <summary className="cursor-pointer text-muted-foreground">View raw OCR text</summary>
                  <pre className="mt-2 p-3 bg-muted rounded text-[10px] overflow-x-auto scroll-thin whitespace-pre-wrap">{ocr.ocr.rawText}</pre>
                </details>
                <div className="flex gap-2">
                  <Button onClick={confirm} disabled={confirming || !units} className="flex-1">
                    {confirming ? 'Confirming...' : <><CheckCircle2 className="h-4 w-4 mr-1" /> Confirm &amp; Save</>}
                  </Button>
                  <Button variant="outline" onClick={() => setOcr(null)}>Cancel</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2"><History className="h-4 w-4" /> Bill History</CardTitle>
            <Button variant="outline" size="sm" onClick={loadHistory}>Load history</Button>
          </div>
        </CardHeader>
        <CardContent>
          {!bills ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Click "Load history" to see your uploaded bills.</p>
          ) : bills.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No bills uploaded yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Units (kWh)</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Uploaded</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bills.map(b => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{b.billingPeriod || '—'}</TableCell>
                    <TableCell>{b.unitsConsumed ?? '—'}</TableCell>
                    <TableCell>{b.amount ? `₹${b.amount}` : '—'}</TableCell>
                    <TableCell>
                      <Badge variant={b.status === 'CONFIRMED' ? 'default' : 'secondary'} className="text-xs">{b.status}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(b.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="text-xs text-muted-foreground flex items-start gap-2">
        <Leaf className="h-3 w-3 mt-0.5 shrink-0" />
        <span>Carbon emissions are calculated as kWh × India grid emission factor (default 0.71 kg CO₂/kWh, admin-configurable). Always confirm OCR results — automated extraction is not 100% accurate.</span>
      </div>
    </div>
  )
}
