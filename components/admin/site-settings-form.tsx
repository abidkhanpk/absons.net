"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { UploadCloud } from "lucide-react"

type SiteSettings = {
  site_title: string
  logo_url: string | null
  favicon_url?: string | null
  contact_email: string | null
  contact_phone: string | null
  contact_address: string | null
  business_hours?: string | null
  business_days?: string | null
  nav_alignment: "left" | "center" | "right"
  nav_login_text: string
  nav_cta_text?: string | null
  nav_cta_href?: string | null
  nav_cta_enabled?: boolean | null
  layout_mode?: "full" | "container" | null
  layout_width?: number | null
  hero_mode?: "static" | "parallax" | null
  hero_static_index?: number | null
  hero_slides?: string | null
  hero_autoplay_seconds?: number | null
  hero_height?: number | null
  show_services?: boolean | null
  show_training?: boolean | null
  show_testimonials?: boolean | null
  logo_width?: number | null
  logo_height?: number | null
  logo_radius?: number | null
  show_login_link?: boolean | null
}

type HeroSlide = {
  title: string
  subtitle?: string
  ctaText?: string
  ctaHref?: string
  image?: string
  layout?: "full" | "image-left" | "image-right" | "no-image"
  bgColor?: string
}

function safeParseSlides(raw: string | null | undefined): HeroSlide[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed
    return []
  } catch {
    return []
  }
}

export function SiteSettingsForm({ initial }: { initial: SiteSettings }) {
  const [formData, setFormData] = useState({
    siteTitle: initial.site_title || "",
    logoUrl: initial.logo_url || "",
    faviconUrl: initial.favicon_url || "",
    contactEmail: initial.contact_email || "",
    contactPhone: initial.contact_phone || "",
    contactAddress: initial.contact_address || "",
    businessHours: initial.business_hours || "Mon - Sat, 9:00 AM - 6:00 PM",
    businessDays: initial.business_days || "Mon - Sat",
    navAlignment: (initial.nav_alignment as "left" | "center" | "right") || "left",
    navLoginText: initial.nav_login_text || "Login",
    navCtaText: initial.nav_cta_text || "Get Started",
    navCtaHref: initial.nav_cta_href || "/contact",
    navCtaEnabled: initial.nav_cta_enabled ?? true,
    layoutMode: (initial.layout_mode as "full" | "container") || "container",
    layoutWidth: initial.layout_width ?? 90,
    heroMode: (initial.hero_mode as "static" | "parallax") || "static",
    heroStaticIndex: initial.hero_static_index ?? 0,
    heroSlides: safeParseSlides(initial.hero_slides),
    heroAutoplaySeconds: initial.hero_autoplay_seconds ?? 6,
    heroHeight: initial.hero_height ?? 560,
    showServices: initial.show_services ?? true,
    showTraining: initial.show_training ?? true,
    showTestimonials: initial.show_testimonials ?? true,
    logoWidth: initial.logo_width || 40,
    logoHeight: initial.logo_height || 40,
    logoRadius: initial.logo_radius ?? 8,
    showLoginLink: initial.show_login_link ?? true,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState<"general" | "navigation" | "hero">("general")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch("/api/admin/site-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          heroSlides: formData.heroSlides,
        }),
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
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="navigation">Navigation & Layout</TabsTrigger>
          <TabsTrigger value="hero">Hero Slides</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
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

          <div className="grid gap-4 md:grid-cols-3">
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

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contactAddress">Contact Address</Label>
              <Input
                id="contactAddress"
                value={formData.contactAddress}
                onChange={(e) => setFormData({ ...formData, contactAddress: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessHours">Business Hours</Label>
              <Input
                id="businessHours"
                value={formData.businessHours}
                onChange={(e) => setFormData({ ...formData, businessHours: e.target.value })}
                placeholder="Mon - Sat, 9:00 AM - 6:00 PM"
              />
              <Label htmlFor="businessDays" className="pt-2">
                Business Days
              </Label>
              <Input
                id="businessDays"
                value={formData.businessDays}
                onChange={(e) => setFormData({ ...formData, businessDays: e.target.value })}
                placeholder="Mon - Sat"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="font-semibold">Home Sections</Label>
              <div className="flex items-center gap-3 pt-1">
                <input
                  id="showServices"
                  type="checkbox"
                  checked={formData.showServices}
                  onChange={(e) => setFormData({ ...formData, showServices: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="showServices" className="text-sm text-muted-foreground font-normal">
                  Show Services section
                </Label>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <input
                  id="showTraining"
                  type="checkbox"
                  checked={formData.showTraining}
                  onChange={(e) => setFormData({ ...formData, showTraining: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="showTraining" className="text-sm text-muted-foreground font-normal">
                  Show Training section
                </Label>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <input
                  id="showTestimonials"
                  type="checkbox"
                  checked={formData.showTestimonials}
                  onChange={(e) => setFormData({ ...formData, showTestimonials: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="showTestimonials" className="text-sm text-muted-foreground font-normal">
                  Show Testimonials section
                </Label>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="navigation" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Menu Alignment</Label>
              <Select
                value={formData.navAlignment}
                onValueChange={(value: "left" | "center" | "right") =>
                  setFormData({ ...formData, navAlignment: value })
                }
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
        </TabsContent>

        <TabsContent value="hero" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Hero Mode</Label>
              <Select
                value={formData.heroMode}
                onValueChange={(value: "static" | "parallax") => setFormData({ ...formData, heroMode: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select hero mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="static">Static (single slide)</SelectItem>
                  <SelectItem value="parallax">Parallax slider</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.heroMode === "static" && (
              <div className="space-y-2">
                <Label htmlFor="heroStaticIndex">Static Slide Index</Label>
                <Input
                  id="heroStaticIndex"
                  type="number"
                  min={0}
                  max={formData.heroSlides.length > 0 ? formData.heroSlides.length - 1 : 0}
                  value={formData.heroStaticIndex}
                  onChange={(e) => setFormData({ ...formData, heroStaticIndex: Number(e.target.value) })}
                />
                <p className="text-xs text-muted-foreground">Index of the slide to show when static mode is enabled.</p>
              </div>
            )}
            {formData.heroMode === "parallax" && formData.heroSlides.length > 1 && (
              <div className="space-y-2">
                <Label htmlFor="heroAutoplaySeconds">Autoplay Interval (seconds)</Label>
                <Input
                  id="heroAutoplaySeconds"
                  type="number"
                  min={2}
                  max={30}
                  value={formData.heroAutoplaySeconds}
                  onChange={(e) => setFormData({ ...formData, heroAutoplaySeconds: Number(e.target.value) })}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="heroHeight">Hero Height (px)</Label>
              <Input
                id="heroHeight"
                type="number"
                min={360}
                max={960}
                value={formData.heroHeight}
                onChange={(e) => setFormData({ ...formData, heroHeight: Number(e.target.value) })}
              />
            </div>
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            {formData.heroSlides.map((slide, index) => (
              <AccordionItem key={index} value={`slide-${index}`} className="border border-border rounded-lg">
                <AccordionTrigger className="px-4 py-2 flex items-center justify-between">
                  <span className="font-semibold text-sm">Slide {index + 1}</span>
                </AccordionTrigger>
                <AccordionContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Edit slide content</span>
                    <button
                      type="button"
                      className="text-xs text-destructive"
                      onClick={() =>
                        setFormData((prev) => {
                          const next = prev.heroSlides.filter((_, i) => i !== index)
                          return { ...prev, heroSlides: next.length > 0 ? next : prev.heroSlides }
                        })
                      }
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor={`slide-title-${index}`}>Title</Label>
                      <Input
                        id={`slide-title-${index}`}
                        value={slide.title}
                        onChange={(e) =>
                          setFormData((prev) => {
                            const copy = [...prev.heroSlides]
                            copy[index] = { ...copy[index], title: e.target.value }
                            return { ...prev, heroSlides: copy }
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`slide-subtitle-${index}`}>Subtitle</Label>
                      <Input
                        id={`slide-subtitle-${index}`}
                        value={slide.subtitle || ""}
                        onChange={(e) =>
                          setFormData((prev) => {
                            const copy = [...prev.heroSlides]
                            copy[index] = { ...copy[index], subtitle: e.target.value }
                            return { ...prev, heroSlides: copy }
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor={`slide-cta-${index}`}>CTA Text</Label>
                      <Input
                        id={`slide-cta-${index}`}
                        value={slide.ctaText || ""}
                        onChange={(e) =>
                          setFormData((prev) => {
                            const copy = [...prev.heroSlides]
                            copy[index] = { ...copy[index], ctaText: e.target.value }
                            return { ...prev, heroSlides: copy }
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`slide-href-${index}`}>CTA Link</Label>
                      <Input
                        id={`slide-href-${index}`}
                        value={slide.ctaHref || ""}
                        onChange={(e) =>
                          setFormData((prev) => {
                            const copy = [...prev.heroSlides]
                            copy[index] = { ...copy[index], ctaHref: e.target.value }
                            return { ...prev, heroSlides: copy }
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`slide-image-${index}`}>Background Image URL</Label>
                    <Input
                      id={`slide-image-${index}`}
                      value={slide.image || ""}
                      onChange={(e) =>
                        setFormData((prev) => {
                          const copy = [...prev.heroSlides]
                          copy[index] = { ...copy[index], image: e.target.value }
                          return { ...prev, heroSlides: copy }
                        })
                      }
                      placeholder="https://..."
                    />
                    <p className="text-xs text-muted-foreground">Use a large landscape image for best results.</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                  <Label htmlFor={`slide-bg-${index}`}>Background Color</Label>
                      <Input
                        id={`slide-bg-${index}`}
                        value={slide.bgColor || ""}
                        placeholder="#0f172a"
                        onChange={(e) =>
                          setFormData((prev) => {
                            const copy = [...prev.heroSlides]
                            copy[index] = { ...copy[index], bgColor: e.target.value }
                            return { ...prev, heroSlides: copy }
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Layout</Label>
                      <Select
                        value={(slide.layout as "full" | "image-left" | "image-right" | "no-image") || "full"}
                        onValueChange={(value: "full" | "image-left" | "image-right" | "no-image") =>
                          setFormData((prev) => {
                            const copy = [...prev.heroSlides]
                            copy[index] = { ...copy[index], layout: value }
                            return { ...prev, heroSlides: copy }
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full">Full (background)</SelectItem>
                          <SelectItem value="image-left">Image left, text right</SelectItem>
                          <SelectItem value="image-right">Text left, image right</SelectItem>
                          <SelectItem value="no-image">No image (color only)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setFormData((prev) => ({
                ...prev,
                heroSlides: [
                  ...prev.heroSlides,
                  { title: "New Slide", subtitle: "", ctaText: "", ctaHref: "", image: "" },
                ],
              }))
            }
          >
            Add Slide
          </Button>
        </TabsContent>

      </Tabs>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-emerald-600">Settings saved</p>}

      <Button type="submit" disabled={isSaving}>
        {isSaving ? "Saving..." : "Save Settings"}
      </Button>
    </form>
  )
}
