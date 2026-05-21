"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ArrowDown, ArrowUp, Trash2, UploadCloud } from "lucide-react"
import {
  DEFAULT_HEADING_TYPOGRAPHY,
  HEADING_TEXT_STYLE_OPTIONS,
  normalizeHeadingTypography,
  normalizeHeadingTextStyle,
  type HeadingLevelKey,
  type HeadingTextStyle,
  type HeadingTypographySettings,
} from "@/lib/heading-typography"

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
  why_choose_mobile_layout?: string | null
  why_choose_scroll_speed?: number | null
  analytics_script?: string | null
  header_code?: string | null
  footer_code?: string | null
  allow_indexing?: boolean | null
  seo_title_template?: string | null
  seo_default_title?: string | null
  seo_default_description?: string | null
  seo_default_keywords?: string | null
  seo_default_og_image?: string | null
  seo_default_canonical_base?: string | null
  static_seo?: string | null
  heading_typography?: string | HeadingTypographySettings | null
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

type StaticSeoEntry = {
  title: string
  description: string
  keywords: string
  ogImage: string
  canonical: string
  noIndex: boolean
  noFollow: boolean
}

type StaticSeoSettings = Record<
  "home" | "about" | "services" | "training" | "contact" | "blog",
  StaticSeoEntry
>

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
  id:
    | "services"
    | "products"
    | "pricing"
    | "training"
    | "departments"
    | "testimonials"
    | "who-we-serve"
    | "why-choose"
    | "cta"
  enabled: boolean
  title?: string
  subtitle?: string
  ctaText?: string
  ctaHref?: string
  itemsLayout?: "grid" | "scroll"
  mobileLayout?: "match" | "grid" | "scroll"
  scrollSpeed?: number
  pauseOnHover?: boolean
  dragEnabled?: boolean
}

function parseStaticSeo(raw: string | null | undefined): StaticSeoSettings {
  const blankEntry = {
    title: "",
    description: "",
    keywords: "",
    ogImage: "",
    canonical: "",
    noIndex: false,
    noFollow: false,
  }
  try {
    const parsed = raw ? JSON.parse(raw) : {}
    if (!parsed || typeof parsed !== "object") return {
      home: blankEntry,
      about: blankEntry,
      services: blankEntry,
      training: blankEntry,
      contact: blankEntry,
      blog: blankEntry,
    }
    const toEntry = (entry: any) => ({
      title: typeof entry?.title === "string" ? entry.title : "",
      description: typeof entry?.description === "string" ? entry.description : "",
      keywords: typeof entry?.keywords === "string" ? entry.keywords : "",
      ogImage: typeof entry?.ogImage === "string" ? entry.ogImage : "",
      canonical: typeof entry?.canonical === "string" ? entry.canonical : "",
      noIndex: Boolean(entry?.noIndex),
      noFollow: Boolean(entry?.noFollow),
    })
    return {
      home: toEntry(parsed.home ?? blankEntry),
      about: toEntry(parsed.about ?? blankEntry),
      services: toEntry(parsed.services ?? blankEntry),
      training: toEntry(parsed.training ?? blankEntry),
      contact: toEntry(parsed.contact ?? blankEntry),
      blog: toEntry(parsed.blog ?? blankEntry),
    }
  } catch {
    return {
      home: blankEntry,
      about: blankEntry,
      services: blankEntry,
      training: blankEntry,
      contact: blankEntry,
      blog: blankEntry,
    }
  }
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
  fallback: Record<HomeSection["id"], boolean>,
): HomeSection[] {
  const defaultMeta: Record<
    HomeSection["id"],
    {
      title: string
      subtitle: string
      itemsLayout: "grid" | "scroll"
      mobileLayout: "match" | "grid" | "scroll"
      scrollSpeed: number
      pauseOnHover: boolean
      dragEnabled: boolean
    }
  > = {
    services: {
      title: "Our Services",
      subtitle: "Comprehensive solutions tailored to your organization's specific needs",
      itemsLayout: "grid",
      mobileLayout: "match",
      scrollSpeed: 30,
      pauseOnHover: true,
      dragEnabled: true,
    },
    products: {
      title: "Our Products",
      subtitle: "Ready-to-deploy products that help your teams launch faster and operate with confidence.",
      itemsLayout: "grid",
      mobileLayout: "match",
      scrollSpeed: 30,
      pauseOnHover: true,
      dragEnabled: true,
    },
    pricing: {
      title: "Pricing",
      subtitle: "Transparent plans for organizations at different stages, with support included.",
      itemsLayout: "grid",
      mobileLayout: "match",
      scrollSpeed: 30,
      pauseOnHover: true,
      dragEnabled: true,
    },
    training: {
      title: "Training Programs",
      subtitle: "Vibration analysis training aligned with Mobius Institute standards.",
      itemsLayout: "grid",
      mobileLayout: "match",
      scrollSpeed: 30,
      pauseOnHover: true,
      dragEnabled: true,
    },
    departments: {
      title: "Departments",
      subtitle: "Explore our specialized departments and their core capabilities.",
      itemsLayout: "grid",
      mobileLayout: "match",
      scrollSpeed: 30,
      pauseOnHover: true,
      dragEnabled: true,
    },
    testimonials: {
      title: "What Our Clients Say",
      subtitle: "Trusted by institutions and organizations across the region",
      itemsLayout: "grid",
      mobileLayout: "match",
      scrollSpeed: 30,
      pauseOnHover: true,
      dragEnabled: true,
    },
    "who-we-serve": {
      title: "Who We Serve",
      subtitle: "Built for institutions, teams, and organizations that need dependable digital operations.",
      itemsLayout: "grid",
      mobileLayout: "match",
      scrollSpeed: 30,
      pauseOnHover: true,
      dragEnabled: true,
    },
    "why-choose": {
      title: "Why Choose Us",
      subtitle: "Trusted by educational institutions and organizations across Pakistan",
      itemsLayout: "grid",
      mobileLayout: "match",
      scrollSpeed: 30,
      pauseOnHover: true,
      dragEnabled: true,
    },
    cta: {
      title: "Ready to Transform Your Organization?",
      subtitle: "Get in touch with us today to discuss how we can help you achieve your goals with our innovative solutions.",
      itemsLayout: "grid",
      mobileLayout: "match",
      scrollSpeed: 30,
      pauseOnHover: true,
      dragEnabled: true,
    },
  }
  const defaultHomeSections: HomeSection[] = [
    { id: "services", enabled: fallback.services, ...defaultMeta.services },
    { id: "products", enabled: fallback.products, ...defaultMeta.products },
    { id: "pricing", enabled: fallback.pricing, ...defaultMeta.pricing },
    { id: "training", enabled: fallback.training, ...defaultMeta.training },
    { id: "departments", enabled: fallback.departments, ...defaultMeta.departments },
    { id: "testimonials", enabled: fallback.testimonials, ...defaultMeta.testimonials },
    { id: "who-we-serve", enabled: fallback["who-we-serve"], ...defaultMeta["who-we-serve"] },
    { id: "why-choose", enabled: fallback["why-choose"], ...defaultMeta["why-choose"] },
    { id: "cta", enabled: fallback.cta, ctaText: "Contact Us Today", ctaHref: "/contact", ...defaultMeta.cta },
  ]

  if (!raw) {
    return defaultHomeSections
  }
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return defaultHomeSections
    }
    const allowed: HomeSection["id"][] = [
      "services",
      "products",
      "pricing",
      "training",
      "departments",
      "testimonials",
      "who-we-serve",
      "why-choose",
      "cta",
    ]
    const normalized: HomeSection[] = []
    const seen = new Set<string>()
    parsed.forEach((entry) => {
      if (!entry || typeof entry !== "object") return
      const id = String(entry.id) as HomeSection["id"]
      if (!allowed.includes(id) || seen.has(id)) return
      normalized.push({
        id,
        enabled: typeof entry.enabled === "boolean" ? entry.enabled : fallback[id],
        title:
          typeof (entry as { title?: unknown }).title === "string" && (entry as { title: string }).title.trim()
            ? (entry as { title: string }).title.trim()
            : defaultMeta[id].title,
        subtitle:
          typeof (entry as { subtitle?: unknown }).subtitle === "string" &&
          (entry as { subtitle: string }).subtitle.trim()
            ? (entry as { subtitle: string }).subtitle.trim()
            : defaultMeta[id].subtitle,
        ctaText:
          typeof (entry as { ctaText?: unknown }).ctaText === "string" && (entry as { ctaText: string }).ctaText.trim()
            ? (entry as { ctaText: string }).ctaText.trim()
            : id === "cta"
              ? "Contact Us Today"
              : "",
        ctaHref:
          typeof (entry as { ctaHref?: unknown }).ctaHref === "string" && (entry as { ctaHref: string }).ctaHref.trim()
            ? (entry as { ctaHref: string }).ctaHref.trim()
            : id === "cta"
              ? "/contact"
              : "",
        itemsLayout:
          (entry as { itemsLayout?: unknown }).itemsLayout === "scroll"
            ? "scroll"
            : defaultMeta[id].itemsLayout,
        mobileLayout:
          (entry as { mobileLayout?: unknown }).mobileLayout === "grid" ||
          (entry as { mobileLayout?: unknown }).mobileLayout === "scroll"
            ? ((entry as { mobileLayout: "grid" | "scroll" }).mobileLayout as "grid" | "scroll")
            : defaultMeta[id].mobileLayout,
        scrollSpeed:
          typeof (entry as { scrollSpeed?: unknown }).scrollSpeed === "number" &&
          Number.isFinite((entry as { scrollSpeed: number }).scrollSpeed)
            ? Math.min(120, Math.max(5, Math.round((entry as { scrollSpeed: number }).scrollSpeed)))
            : defaultMeta[id].scrollSpeed,
        pauseOnHover:
          typeof (entry as { pauseOnHover?: unknown }).pauseOnHover === "boolean"
            ? (entry as { pauseOnHover: boolean }).pauseOnHover
            : defaultMeta[id].pauseOnHover,
        dragEnabled:
          typeof (entry as { dragEnabled?: unknown }).dragEnabled === "boolean"
            ? (entry as { dragEnabled: boolean }).dragEnabled
            : defaultMeta[id].dragEnabled,
      })
      seen.add(id)
    })
    allowed.forEach((id) => {
      if (!seen.has(id)) {
        normalized.push({ id, enabled: fallback[id], ...defaultMeta[id] })
      }
    })
    return normalized
  } catch {
    return defaultHomeSections
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

function safeParseHeadingTypography(raw: string | HeadingTypographySettings | null | undefined): HeadingTypographySettings {
  if (!raw) return DEFAULT_HEADING_TYPOGRAPHY
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw
    return normalizeHeadingTypography(parsed)
  } catch {
    return DEFAULT_HEADING_TYPOGRAPHY
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
    products: true,
    pricing: true,
    training: initial.show_training ?? true,
    departments: true,
    testimonials: initial.show_testimonials ?? true,
    "who-we-serve": true,
    "why-choose": true,
    cta: true,
  }
  const defaultWhyChooseItems: WhyChooseItem[] = [
    { title: "Proven Expertise", description: "Years of experience delivering quality solutions", icon: "check" },
    { title: "Certified Training", description: "Mobius Institute certified vibration analysis programs", icon: "award" },
    { title: "Tailored Solutions", description: "Custom software designed for your specific requirements", icon: "book" },
    { title: "Ongoing Support", description: "Dedicated support and maintenance for all solutions", icon: "star" },
  ]
  const initialHomeSections = safeParseHomeSections(initial.home_sections, defaultHomeFallback).map((section) =>
    section.id === "why-choose"
      ? {
          ...section,
          title:
            typeof initial.why_choose_title === "string" && initial.why_choose_title.trim()
              ? initial.why_choose_title
              : section.title,
          itemsLayout:
            initial.why_choose_layout === "scroll" || initial.why_choose_layout === "grid"
              ? initial.why_choose_layout
              : section.itemsLayout,
          subtitle:
            typeof initial.why_choose_subtitle === "string" && initial.why_choose_subtitle.trim()
              ? initial.why_choose_subtitle
              : section.subtitle,
          mobileLayout:
            initial.why_choose_mobile_layout === "match" ||
            initial.why_choose_mobile_layout === "grid" ||
            initial.why_choose_mobile_layout === "scroll"
              ? initial.why_choose_mobile_layout
              : section.mobileLayout,
          scrollSpeed:
            typeof initial.why_choose_scroll_speed === "number" && Number.isFinite(initial.why_choose_scroll_speed)
              ? Math.min(120, Math.max(5, Math.round(initial.why_choose_scroll_speed)))
              : section.scrollSpeed,
          pauseOnHover: section.pauseOnHover ?? true,
          dragEnabled: section.dragEnabled ?? true,
        }
      : section,
  )
  const { main: initialNavItems, footer: initialFooterNavItems } = safeParseNavItemsGroup(
    initial.nav_items,
    defaultNavItems,
  )
  const initialWhyChooseItems = safeParseWhyChooseItems(initial.why_choose_items, defaultWhyChooseItems)

  const initialStaticSeo = parseStaticSeo(initial.static_seo)
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
    whyChooseTitle: initial.why_choose_title || `Why Choose ${initial.site_title || "Our Company"}`,
    whyChooseSubtitle: initial.why_choose_subtitle || "Trusted by educational institutions and organizations across Pakistan",
    whyChooseItems: initialWhyChooseItems,
    whyChooseLayout: (initial.why_choose_layout as "grid" | "scroll") || "grid",
    whyChooseMobileLayout: (initial.why_choose_mobile_layout as "match" | "grid" | "scroll") || "match",
    whyChooseScrollSpeed: initial.why_choose_scroll_speed ?? 30,
    analyticsScript: initial.analytics_script || "",
    headerCode: initial.header_code || "",
    footerCode: initial.footer_code || "",
    allowIndexing: initial.allow_indexing ?? true,
    seoTitleTemplate: initial.seo_title_template || "{title} - {siteTitle}",
    seoDefaultTitle: initial.seo_default_title || initial.site_title || "Site",
    seoDefaultDescription:
      initial.seo_default_description ||
      "Professional software solutions for schools, Quran academies, madaris, and vibration analysis training certification from Mobius Institute of Australia",
    seoDefaultKeywords: initial.seo_default_keywords || "",
    seoDefaultOgImage: initial.seo_default_og_image || "",
    seoDefaultCanonicalBase: initial.seo_default_canonical_base || "",
    staticSeo: initialStaticSeo,
    headingTypography: safeParseHeadingTypography(initial.heading_typography),
    navItems: initialNavItems,
    footerNavItems: initialFooterNavItems,
    homeSections: initialHomeSections,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadingHeroIndex, setUploadingHeroIndex] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<"general" | "headings" | "home-sections" | "navigation" | "hero" | "contact" | "seo">(
    "general",
  )
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

  const updateHomeSectionTitle = (id: HomeSection["id"], title: string) => {
    setFormData((prev) => {
      const next = prev.homeSections.map((section) => (section.id === id ? { ...section, title } : section))
      return {
        ...prev,
        homeSections: next,
        whyChooseTitle: id === "why-choose" ? title : prev.whyChooseTitle,
      }
    })
  }

  const updateHomeSectionSubtitle = (id: HomeSection["id"], subtitle: string) => {
    setFormData((prev) => {
      const next = prev.homeSections.map((section) => (section.id === id ? { ...section, subtitle } : section))
      return {
        ...prev,
        homeSections: next,
        whyChooseSubtitle: id === "why-choose" ? subtitle : prev.whyChooseSubtitle,
      }
    })
  }

  const updateHomeSectionLayout = (id: HomeSection["id"], itemsLayout: "grid" | "scroll") => {
    setFormData((prev) => {
      const next = prev.homeSections.map((section) => (section.id === id ? { ...section, itemsLayout } : section))
      return {
        ...prev,
        homeSections: next,
        whyChooseLayout: id === "why-choose" ? itemsLayout : prev.whyChooseLayout,
      }
    })
  }

  const updateHomeSectionMobileLayout = (id: HomeSection["id"], mobileLayout: "match" | "grid" | "scroll") => {
    setFormData((prev) => {
      const next = prev.homeSections.map((section) => (section.id === id ? { ...section, mobileLayout } : section))
      return {
        ...prev,
        homeSections: next,
        whyChooseMobileLayout: id === "why-choose" ? mobileLayout : prev.whyChooseMobileLayout,
      }
    })
  }

  const updateHomeSectionScrollSpeed = (id: HomeSection["id"], scrollSpeed: number) => {
    const normalized = Math.min(120, Math.max(5, Math.round(scrollSpeed || 30)))
    setFormData((prev) => {
      const next = prev.homeSections.map((section) => (section.id === id ? { ...section, scrollSpeed: normalized } : section))
      return {
        ...prev,
        homeSections: next,
        whyChooseScrollSpeed: id === "why-choose" ? normalized : prev.whyChooseScrollSpeed,
      }
    })
  }

  const updateHomeSectionPauseOnHover = (id: HomeSection["id"], pauseOnHover: boolean) => {
    setFormData((prev) => ({
      ...prev,
      homeSections: prev.homeSections.map((section) => (section.id === id ? { ...section, pauseOnHover } : section)),
    }))
  }

  const updateHomeSectionDragEnabled = (id: HomeSection["id"], dragEnabled: boolean) => {
    setFormData((prev) => ({
      ...prev,
      homeSections: prev.homeSections.map((section) => (section.id === id ? { ...section, dragEnabled } : section)),
    }))
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
      if (!next[index]) return prev
      next[index] = { ...next[index], ...updates }
      return { ...prev, whyChooseItems: next }
    })
  }

  const updateStaticSeo = (key: keyof StaticSeoSettings, updates: Partial<StaticSeoEntry>) => {
    setFormData((prev) => ({
      ...prev,
      staticSeo: {
        ...prev.staticSeo,
        [key]: { ...prev.staticSeo[key], ...updates },
      },
    }))
  }

  const updateHeadingTypography = (
    level: HeadingLevelKey,
    field: keyof HeadingTypographySettings[HeadingLevelKey],
    value: string | HeadingTextStyle,
  ) => {
    setFormData((prev) => ({
      ...prev,
      headingTypography: {
        ...prev.headingTypography,
        [level]: {
          ...prev.headingTypography[level],
          [field]: value,
        },
      },
    }))
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

  const getHomeSectionLabel = (id: HomeSection["id"]) =>
    id === "services"
      ? "Services"
      : id === "products"
        ? "Products"
        : id === "pricing"
          ? "Pricing"
          : id === "training"
            ? "Training"
            : id === "departments"
              ? "Departments"
            : id === "testimonials"
              ? "Testimonials"
              : id === "who-we-serve"
                ? "Who We Serve"
                : id === "cta"
                  ? "CTA Banner"
                : "Why Choose Us"

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
      const whyChooseSection = formData.homeSections.find((section) => section.id === "why-choose")
      const normalizedHeadingTypography = normalizeHeadingTypography(formData.headingTypography)
      const response = await fetch("/api/admin/site-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          navItems: formData.navItems,
          footerNavItems: formData.footerNavItems,
          homeSections: formData.homeSections,
          editorApprovalRequired: formData.editorApprovalRequired,
          whyChooseTitle: whyChooseSection?.title || formData.whyChooseTitle,
          whyChooseSubtitle: whyChooseSection?.subtitle || formData.whyChooseSubtitle,
          whyChooseItems: formData.whyChooseItems,
          whyChooseLayout: whyChooseSection?.itemsLayout || formData.whyChooseLayout,
          whyChooseMobileLayout: whyChooseSection?.mobileLayout || formData.whyChooseMobileLayout,
          whyChooseScrollSpeed: whyChooseSection?.scrollSpeed || formData.whyChooseScrollSpeed,
          analyticsScript: formData.analyticsScript,
          headerCode: formData.headerCode,
          footerCode: formData.footerCode,
          allowIndexing: formData.allowIndexing,
          seoTitleTemplate: formData.seoTitleTemplate,
          seoDefaultTitle: formData.seoDefaultTitle,
          seoDefaultDescription: formData.seoDefaultDescription,
          seoDefaultKeywords: formData.seoDefaultKeywords,
          seoDefaultOgImage: formData.seoDefaultOgImage,
          seoDefaultCanonicalBase: formData.seoDefaultCanonicalBase,
          staticSeo: formData.staticSeo,
          headingTypography: normalizedHeadingTypography,
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
      if (!res.ok || (!data?.key && !data?.url)) {
        throw new Error(data.error || "Upload failed")
      }
      setFormData((prev) => ({ ...prev, [target]: data.key || data.url }))
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const handleHeroSlideUpload = async (file: File | null, index: number) => {
    if (!file) return
    setUploading(true)
    setUploadingHeroIndex(index)
    setError(null)
    setSuccess(false)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append("file", file)
      formDataUpload.append("kind", "hero")
      const res = await fetch("/api/admin/site-settings/upload", {
        method: "POST",
        body: formDataUpload,
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || (!data?.key && !data?.url)) {
        throw new Error(data.error || "Upload failed")
      }
      const value = data.key || data.url
      setFormData((prev) => {
        const copy = [...prev.heroSlides]
        if (!copy[index]) return prev
        copy[index] = { ...copy[index], image: value }
        return { ...prev, heroSlides: copy }
      })
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
      setUploadingHeroIndex(null)
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="headings">Headings</TabsTrigger>
          <TabsTrigger value="home-sections">Home Sections</TabsTrigger>
          <TabsTrigger value="navigation">Navigation & Layout</TabsTrigger>
          <TabsTrigger value="hero">Hero Slides</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
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

          <div className="space-y-4">
            <div>
              <Label className="font-semibold">Code Injections</Label>
              <p className="text-xs text-muted-foreground">
                Add snippets to be included on every page. Use trusted code only.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="analyticsScript">Analytics Code</Label>
              <Textarea
                id="analyticsScript"
                value={formData.analyticsScript}
                onChange={(e) => setFormData({ ...formData, analyticsScript: e.target.value })}
                placeholder="<script>/* analytics */</script>"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="headerCode">Header Code</Label>
              <Textarea
                id="headerCode"
                value={formData.headerCode}
                onChange={(e) => setFormData({ ...formData, headerCode: e.target.value })}
                placeholder="<!-- header snippets -->"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="footerCode">Footer Code</Label>
              <Textarea
                id="footerCode"
                value={formData.footerCode}
                onChange={(e) => setFormData({ ...formData, footerCode: e.target.value })}
                placeholder="<!-- footer snippets -->"
                rows={4}
              />
            </div>
          </div>

        </TabsContent>

        <TabsContent value="headings" className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label className="font-semibold">Heading Typography</Label>
              <p className="text-xs text-muted-foreground">
                Applies site-wide to rich-content headings. Page and blog titles use the H1 settings.
              </p>
            </div>
            <div className="space-y-3">
              {(Object.keys(formData.headingTypography) as HeadingLevelKey[]).map((level) => {
                const levelSettings = formData.headingTypography[level]
                const fallback = DEFAULT_HEADING_TYPOGRAPHY[level]
                return (
                  <div key={level} className="rounded-md border border-border/60 bg-muted/40 p-3 space-y-3">
                    <p className="text-sm font-medium uppercase">{level}</p>
                    <div className="grid gap-3 md:grid-cols-4">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Font Size</Label>
                        <Input
                          value={levelSettings.fontSize}
                          onChange={(e) => updateHeadingTypography(level, "fontSize", e.target.value)}
                          placeholder={fallback.fontSize}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Style</Label>
                        <Select
                          value={levelSettings.textStyle}
                          onValueChange={(value) =>
                            updateHeadingTypography(level, "textStyle", normalizeHeadingTextStyle(value))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select style" />
                          </SelectTrigger>
                          <SelectContent>
                            {HEADING_TEXT_STYLE_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Space Before</Label>
                        <Input
                          value={levelSettings.spaceBefore}
                          onChange={(e) => updateHeadingTypography(level, "spaceBefore", e.target.value)}
                          placeholder={fallback.spaceBefore}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Space After</Label>
                        <Input
                          value={levelSettings.spaceAfter}
                          onChange={(e) => updateHeadingTypography(level, "spaceAfter", e.target.value)}
                          placeholder={fallback.spaceAfter}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="home-sections" className="space-y-6">
          <div className="space-y-2">
            <Label className="font-semibold">Home Sections</Label>
            <Accordion type="single" collapsible className="space-y-2 pt-1">
              {formData.homeSections.map((section, index) => {
                const label = getHomeSectionLabel(section.id)
                return (
                  <AccordionItem
                    key={section.id}
                    value={`home-section-${section.id}`}
                    className="rounded-md border border-border/60 bg-muted/40 px-3 py-1"
                  >
                    <div className="flex items-center justify-between gap-3 py-2">
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
                        <AccordionTrigger
                          className="!flex-none !items-center !gap-0 !py-1 !px-2 hover:no-underline"
                          aria-label={`Toggle ${label} section settings`}
                        >
                          <span className="sr-only">Toggle {label} settings</span>
                        </AccordionTrigger>
                      </div>
                    </div>
                    <AccordionContent className="pb-3">
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-1">
                          <Label htmlFor={`home-section-title-${section.id}`} className="text-xs text-muted-foreground">
                            Section Title
                          </Label>
                          <Input
                            id={`home-section-title-${section.id}`}
                            value={section.title || label}
                            onChange={(e) => updateHomeSectionTitle(section.id, e.target.value)}
                            placeholder={label}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`home-section-subtitle-${section.id}`} className="text-xs text-muted-foreground">
                            Section Subtitle
                          </Label>
                          <Input
                            id={`home-section-subtitle-${section.id}`}
                            value={section.subtitle || ""}
                            onChange={(e) => updateHomeSectionSubtitle(section.id, e.target.value)}
                            placeholder="Section subtitle"
                          />
                        </div>
                        {section.id === "cta" ? (
                          <>
                            <div className="space-y-1">
                              <Label htmlFor={`home-section-cta-text-${section.id}`} className="text-xs text-muted-foreground">
                                CTA Button Text
                              </Label>
                              <Input
                                id={`home-section-cta-text-${section.id}`}
                                value={section.ctaText || "Contact Us Today"}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    homeSections: prev.homeSections.map((item) =>
                                      item.id === section.id ? { ...item, ctaText: e.target.value } : item,
                                    ),
                                  }))
                                }
                                placeholder="Contact Us Today"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor={`home-section-cta-href-${section.id}`} className="text-xs text-muted-foreground">
                                CTA Button Link
                              </Label>
                              <Input
                                id={`home-section-cta-href-${section.id}`}
                                value={section.ctaHref || "/contact"}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    homeSections: prev.homeSections.map((item) =>
                                      item.id === section.id ? { ...item, ctaHref: e.target.value } : item,
                                    ),
                                  }))
                                }
                                placeholder="/contact"
                              />
                            </div>
                          </>
                        ) : null}
                        {section.id !== "cta" ? (
                          <>
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Layout</Label>
                              <Select
                                value={section.itemsLayout || "grid"}
                                onValueChange={(value: "grid" | "scroll") => updateHomeSectionLayout(section.id, value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select layout" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="grid">Multi-line grid</SelectItem>
                                  <SelectItem value="scroll">Scrolling loop</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Mobile Layout</Label>
                              <Select
                                value={section.mobileLayout || "match"}
                                onValueChange={(value: "match" | "grid" | "scroll") =>
                                  updateHomeSectionMobileLayout(section.id, value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select mobile layout" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="match">Same as desktop</SelectItem>
                                  <SelectItem value="grid">Multi-line grid</SelectItem>
                                  <SelectItem value="scroll">Scrolling loop</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor={`home-section-scroll-speed-${section.id}`} className="text-xs text-muted-foreground">
                                Scroll Speed (seconds)
                              </Label>
                              <Input
                                id={`home-section-scroll-speed-${section.id}`}
                                type="number"
                                min={5}
                                max={120}
                                value={section.scrollSpeed ?? 30}
                                onChange={(e) => updateHomeSectionScrollSpeed(section.id, Number(e.target.value))}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Pause On Hover</Label>
                              <div className="flex items-center gap-3 rounded-md border border-border/60 bg-background px-3 py-2">
                                <Switch
                                  id={`home-section-pause-hover-${section.id}`}
                                  checked={section.pauseOnHover ?? true}
                                  onCheckedChange={(checked) => updateHomeSectionPauseOnHover(section.id, checked)}
                                />
                                <Label htmlFor={`home-section-pause-hover-${section.id}`} className="text-sm font-normal">
                                  Pause while hovered
                                </Label>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Drag To Scroll</Label>
                              <div className="flex items-center gap-3 rounded-md border border-border/60 bg-background px-3 py-2">
                                <Switch
                                  id={`home-section-drag-enabled-${section.id}`}
                                  checked={section.dragEnabled ?? true}
                                  onCheckedChange={(checked) => updateHomeSectionDragEnabled(section.id, checked)}
                                />
                                <Label htmlFor={`home-section-drag-enabled-${section.id}`} className="text-sm font-normal">
                                  Allow mouse/touch dragging
                                </Label>
                              </div>
                            </div>
                          </>
                        ) : null}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
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

        <TabsContent value="seo" className="space-y-6">
          <div className="space-y-2">
            <Label className="font-semibold">Search Engine Indexing</Label>
            <div className="flex items-center justify-between rounded-md border border-border/60 bg-muted/40 px-3 py-2">
              <div className="space-y-1">
                <p className="text-sm font-medium">Allow search engines to index the site</p>
                <p className="text-xs text-muted-foreground">
                  Turn off while the site is in development to prevent indexing.
                </p>
              </div>
              <Switch
                id="allowIndexing"
                checked={formData.allowIndexing}
                onCheckedChange={(checked) => setFormData({ ...formData, allowIndexing: checked })}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="seoDefaultTitle">Default Title</Label>
              <Input
                id="seoDefaultTitle"
                value={formData.seoDefaultTitle}
                onChange={(e) => setFormData({ ...formData, seoDefaultTitle: e.target.value })}
                placeholder={formData.siteTitle || "Site"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seoTitleTemplate">Title Template</Label>
              <Input
                id="seoTitleTemplate"
                value={formData.seoTitleTemplate}
                onChange={(e) => setFormData({ ...formData, seoTitleTemplate: e.target.value })}
                placeholder="{title} - {siteTitle}"
              />
              <p className="text-xs text-muted-foreground">Use {`{title}`} and {`{siteTitle}`} to insert values.</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="seoDefaultDescription">Default Description</Label>
            <Textarea
              id="seoDefaultDescription"
              value={formData.seoDefaultDescription}
              onChange={(e) => setFormData({ ...formData, seoDefaultDescription: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="seoDefaultKeywords">Default Keywords</Label>
              <Textarea
                id="seoDefaultKeywords"
                value={formData.seoDefaultKeywords}
                onChange={(e) => setFormData({ ...formData, seoDefaultKeywords: e.target.value })}
                placeholder="software solutions, training, education"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seoDefaultOgImage">Default OG Image URL</Label>
              <Input
                id="seoDefaultOgImage"
                value={formData.seoDefaultOgImage}
                onChange={(e) => setFormData({ ...formData, seoDefaultOgImage: e.target.value })}
                placeholder="https://example.com/og-image.jpg"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="seoDefaultCanonicalBase">Canonical Base URL</Label>
            <Input
              id="seoDefaultCanonicalBase"
              value={formData.seoDefaultCanonicalBase}
              onChange={(e) => setFormData({ ...formData, seoDefaultCanonicalBase: e.target.value })}
              placeholder="https://absons.net"
            />
          </div>

          <div className="space-y-3">
            <div>
              <Label className="font-semibold">Static Page Overrides</Label>
              <p className="text-xs text-muted-foreground">
                Optional overrides for static routes. Leave blank to use global defaults.
              </p>
            </div>
            <Accordion type="multiple" className="space-y-3">
              {([
                { key: "home", label: "Home" },
                { key: "about", label: "About" },
                { key: "services", label: "Services" },
                { key: "training", label: "Training" },
                { key: "contact", label: "Contact" },
                { key: "blog", label: "Blog List" },
              ] as const).map(({ key, label }) => (
                <AccordionItem key={key} value={`seo-${key}`} className="border border-border rounded-lg">
                  <AccordionTrigger className="px-4 py-3 text-sm font-semibold">{label}</AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor={`seo-${key}-title`}>SEO Title</Label>
                          <Input
                            id={`seo-${key}-title`}
                            value={formData.staticSeo[key].title}
                            onChange={(e) => updateStaticSeo(key, { title: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`seo-${key}-canonical`}>Canonical URL</Label>
                          <Input
                            id={`seo-${key}-canonical`}
                            value={formData.staticSeo[key].canonical}
                            onChange={(e) => updateStaticSeo(key, { canonical: e.target.value })}
                            placeholder="https://example.com/page"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`seo-${key}-description`}>SEO Description</Label>
                        <Textarea
                          id={`seo-${key}-description`}
                          value={formData.staticSeo[key].description}
                          onChange={(e) => updateStaticSeo(key, { description: e.target.value })}
                          rows={3}
                        />
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor={`seo-${key}-keywords`}>SEO Keywords</Label>
                          <Textarea
                            id={`seo-${key}-keywords`}
                            value={formData.staticSeo[key].keywords}
                            onChange={(e) => updateStaticSeo(key, { keywords: e.target.value })}
                            rows={2}
                            placeholder="keyword1, keyword2"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`seo-${key}-og`}>SEO OG Image URL</Label>
                          <Input
                            id={`seo-${key}-og`}
                            value={formData.staticSeo[key].ogImage}
                            onChange={(e) => updateStaticSeo(key, { ogImage: e.target.value })}
                            placeholder="https://example.com/og-image.jpg"
                          />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id={`seo-${key}-noindex`}
                            checked={formData.staticSeo[key].noIndex}
                            onCheckedChange={(checked) => updateStaticSeo(key, { noIndex: checked })}
                          />
                          <Label htmlFor={`seo-${key}-noindex`}>No index</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id={`seo-${key}-nofollow`}
                            checked={formData.staticSeo[key].noFollow}
                            onCheckedChange={(checked) => updateStaticSeo(key, { noFollow: checked })}
                          />
                          <Label htmlFor={`seo-${key}-nofollow`}>No follow</Label>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </TabsContent>

        <TabsContent value="navigation" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="order-last md:col-span-2">
              <Accordion type="single" collapsible className="space-y-3">
                <AccordionItem value="header-menu" className="border border-border rounded-lg">
                  <AccordionTrigger className="px-4 py-3 text-sm font-semibold">Header Menu Items</AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="flex flex-col gap-3">
                      <div className="space-y-4 rounded-md border border-border/60 bg-muted/30 p-4">
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
                          <div className="space-y-2 md:col-span-2">
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
                        </div>
                      </div>

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
          </div>

          <div className="space-y-3 rounded-md border border-border/60 bg-muted/30 p-4">
            <div>
              <Label className="font-semibold">Page Layout</Label>
              <p className="text-xs text-muted-foreground">Global website container width settings.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
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
              </div>
              {formData.layoutMode === "container" ? (
                <div className="space-y-2">
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
              ) : null}
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
                    <div className="flex items-center gap-3">
                      <Label
                        htmlFor={`heroSlideUpload-${index}`}
                        className="inline-flex items-center gap-2 text-sm text-primary cursor-pointer hover:underline"
                      >
                        <UploadCloud className="h-4 w-4" />
                        Upload hero image
                      </Label>
                      <input
                        id={`heroSlideUpload-${index}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleHeroSlideUpload(e.target.files?.[0] || null, index)}
                      />
                      {uploading && uploadingHeroIndex === index ? (
                        <span className="text-xs text-muted-foreground">Uploading...</span>
                      ) : null}
                    </div>
                    <p className="text-xs text-muted-foreground">Upload stores asset key; URL is resolved at render time.</p>
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
