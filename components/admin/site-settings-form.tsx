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
  favicon_url?: string | null
  contact_email: string | null
  contact_phone: string | null
  contact_address: string | null
  nav_alignment: "left" | "center" | "right"
  nav_login_text: string
  nav_cta_text?: string | null
  nav_cta_href?: string | null
  nav_cta_enabled?: boolean | null
  logo_width?: number | null
  logo_height?: number | null
  logo_radius?: number | null
  show_login_link?: boolean | null
}

export function SiteSettingsForm({ initial }: { initial: SiteSettings }) {
  const [formData, setFormData] = useState({
    siteTitle: initial.site_title || "",
    logoUrl: initial.logo_url || "",
    faviconUrl: initial.favicon_url || "",
    contactEmail: initial.contact_email || "",
    contactPhone: initial.contact_phone || "",
    contactAddress: initial.contact_address || "",
    navAlignment: (initial.nav_alignment as "left" | "center" | "right") || "left",
    navLoginText: initial.nav_login_text || "Login",
    navCtaText: initial.nav_cta_text || "Get Started",
    navCtaHref: initial.nav_cta_href || "/contact",
    navCtaEnabled: initial.nav_cta_enabled ?? true,
    logoWidth: initial.logo_width || 40,
    logoHeight: initial.logo_height || 40,
    logoRadius: initial.logo_radius ?? 8,
    showLoginLink: initial.show_login_link ?? true,
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

  const handleUpload = async (file: File | null, target: "logoUrl" | "faviconUrl") => {
    if (!file) return
    setUploading(true)
    setError(null)
    setSuccess(false)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append("file", file)
      formDataUpload.append("kind", target === "faviconUrl" ? "favicon" : "logo")
      const res = await fetch("/api/admin/site-settings/upload", {
        method: "POST",
        body: formDataUpload,
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.url) {
        throw new Error(data.error || "Upload failed")
      }
      setFormData((prev) => ({ ...prev, [target]: data.url }))
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
              onChange={(e) => handleUpload(e.target.files?.[0] || null, "logoUrl")}
            />
            {uploading && <span className="text-xs text-muted-foreground">Uploading...</span>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="faviconUrl">Favicon URL</Label>
          <Input
            id="faviconUrl"
            value={formData.faviconUrl}
            onChange={(e) => setFormData({ ...formData, faviconUrl: e.target.value })}
            placeholder="/icon-light-32x32.png"
          />
          <div className="flex items-center gap-3">
            <Label
              htmlFor="faviconUpload"
              className="inline-flex items-center gap-2 text-sm text-primary cursor-pointer hover:underline"
            >
              <UploadCloud className="h-4 w-4" />
              Upload favicon file
            </Label>
            <input
              id="faviconUpload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleUpload(e.target.files?.[0] || null, "faviconUrl")}
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
          <Label htmlFor="logoRadius">Logo Border Radius (px)</Label>
          <Input
            id="logoRadius"
            type="number"
            min={0}
            max={512}
            value={formData.logoRadius}
            onChange={(e) => setFormData({ ...formData, logoRadius: Number(e.target.value) })}
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
          <div className="flex items-center gap-3 pt-1">
            <input
              id="showLoginLink"
              type="checkbox"
              checked={formData.showLoginLink}
              onChange={(e) => setFormData({ ...formData, showLoginLink: e.target.checked })}
              className="h-4 w-4"
            />
            <Label htmlFor="showLoginLink" className="text-sm text-muted-foreground font-normal">
              Show login link in navigation
            </Label>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="navCtaText">CTA Button Text</Label>
          <Input
            id="navCtaText"
            value={formData.navCtaText}
            onChange={(e) => setFormData({ ...formData, navCtaText: e.target.value })}
            placeholder="Get Started"
          />
          <Label htmlFor="navCtaHref" className="pt-2">
            CTA Link
          </Label>
          <Input
            id="navCtaHref"
            value={formData.navCtaHref}
            onChange={(e) => setFormData({ ...formData, navCtaHref: e.target.value })}
            placeholder="/contact"
          />
          <div className="flex items-center gap-3 pt-1">
            <input
              id="navCtaEnabled"
              type="checkbox"
              checked={formData.navCtaEnabled}
              onChange={(e) => setFormData({ ...formData, navCtaEnabled: e.target.checked })}
              className="h-4 w-4"
            />
            <Label htmlFor="navCtaEnabled" className="text-sm text-muted-foreground font-normal">
              Show CTA button
            </Label>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Layout Width</Label>
          <Select
            value={formData.layoutMode}
            onValueChange={(value: "full" | "container") => setFormData({ ...formData, layoutMode: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select layout" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full">Full width</SelectItem>
              <SelectItem value="container">Container</SelectItem>
            </SelectContent>
          </Select>
          {formData.layoutMode === "container" && (
            <div className="pt-2">
              <Label htmlFor="layoutWidth">Container width (% of page)</Label>
              <Input
                id="layoutWidth"
                type="number"
                min={60}
                max={100}
                value={formData.layoutWidth}
                onChange={(e) => setFormData({ ...formData, layoutWidth: Number(e.target.value) })}
              />
            </div>
          )}
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
