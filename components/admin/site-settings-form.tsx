"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ArrowDown, ArrowUp, Trash2, UploadCloud } from "lucide-react"

type SiteSettings = {
  site_title: string
  logo_url: string | null
  favicon_url?: string | null
  contact_email: string | null
  contact_phone: string | null
  contact_address: string | null
  business_hours?: string | null
  business_days?: string | null
  business_hours_schedule?: string | null
  show_business_hours?: boolean | null
  business_hours_mode?: "table" | "summary" | "hidden" | null
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
  editor_approval_required?: boolean | null
  why_choose_title?: string | null
  why_choose_subtitle?: string | null
  why_choose_items?: string | null
  why_choose_layout?: string | null
  why_choose_scroll_speed?: number | null
  nav_items?: string | null
  home_sections?: string | null
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

type BusinessHourEntry = {
  day: string
  open: string
  close: string
  closed?: boolean
}

type WhyChooseItem = {
  title: string
  description: string
  icon: "check" | "award" | "book" | "star" | "shield" | "bolt" | "heart" | "users" | "globe" | "sparkles"
}

type PageSummary = {
  id: string
  title: string
  slug: string
  published: boolean
}

type NavItem = {
  id: string
  label: string
  href: string
  enabled: boolean
}

type HomeSection = {
  id: "services" | "training" | "testimonials" | "why-choose"
  enabled: boolean
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

function safeParseHours(raw: string | null | undefined): BusinessHourEntry[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

function safeParseNavItems(raw: unknown, fallback: NavItem[]): NavItem[] {
  if (!raw) return fallback
  try {
    const parsed = Array.isArray(raw) ? raw : JSON.parse(String(raw))
    if (!Array.isArray(parsed)) return fallback
    const lookup = new Map(fallback.map((item) => [item.id, item]))
    const normalized: NavItem[] = []
    const seen = new Set<string>()
    parsed.forEach((entry) => {
      if (!entry || typeof entry !== "object") return
      const id = typeof (entry as { id?: unknown }).id === "string" ? (entry as { id: string }).id.trim() : ""
      if (!id || seen.has(id)) return
      const base = lookup.get(id)
      if (base) {
        normalized.push({
          id: base.id,
          label: typeof entry.label === "string" && entry.label.trim() ? entry.label : base.label,
          href: typeof entry.href === "string" && entry.href.trim() ? entry.href : base.href,
          enabled: typeof entry.enabled === "boolean" ? entry.enabled : base.enabled,
        })
      } else {
        const label = typeof entry.label === "string" ? entry.label.trim() : ""
        const href = typeof entry.href === "string" ? entry.href.trim() : ""
        if (!label || !href) return
        normalized.push({
          id,
          label,
          href,
          enabled: typeof entry.enabled === "boolean" ? entry.enabled : true,
        })
      }
      seen.add(id)
    })
    fallback.forEach((item) => {
      if (!seen.has(item.id)) normalized.push(item)
    })
    return normalized
  } catch {
    return fallback
  }
}

function safeParseNavItemsGroup(raw: string | null | undefined, fallback: NavItem[]) {
  if (!raw) {
    return { main: fallback, footer: fallback }
  }
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      const normalized = safeParseNavItems(parsed, fallback)
      return { main: normalized, footer: normalized }
    }
    if (parsed && typeof parsed === "object") {
      return {
        main: safeParseNavItems((parsed as { main?: unknown }).main, fallback),
        footer: safeParseNavItems((parsed as { footer?: unknown }).footer, fallback),
      }
    }
  } catch {
    return { main: fallback, footer: fallback }
  }
  return { main: fallback, footer: fallback }
}

function safeParseHomeSections(
  raw: string | null | undefined,
  fallback: { services: boolean; training: boolean; testimonials: boolean; whyChoose: boolean },
): HomeSection[] {
  if (!raw) {
    return [
      { id: "services", enabled: fallback.services },
      { id: "training", enabled: fallback.training },
      { id: "testimonials", enabled: fallback.testimonials },
      { id: "why-choose", enabled: fallback.whyChoose },
    ]
  }
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return [
        { id: "services", enabled: fallback.services },
        { id: "training", enabled: fallback.training },
        { id: "testimonials", enabled: fallback.testimonials },
        { id: "why-choose", enabled: fallback.whyChoose },
      ]
    }
    const allowed: HomeSection["id"][] = ["services", "training", "testimonials", "why-choose"]
    const normalized: HomeSection[] = []
    const seen = new Set<string>()
    parsed.forEach((entry) => {
      if (!entry || typeof entry !== "object") return
      const id = String(entry.id) as HomeSection["id"]
      if (!allowed.includes(id) || seen.has(id)) return
      normalized.push({
        id,
        enabled:
          typeof entry.enabled === "boolean"
            ? entry.enabled
            : id === "why-choose"
              ? fallback.whyChoose
              : fallback[id],
      })
      seen.add(id)
    })
    allowed.forEach((id) => {
      if (!seen.has(id)) {
        normalized.push({ id, enabled: id === "why-choose" ? fallback.whyChoose : fallback[id] })
      }
    })
    return normalized
  } catch {
    return [
      { id: "services", enabled: fallback.services },
      { id: "training", enabled: fallback.training },
      { id: "testimonials", enabled: fallback.testimonials },
      { id: "why-choose", enabled: fallback.whyChoose },
    ]
  }
}

function safeParseWhyChooseItems(raw: string | null | undefined, fallback: WhyChooseItem[]): WhyChooseItem[] {
  if (!raw) return fallback
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return fallback
    const allowedIcons: WhyChooseItem["icon"][] = [
      "check",
      "award",
      "book",
      "star",
      "shield",
      "bolt",
      "heart",
      "users",
      "globe",
      "sparkles",
    ]
    const normalized = parsed
      .map((entry) => ({
        title: typeof entry?.title === "string" ? entry.title.trim() : "",
        description: typeof entry?.description === "string" ? entry.description.trim() : "",
        icon: allowedIcons.includes(entry?.icon) ? entry.icon : "check",
      }))
      .filter((entry) => entry.title && entry.description)
    return normalized.length > 0 ? normalized : fallback
  } catch {
    return fallback
  }
}

export function SiteSettingsForm({ initial, pages }: { initial: SiteSettings; pages: PageSummary[] }) {
  const defaultSchedule: BusinessHourEntry[] = [
    { day: "Monday", open: "09:00", close: "18:00", closed: false },
    { day: "Tuesday", open: "09:00", close: "18:00", closed: false },
    { day: "Wednesday", open: "09:00", close: "18:00", closed: false },
    { day: "Thursday", open: "09:00", close: "18:00", closed: false },
    { day: "Friday", open: "09:00", close: "18:00", closed: false },
    { day: "Saturday", open: "10:00", close: "14:00", closed: false },
    { day: "Sunday", open: "00:00", close: "00:00", closed: true },
  ]
  const defaultNavItems: NavItem[] = [
    { id: "home", label: "Home", href: "/", enabled: true },
    { id: "about", label: "About", href: "/about", enabled: true },
    { id: "services", label: "Services", href: "/services", enabled: true },
    { id: "training", label: "Training", href: "/training", enabled: true },
    { id: "blog", label: "Blog", href: "/blog", enabled: true },
    { id: "contact", label: "Contact", href: "/contact", enabled: true },
  ]
  const defaultNavItemIds = new Set(defaultNavItems.map((item) => item.id))
  const defaultHomeFallback = {
    services: initial.show_services ?? true,
    training: initial.show_training ?? true,
    testimonials: initial.show_testimonials ?? true,
    whyChoose: true,
  }
  const defaultWhyChooseItems: WhyChooseItem[] = [
    { title: "Proven Expertise", description: "Years of experience delivering quality solutions", icon: "check" },
    { title: "Certified Training", description: "Mobius Institute certified vibration analysis programs", icon: "award" },
    { title: "Tailored Solutions", description: "Custom software designed for your specific requirements", icon: "book" },
    { title: "Ongoing Support", description: "Dedicated support and maintenance for all solutions", icon: "star" },
  ]
  const initialHomeSections = safeParseHomeSections(initial.home_sections, defaultHomeFallback)
  const { main: initialNavItems, footer: initialFooterNavItems } = safeParseNavItemsGroup(
    initial.nav_items,
    defaultNavItems,
  )
  const initialWhyChooseItems = safeParseWhyChooseItems(initial.why_choose_items, defaultWhyChooseItems)

  const [formData, setFormData] = useState({
    siteTitle: initial.site_title || "",
    logoUrl: initial.logo_url || "",
    faviconUrl: initial.favicon_url || "",
    contactEmail: initial.contact_email || "",
    contactPhone: initial.contact_phone || "",
    contactAddress: initial.contact_address || "",
    businessHours: initial.business_hours || "Mon - Sat, 9:00 AM - 6:00 PM",
    businessDays: initial.business_days || "Mon - Sat",
    businessHoursSchedule:
      safeParseHours(initial.business_hours_schedule).length > 0
        ? safeParseHours(initial.business_hours_schedule)
        : defaultSchedule,
    showBusinessHours: initial.show_business_hours ?? true,
    businessHoursMode: (initial.business_hours_mode as "table" | "summary" | "hidden") || "table",
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
    showServices: initialHomeSections.find((section) => section.id === "services")?.enabled ?? true,
    showTraining: initialHomeSections.find((section) => section.id === "training")?.enabled ?? true,
    showTestimonials: initialHomeSections.find((section) => section.id === "testimonials")?.enabled ?? true,
    logoWidth: initial.logo_width || 40,
    logoHeight: initial.logo_height || 40,
    logoRadius: initial.logo_radius ?? 8,
    showLoginLink: initial.show_login_link ?? true,
    editorApprovalRequired: initial.editor_approval_required ?? true,
    whyChooseTitle: initial.why_choose_title || "Why Choose ABSON Solutions",
    whyChooseSubtitle: initial.why_choose_subtitle || "Trusted by educational institutions and organizations across Pakistan",
    whyChooseItems: initialWhyChooseItems,
    whyChooseLayout: (initial.why_choose_layout as "grid" | "scroll") || "grid",
    whyChooseScrollSpeed: initial.why_choose_scroll_speed ?? 30,
    navItems: initialNavItems,
    footerNavItems: initialFooterNavItems,
    homeSections: initialHomeSections,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState<"general" | "navigation" | "hero" | "contact">("general")
  const [selectedHeaderPage, setSelectedHeaderPage] = useState("")
  const [selectedFooterPage, setSelectedFooterPage] = useState("")

  const moveItem = <T,>(items: T[], fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= items.length) return items
    const next = [...items]
    const [moved] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, moved)
    return next
  }

  const moveHomeSection = (index: number, direction: -1 | 1) => {
    setFormData((prev) => {
      const homeSections = moveItem(prev.homeSections, index, index + direction)
      return {
        ...prev,
        homeSections,
      }
    })
  }

  const moveNavItem = (index: number, direction: -1 | 1) => {
    setFormData((prev) => {
      const navItems = moveItem(prev.navItems, index, index + direction)
      return {
        ...prev,
        navItems,
      }
    })
  }

  const moveFooterNavItem = (index: number, direction: -1 | 1) => {
    setFormData((prev) => {
      const footerNavItems = moveItem(prev.footerNavItems, index, index + direction)
      return {
        ...prev,
        footerNavItems,
      }
    })
  }

  const toggleHomeSection = (id: HomeSection["id"], enabled: boolean) => {
    setFormData((prev) => {
      const homeSections = prev.homeSections.map((section) =>
        section.id === id ? { ...section, enabled } : section,
      )
      return {
        ...prev,
        homeSections,
        showServices: id === "services" ? enabled : prev.showServices,
        showTraining: id === "training" ? enabled : prev.showTraining,
        showTestimonials: id === "testimonials" ? enabled : prev.showTestimonials,
      }
    })
  }

  const toggleNavItem = (id: NavItem["id"], enabled: boolean) => {
    setFormData((prev) => {
      const navItems = prev.navItems.map((item) => (item.id === id ? { ...item, enabled } : item))
      return {
        ...prev,
        navItems,
      }
    })
  }

  const toggleFooterNavItem = (id: NavItem["id"], enabled: boolean) => {
    setFormData((prev) => {
      const footerNavItems = prev.footerNavItems.map((item) => (item.id === id ? { ...item, enabled } : item))
      return {
        ...prev,
        footerNavItems,
      }
    })
  }

  const updateNavItem = (id: NavItem["id"], updates: Partial<NavItem>) => {
    setFormData((prev) => ({
      ...prev,
      navItems: prev.navItems.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    }))
  }

  const updateFooterNavItem = (id: NavItem["id"], updates: Partial<NavItem>) => {
    setFormData((prev) => ({
      ...prev,
      footerNavItems: prev.footerNavItems.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    }))
  }

  const updateWhyChooseItem = (index: number, updates: Partial<WhyChooseItem>) => {
    setFormData((prev) => {
      const next = [...prev.whyChooseItems]
      next[index] = { ...next[index], ...updates }
      return { ...prev, whyChooseItems: next }
    })
  }

  const moveWhyChooseItem = (index: number, direction: -1 | 1) => {
    setFormData((prev) => ({
      ...prev,
      whyChooseItems: moveItem(prev.whyChooseItems, index, index + direction),
    }))
  }

  const createCustomNavItem = (label: string, href: string) => ({
    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    label,
    href,
    enabled: true,
  })

  const addNavItem = (item: NavItem) => {
    setFormData((prev) => {
      if (prev.navItems.some((existing) => existing.id === item.id)) return prev
      return { ...prev, navItems: [...prev.navItems, item] }
    })
  }

  const addFooterNavItem = (item: NavItem) => {
    setFormData((prev) => {
      if (prev.footerNavItems.some((existing) => existing.id === item.id)) return prev
      return { ...prev, footerNavItems: [...prev.footerNavItems, item] }
    })
  }

  const removeNavItem = (id: NavItem["id"]) => {
    setFormData((prev) => ({
      ...prev,
      navItems: prev.navItems.filter((item) => item.id !== id),
    }))
  }

  const removeFooterNavItem = (id: NavItem["id"]) => {
    setFormData((prev) => ({
      ...prev,
      footerNavItems: prev.footerNavItems.filter((item) => item.id !== id),
    }))
  }

  const addPageToMenu = (pageId: string, target: "header" | "footer") => {
    const page = pages.find((entry) => entry.id === pageId)
    if (!page) return
    const item = createCustomNavItem(page.title, `/${page.slug}`)
    if (target === "header") {
      addNavItem(item)
      setSelectedHeaderPage("")
    } else {
      addFooterNavItem(item)
      setSelectedFooterPage("")
    }
  }

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
          navItems: formData.navItems,
          footerNavItems: formData.footerNavItems,
          homeSections: formData.homeSections,
          editorApprovalRequired: formData.editorApprovalRequired,
          whyChooseTitle: formData.whyChooseTitle,
          whyChooseSubtitle: formData.whyChooseSubtitle,
          whyChooseItems: formData.whyChooseItems,
          whyChooseLayout: formData.whyChooseLayout,
          whyChooseScrollSpeed: formData.whyChooseScrollSpeed,
          heroSlides: formData.heroSlides,
          businessHoursSchedule: formData.businessHoursSchedule,
          businessHoursMode: formData.businessHoursMode,
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
          <TabsTrigger value="contact">Contact</TabsTrigger>
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
              <Label className="font-semibold">Home Sections</Label>
              <div className="space-y-2 pt-1">
                {formData.homeSections.map((section, index) => {
                  const label =
                    section.id === "services"
                      ? "Services"
                      : section.id === "training"
                        ? "Training"
                        : section.id === "testimonials"
                          ? "Testimonials"
                          : "Why Choose Us"
                  return (
                    <div
                      key={section.id}
                      className="flex items-center justify-between rounded-md border border-border/60 bg-muted/40 px-3 py-2"
                    >
                      <div className="flex items-center gap-3">
                        <Switch
                          id={`home-section-${section.id}`}
                          checked={section.enabled}
                          onCheckedChange={(checked) => toggleHomeSection(section.id, checked)}
                        />
                        <Label htmlFor={`home-section-${section.id}`} className="text-sm text-muted-foreground font-normal">
                          {label} section
                        </Label>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => moveHomeSection(index, -1)}
                          disabled={index === 0}
                          aria-label={`Move ${label} up`}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => moveHomeSection(index, 1)}
                          disabled={index === formData.homeSections.length - 1}
                          aria-label={`Move ${label} down`}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-semibold">Editorial Approval</Label>
            <div className="flex items-center justify-between rounded-md border border-border/60 bg-muted/40 px-3 py-2">
              <div className="space-y-1">
                <p className="text-sm font-medium">Require admin approval for editor content</p>
                <p className="text-xs text-muted-foreground">
                  When enabled, editor-created posts and pages stay hidden until an admin approves them.
                </p>
              </div>
              <Switch
                id="editorApprovalRequired"
                checked={formData.editorApprovalRequired}
                onCheckedChange={(checked) => setFormData({ ...formData, editorApprovalRequired: checked })}
              />
            </div>
          </div>

        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
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
          </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="font-semibold">Business Hours</Label>
                  <p className="text-xs text-muted-foreground">Choose detailed table or two custom lines.</p>
                </div>
              <div className="flex items-center gap-3 text-sm">
                <Label className="text-muted-foreground">Display</Label>
                <Select
                  value={formData.businessHoursMode}
                  onValueChange={(value: "table" | "summary" | "hidden") =>
                    setFormData({
                      ...formData,
                      businessHoursMode: value,
                      showBusinessHours: value === "table",
                    })
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="table">Detailed table</SelectItem>
                    <SelectItem value="summary">Summary only</SelectItem>
                    <SelectItem value="hidden">Hide</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.businessHoursMode === "table" && (
              <div className="rounded-md border border-dashed">
                {formData.businessHoursSchedule.map((entry, idx) => (
                  <div
                    key={entry.day}
                    className="grid grid-cols-1 sm:grid-cols-4 gap-2 px-3 py-2 border-b last:border-b-0 border-border"
                  >
                    <div className="font-semibold text-sm py-1">{entry.day}</div>
                    <div className="sm:col-span-3 flex flex-col sm:flex-row sm:items-center sm:gap-3 gap-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`open-${entry.day}`} className="text-xs text-muted-foreground">
                          Open
                        </Label>
                        <Input
                          id={`open-${entry.day}`}
                          type="time"
                          value={entry.open}
                          disabled={entry.closed}
                          onChange={(e) =>
                            setFormData((prev) => {
                              const updated = [...prev.businessHoursSchedule]
                              updated[idx] = { ...updated[idx], open: e.target.value }
                              return { ...prev, businessHoursSchedule: updated }
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`close-${entry.day}`} className="text-xs text-muted-foreground">
                          Close
                        </Label>
                        <Input
                          id={`close-${entry.day}`}
                          type="time"
                          value={entry.close}
                          disabled={entry.closed}
                          onChange={(e) =>
                            setFormData((prev) => {
                              const updated = [...prev.businessHoursSchedule]
                              updated[idx] = { ...updated[idx], close: e.target.value }
                              return { ...prev, businessHoursSchedule: updated }
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          id={`closed-${entry.day}`}
                          type="checkbox"
                          checked={entry.closed}
                          onChange={(e) =>
                            setFormData((prev) => {
                              const updated = [...prev.businessHoursSchedule]
                              updated[idx] = { ...updated[idx], closed: e.target.checked }
                              return { ...prev, businessHoursSchedule: updated }
                            })
                          }
                          className="h-4 w-4"
                        />
                        <Label htmlFor={`closed-${entry.day}`} className="text-sm text-muted-foreground font-normal">
                          Closed
                        </Label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {formData.businessHoursMode === "summary" && (
              <div className="grid gap-2 md:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="businessDays">Line 1</Label>
                  <Input
                    id="businessDays"
                    value={formData.businessDays}
                    onChange={(e) => setFormData({ ...formData, businessDays: e.target.value })}
                    placeholder="e.g. Mon - Sat"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="businessHours">Line 2</Label>
                  <Input
                    id="businessHours"
                    value={formData.businessHours}
                    onChange={(e) => setFormData({ ...formData, businessHours: e.target.value })}
                    placeholder="e.g. 9:00 AM - 6:00 PM"
                  />
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="navigation" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Accordion type="single" collapsible className="space-y-3">
                <AccordionItem value="header-menu" className="border border-border rounded-lg">
                  <AccordionTrigger className="px-4 py-3 text-sm font-semibold">Header Menu Items</AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-2 md:flex-row md:items-center">
                        <Select value={selectedHeaderPage} onValueChange={setSelectedHeaderPage}>
                          <SelectTrigger className="md:w-80">
                            <SelectValue placeholder="Add a page to the header menu" />
                          </SelectTrigger>
                          <SelectContent>
                            {pages.length === 0 ? (
                              <SelectItem value="none" disabled>
                                No pages available
                              </SelectItem>
                            ) : (
                              pages.map((page) => (
                                <SelectItem key={page.id} value={page.id}>
                                  {page.title} {page.published ? "" : "(draft)"}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => addPageToMenu(selectedHeaderPage, "header")}
                            disabled={!selectedHeaderPage || selectedHeaderPage === "none"}
                          >
                            Add Page
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => addNavItem(createCustomNavItem("New Item", "/"))}
                          >
                            Add Custom Link
                          </Button>
                        </div>
                      </div>

                      {formData.navItems.map((item, index) => (
                        <div
                          key={item.id}
                          className="flex flex-col gap-3 rounded-md border border-border/60 bg-muted/40 px-3 py-3 md:flex-row md:items-center md:justify-between"
                        >
                          <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center">
                            <div className="flex items-center gap-3">
                              <Switch
                                id={`nav-item-${item.id}`}
                                checked={item.enabled}
                                onCheckedChange={(checked) => toggleNavItem(item.id, checked)}
                              />
                              <Label htmlFor={`nav-item-${item.id}`} className="text-sm text-muted-foreground font-normal">
                                Visible
                              </Label>
                            </div>
                            <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center">
                              <div className="flex-1">
                                <Label htmlFor={`nav-item-label-${item.id}`} className="sr-only">
                                  Menu label
                                </Label>
                                <Input
                                  id={`nav-item-label-${item.id}`}
                                  value={item.label}
                                  onChange={(e) => updateNavItem(item.id, { label: e.target.value })}
                                  placeholder="Label"
                                />
                              </div>
                              <div className="flex-1">
                                <Label htmlFor={`nav-item-href-${item.id}`} className="sr-only">
                                  Menu link
                                </Label>
                                <Input
                                  id={`nav-item-href-${item.id}`}
                                  value={item.href}
                                  onChange={(e) => updateNavItem(item.id, { href: e.target.value })}
                                  placeholder="/path"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 self-end md:self-auto">
                            {!defaultNavItemIds.has(item.id) && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeNavItem(item.id)}
                                aria-label={`Remove ${item.label}`}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => moveNavItem(index, -1)}
                              disabled={index === 0}
                              aria-label={`Move ${item.label} up`}
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => moveNavItem(index, 1)}
                              disabled={index === formData.navItems.length - 1}
                              aria-label={`Move ${item.label} down`}
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="footer-menu" className="border border-border rounded-lg">
                  <AccordionTrigger className="px-4 py-3 text-sm font-semibold">Footer Menu Items</AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-2 md:flex-row md:items-center">
                        <Select value={selectedFooterPage} onValueChange={setSelectedFooterPage}>
                          <SelectTrigger className="md:w-80">
                            <SelectValue placeholder="Add a page to the footer menu" />
                          </SelectTrigger>
                          <SelectContent>
                            {pages.length === 0 ? (
                              <SelectItem value="none" disabled>
                                No pages available
                              </SelectItem>
                            ) : (
                              pages.map((page) => (
                                <SelectItem key={page.id} value={page.id}>
                                  {page.title} {page.published ? "" : "(draft)"}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => addPageToMenu(selectedFooterPage, "footer")}
                            disabled={!selectedFooterPage || selectedFooterPage === "none"}
                          >
                            Add Page
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => addFooterNavItem(createCustomNavItem("New Item", "/"))}
                          >
                            Add Custom Link
                          </Button>
                        </div>
                      </div>

                      {formData.footerNavItems.map((item, index) => (
                        <div
                          key={item.id}
                          className="flex flex-col gap-3 rounded-md border border-border/60 bg-muted/40 px-3 py-3 md:flex-row md:items-center md:justify-between"
                        >
                          <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center">
                            <div className="flex items-center gap-3">
                              <Switch
                                id={`footer-nav-item-${item.id}`}
                                checked={item.enabled}
                                onCheckedChange={(checked) => toggleFooterNavItem(item.id, checked)}
                              />
                              <Label htmlFor={`footer-nav-item-${item.id}`} className="text-sm text-muted-foreground font-normal">
                                Visible
                              </Label>
                            </div>
                            <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center">
                              <div className="flex-1">
                                <Label htmlFor={`footer-nav-item-label-${item.id}`} className="sr-only">
                                  Footer menu label
                                </Label>
                                <Input
                                  id={`footer-nav-item-label-${item.id}`}
                                  value={item.label}
                                  onChange={(e) => updateFooterNavItem(item.id, { label: e.target.value })}
                                  placeholder="Label"
                                />
                              </div>
                              <div className="flex-1">
                                <Label htmlFor={`footer-nav-item-href-${item.id}`} className="sr-only">
                                  Footer menu link
                                </Label>
                                <Input
                                  id={`footer-nav-item-href-${item.id}`}
                                  value={item.href}
                                  onChange={(e) => updateFooterNavItem(item.id, { href: e.target.value })}
                                  placeholder="/path"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 self-end md:self-auto">
                            {!defaultNavItemIds.has(item.id) && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeFooterNavItem(item.id)}
                                aria-label={`Remove ${item.label}`}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => moveFooterNavItem(index, -1)}
                              disabled={index === 0}
                              aria-label={`Move ${item.label} up`}
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => moveFooterNavItem(index, 1)}
                              disabled={index === formData.footerNavItems.length - 1}
                              aria-label={`Move ${item.label} down`}
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
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
