'use client'
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Settings, Shield, Bell, Languages, Save, Lock } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/hooks/use-toast'
import type { Language } from '@/types'

export function SettingsView() {
  const { user, lang, setLang } = useAuth()
  const { toast } = useToast()

  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [leaderboardConsent, setLeaderboardConsent] = useState(user?.consentPublic ?? true)
  const [saving, setSaving] = useState(false)

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      toast({
        title: 'Settings Saved',
        description: 'Your preferences have been updated successfully.'
      })
    }, 400)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="h-6 w-6 text-slate-700" /> Account Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage system preferences, privacy settings, and interface language
        </p>
      </div>

      {/* Language Preference */}
      <Card className="border-slate-200/80 shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Languages className="h-4 w-4 text-[#16834A]" />
            Preferred Language
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Select the primary language for Mission LiFE notifications and dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-64">
            <Select value={lang} onValueChange={(v) => setLang(v as Language)}>
              <SelectTrigger className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="gu">ગુજરાતી (Gujarati)</SelectItem>
                <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Leaderboard Settings */}
      <Card className="border-slate-200/80 shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-600" />
            Privacy & Public Leaderboard
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Control your visibility on the Gujarat-wide Mission LiFE ranking board
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-xs font-semibold text-slate-900">Show My Name on Leaderboards</Label>
              <p className="text-[11px] text-slate-500">
                Display your public green score and district standing on community leaderboards.
              </p>
            </div>
            <Switch
              checked={leaderboardConsent}
              onCheckedChange={setLeaderboardConsent}
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="space-y-0.5">
              <Label className="text-xs font-semibold text-slate-900">Platform Notifications</Label>
              <p className="text-[11px] text-slate-500">
                Receive notifications when your mission submissions are reviewed and approved.
              </p>
            </div>
            <Switch
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#16834A] hover:bg-[#126b3c] text-white text-xs h-9 px-4 font-semibold"
        >
          <Save className="h-3.5 w-3.5 mr-1.5" />
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  )
}
