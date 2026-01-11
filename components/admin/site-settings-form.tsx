"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UploadCloud } from "lucide-react"

type SiteSettings = {
  site_title: string
  logo_url: string | null
  contact_email: string | null
  contact_phone: string | null
  contact_address: string | null
  nav_alignment: "left" | "center" | "right"
  nav_login_text: string
  logo_width?: number | null
  logo_height?: number | null
}

export function SiteSettingsForm({ initial }: { initial: SiteSettings }) {
  const [formData, setFormData] = useState({
    siteTitle: initial.site_title || "",
    logoUrl: initial.logo_url || "",
    contactEmail: initial.contact_email || "",
    contactPhone: initial.contact_phone || "",
    contactAddress: initial.contact_address || "",
    navAlignment: (initial.nav_alignment as "left" | "center" | "right") || "left",
    navLoginText: initial.nav_login_text || "Login",
    logoWidth: initial.logo_width || 40,
    logoHeight: initial.logo_height || 40,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [uploading, setUploading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(false)

    try {
    const response = await fetch("/api/admin/site-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })

      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(result.error || "Failed to save settings")
      }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings")
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpload = async (file: File | null) => {
    if (!file) return
    setUploading(true)
    setError(null)
    setSuccess(false)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append("file", file)
      const res = await fetch("/api/admin/site-settings/upload", {
        method: "POST",
        body: formDataUpload,
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.url) {
        throw new Error(data.error || "Upload failed")
      }
      setFormData((prev) => ({ ...prev, logoUrl: data.url }))
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="siteTitle">Website Title</Label>
          <Input
            id="siteTitle"
            value={formData.siteTitle}
            onChange={(e) => setFormData({ ...formData, siteTitle: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="logoUrl">Logo URL</Label>
          <Input
            id="logoUrl"
            value={formData.logoUrl}
            onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
            placeholder="https://example.com/logo.png"
          />
          <div className="flex items-center gap-3">
            <Label
              htmlFor="logoUpload"
              className="inline-flex items-center gap-2 text-sm text-primary cursor-pointer hover:underline"
            >
              <UploadCloud className="h-4 w-4" />
              Upload logo file
            </Label>
            <input
              id="logoUpload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleUpload(e.target.files?.[0] || null)}
            />
            {uploading && <span className="text-xs text-muted-foreground">Uploading...</span>}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="logoWidth">Logo Width (px)</Label>
          <Input
            id="logoWidth"
            type="number"
            min={16}
            max={512}
            value={formData.logoWidth}
            onChange={(e) => setFormData({ ...formData, logoWidth: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="logoHeight">Logo Height (px)</Label>
          <Input
            id="logoHeight"
            type="number"
            min={16}
            max={512}
            value={formData.logoHeight}
            onChange={(e) => setFormData({ ...formData, logoHeight: Number(e.target.value) })}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contactEmail">Contact Email</Label>
          <Input
            id="contactEmail"
            value={formData.contactEmail}
            onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactPhone">Contact Phone</Label>
          <Input
            id="contactPhone"
            value={formData.contactPhone}
            onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactAddress">Contact Address</Label>
        <Input
          id="contactAddress"
          value={formData.contactAddress}
          onChange={(e) => setFormData({ ...formData, contactAddress: e.target.value })}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Menu Alignment</Label>
          <Select
            value={formData.navAlignment}
            onValueChange={(value: "left" | "center" | "right") => setFormData({ ...formData, navAlignment: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select alignment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="right">Right</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="navLoginText">Login Link Text</Label>
          <Input
            id="navLoginText"
            value={formData.navLoginText}
            onChange={(e) => setFormData({ ...formData, navLoginText: e.target.value })}
          />
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-emerald-600">Settings saved</p>}

      <Button type="submit" disabled={isSaving}>
        {isSaving ? "Saving..." : "Save Settings"}
      </Button>
    </form>
  )
}
