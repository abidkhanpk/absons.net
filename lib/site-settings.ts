import { prisma } from "./prisma"

export type SiteSettings = {
  siteTitle: string
  logoUrl: string | null
  faviconUrl: string | null
  navAlignment: string
  navLoginText: string
  navCtaText: string
  navCtaHref: string
  navCtaEnabled: boolean
  heroSlides: HeroSlide[]
  heroMode: "static" | "parallax"
  heroStaticIndex: number
  heroAutoplaySeconds: number
  heroHeight: number
  showServices: boolean
  showTraining: boolean
  showTestimonials: boolean
  navItems: NavItem[]
  footerNavItems: NavItem[]
  homeSections: HomeSection[]
  businessHours: string
  businessDays: string
  businessHoursSchedule: BusinessHourEntry[]
  showBusinessHours: boolean
  businessHoursMode: "table" | "summary" | "hidden"
  layoutMode: "full" | "container"
  layoutWidth: number
  logoWidth: number
  logoHeight: number
  logoRadius: number
  showLoginLink: boolean
  editorApprovalRequired: boolean
  whyChooseTitle: string
  whyChooseSubtitle: string
  whyChooseItems: WhyChooseItem[]
  whyChooseLayout: "grid" | "scroll"
  whyChooseMobileLayout: "match" | "grid" | "scroll"
  whyChooseScrollSpeed: number
  analyticsScript: string
  headerCode: string
  footerCode: string
  allowIndexing: boolean
  seoTitleTemplate: string
  seoDefaultTitle: string
  seoDefaultDescription: string
  seoDefaultKeywords: string
  seoDefaultOgImage: string
  seoDefaultCanonicalBase: string
  staticSeo: StaticSeoSettings
  contactEmail: string | null
  contactPhone: string | null
  contactAddress: string | null
}

export type NavItem = {
  id: string
  label: string
  href: string
  enabled: boolean
}

export type HomeSection = {
  id: "services" | "training" | "testimonials" | "why-choose"
  enabled: boolean
}

export type HeroSlide = {
  title: string
  subtitle?: string
  ctaText?: string
  ctaHref?: string
  image?: string
  layout?: "full" | "image-left" | "image-right" | "no-image"
  bgColor?: string
}

export type BusinessHourEntry = {
  day: string
  open: string
  close: string
  closed?: boolean
}

export type WhyChooseItem = {
  title: string
  description: string
  icon: "check" | "award" | "book" | "star" | "shield" | "bolt" | "heart" | "users" | "globe" | "sparkles"
}

export type StaticSeoEntry = {
  title: string
  description: string
  keywords: string
  ogImage: string
  canonical: string
  noIndex: boolean
  noFollow: boolean
}

export type StaticSeoSettings = Record<
  "home" | "about" | "services" | "training" | "contact" | "blog",
  StaticSeoEntry
>

const defaultSettings: SiteSettings = {
  siteTitle: "Site",
  logoUrl: "/uploads/default-logo.png",
  faviconUrl: "/uploads/default-icon-light-32x32.png",
  navAlignment: "left",
  navLoginText: "Login",
  navCtaText: "Get Started",
  navCtaHref: "/contact",
  navCtaEnabled: true,
  heroSlides: [
    {
      title: "Empowering Organizations with Innovative Software Solutions",
      subtitle: "Specialized software for educational institutions, Quran academies, professional training, and complete order supply solutions.",
      ctaText: "Explore Services",
      ctaHref: "/services",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80",
      layout: "image-right",
      bgColor: "#0f172a",
    },
    {
      title: "School & Madaris Management",
      subtitle: "Digital admissions, attendance, fee and exam workflows built for schools and madaris in Pakistan.",
      ctaText: "See Education Solutions",
      ctaHref: "/services",
      image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1600&q=80",
      layout: "image-left",
      bgColor: "#0f172a",
    },
    {
      title: "Certified Vibration Training",
      subtitle: "Mobius Institute-aligned vibration analysis courses with local delivery and global credentials.",
      ctaText: "View Training Tracks",
      ctaHref: "/training",
      image: "https://images.unsplash.com/photo-1504805572947-34fad45aed93?auto=format&fit=crop&w=1600&q=80",
      layout: "image-right",
      bgColor: "#0b132b",
    },
    {
      title: "Partner With Us",
      subtitle: "From custom software to general order supplies, we deliver reliable outcomes for growing organizations.",
      ctaText: "Talk to Us",
      ctaHref: "/contact",
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1600&q=80",
      layout: "full",
      bgColor: "#111827",
    },
  ],
  heroMode: "parallax",
  heroStaticIndex: 0,
  heroAutoplaySeconds: 6,
  heroHeight: 560,
  showServices: true,
  showTraining: true,
  showTestimonials: true,
  navItems: [
    { id: "home", label: "Home", href: "/", enabled: true },
    { id: "about", label: "About", href: "/about", enabled: true },
    { id: "services", label: "Services", href: "/services", enabled: true },
    { id: "training", label: "Training", href: "/training", enabled: true },
    { id: "blog", label: "Blog", href: "/blog", enabled: true },
    { id: "contact", label: "Contact", href: "/contact", enabled: true },
  ],
  footerNavItems: [
    { id: "home", label: "Home", href: "/", enabled: true },
    { id: "about", label: "About", href: "/about", enabled: true },
    { id: "services", label: "Services", href: "/services", enabled: true },
    { id: "training", label: "Training", href: "/training", enabled: true },
    { id: "blog", label: "Blog", href: "/blog", enabled: true },
    { id: "contact", label: "Contact", href: "/contact", enabled: true },
  ],
  homeSections: [
    { id: "services", enabled: true },
    { id: "training", enabled: true },
    { id: "testimonials", enabled: true },
    { id: "why-choose", enabled: true },
  ],
  businessHoursSchedule: [
    { day: "Monday", open: "09:00", close: "18:00" },
    { day: "Tuesday", open: "09:00", close: "18:00" },
    { day: "Wednesday", open: "09:00", close: "18:00" },
    { day: "Thursday", open: "09:00", close: "18:00" },
    { day: "Friday", open: "09:00", close: "18:00" },
    { day: "Saturday", open: "10:00", close: "14:00" },
    { day: "Sunday", open: "00:00", close: "00:00", closed: true },
  ],
  showBusinessHours: true,
  businessHoursMode: "table",
  businessHours: "Mon - Sat, 9:00 AM - 6:00 PM",
  businessDays: "Mon - Sat",
  layoutMode: "container",
  layoutWidth: 90,
  logoWidth: 40,
  logoHeight: 40,
  logoRadius: 0,
  showLoginLink: false,
  editorApprovalRequired: true,
  whyChooseTitle: "Why Choose Us",
  whyChooseSubtitle: "Trusted by educational institutions and organizations across Pakistan",
  whyChooseLayout: "grid",
  whyChooseMobileLayout: "match",
  whyChooseScrollSpeed: 30,
  analyticsScript: "",
  headerCode: "",
  footerCode: "",
  allowIndexing: true,
  seoTitleTemplate: "{title} - {siteTitle}",
  seoDefaultTitle: "",
  seoDefaultDescription:
    "Professional software solutions for schools, Quran academies, madaris, and vibration analysis training certification from Mobius Institute of Australia.",
  seoDefaultKeywords: "",
  seoDefaultOgImage: "",
  seoDefaultCanonicalBase: "",
  staticSeo: {
    home: {
      title: "",
      description: "",
      keywords: "",
      ogImage: "",
      canonical: "",
      noIndex: false,
      noFollow: false,
    },
    about: {
      title: "",
      description: "",
      keywords: "",
      ogImage: "",
      canonical: "",
      noIndex: false,
      noFollow: false,
    },
    services: {
      title: "",
      description: "",
      keywords: "",
      ogImage: "",
      canonical: "",
      noIndex: false,
      noFollow: false,
    },
    training: {
      title: "",
      description: "",
      keywords: "",
      ogImage: "",
      canonical: "",
      noIndex: false,
      noFollow: false,
    },
    contact: {
      title: "",
      description: "",
      keywords: "",
      ogImage: "",
      canonical: "",
      noIndex: false,
      noFollow: false,
    },
    blog: {
      title: "",
      description: "",
      keywords: "",
      ogImage: "",
      canonical: "",
      noIndex: false,
      noFollow: false,
    },
  },
  whyChooseItems: [
    { title: "Proven Expertise", description: "Years of experience delivering quality solutions", icon: "check" },
    { title: "Certified Training", description: "Mobius Institute certified vibration analysis programs", icon: "award" },
    { title: "Tailored Solutions", description: "Custom software designed for your specific requirements", icon: "book" },
    { title: "Ongoing Support", description: "Dedicated support and maintenance for all solutions", icon: "star" },
  ],
  contactEmail: "info@absons.net",
  contactPhone: "+92 XXX XXXXXXX",
  contactAddress: "Pakistan",
}

function resolveLogoUrl(logoUrl: string | null | undefined) {
  if (!logoUrl || logoUrl.trim() === "") {
    // Nothing configured in settings: use the bundled default logo
    return defaultSettings.logoUrl
  }

  // If an old WordPress asset URL is still stored, serve the bundled default instead of a 404
  if (logoUrl.includes("/wp-includes/")) {
    return defaultSettings.logoUrl
  }

  return logoUrl
}

function resolveFaviconUrl(faviconUrl: string | null | undefined) {
  if (!faviconUrl || faviconUrl.trim() === "") {
    return defaultSettings.faviconUrl
  }

  if (faviconUrl.includes("/wp-includes/")) {
    return defaultSettings.faviconUrl
  }

  return faviconUrl
}

function parseHeroSlides(raw: string | null | undefined): HeroSlide[] {
  if (!raw) return defaultSettings.heroSlides
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      const mapped = parsed.map((slide) => ({
        title: slide?.title ?? "",
        subtitle: slide?.subtitle ?? "",
        ctaText: slide?.ctaText ?? "",
        ctaHref: slide?.ctaHref ?? "",
        image: slide?.image ?? "",
        layout: slide?.layout ?? "full",
        bgColor: slide?.bgColor ?? "",
      }))
      return mapped.length > 0 ? mapped : defaultSettings.heroSlides
    }
    return defaultSettings.heroSlides
  } catch (error) {
    console.error("Failed to parse hero slides, using defaults:", error)
    return defaultSettings.heroSlides
  }
}

function parseNavItems(raw: unknown, fallback: NavItem[] = defaultSettings.navItems): NavItem[] {
  try {
    const parsed = Array.isArray(raw) ? raw : typeof raw === "string" && raw ? JSON.parse(raw) : []
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

function parseNavItemsGroup(raw: unknown) {
  try {
    if (!raw) {
      return { main: defaultSettings.navItems, footer: defaultSettings.footerNavItems }
    }
    if (Array.isArray(raw)) {
      const normalized = parseNavItems(raw, defaultSettings.navItems)
      return { main: normalized, footer: parseNavItems(raw, defaultSettings.footerNavItems) }
    }
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw
    if (Array.isArray(parsed)) {
      const normalized = parseNavItems(parsed, defaultSettings.navItems)
      return { main: normalized, footer: parseNavItems(parsed, defaultSettings.footerNavItems) }
    }
    if (parsed && typeof parsed === "object") {
      const main = parseNavItems((parsed as { main?: unknown }).main, defaultSettings.navItems)
      const footer = parseNavItems((parsed as { footer?: unknown }).footer, defaultSettings.footerNavItems)
      return { main, footer }
    }
    return { main: defaultSettings.navItems, footer: defaultSettings.footerNavItems }
  } catch {
    return { main: defaultSettings.navItems, footer: defaultSettings.footerNavItems }
  }
}

function parseHomeSections(
  raw: unknown,
  fallback: { services: boolean; training: boolean; testimonials: boolean; whyChoose: boolean },
): HomeSection[] {
  try {
    const parsed = Array.isArray(raw) ? raw : raw ? JSON.parse(String(raw)) : []
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
      const fallbackEnabled = fallback[id]
      normalized.push({
        id,
        enabled: typeof entry.enabled === "boolean" ? entry.enabled : fallbackEnabled,
      })
      seen.add(id)
    })
    allowed.forEach((id) => {
      if (!seen.has(id)) normalized.push({ id, enabled: fallback[id] })
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

function parseBusinessHoursSchedule(raw: unknown): BusinessHourEntry[] {
  try {
    const parsed = Array.isArray(raw) ? raw : raw ? JSON.parse(String(raw)) : []
    if (!Array.isArray(parsed)) return defaultSettings.businessHoursSchedule
    const cleaned = parsed
      .map((entry) => ({
        day: entry?.day ?? "",
        open: entry?.open ?? "",
        close: entry?.close ?? "",
        closed: Boolean(entry?.closed),
      }))
      .filter((entry) => entry.day)
    return cleaned.length > 0 ? cleaned : defaultSettings.businessHoursSchedule
  } catch {
    return defaultSettings.businessHoursSchedule
  }
}

function parseWhyChooseItems(raw: unknown): WhyChooseItem[] {
  try {
    const parsed = Array.isArray(raw) ? raw : raw ? JSON.parse(String(raw)) : []
    if (!Array.isArray(parsed)) return defaultSettings.whyChooseItems
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
    return normalized.length > 0 ? normalized : defaultSettings.whyChooseItems
  } catch {
    return defaultSettings.whyChooseItems
  }
}

function parseStaticSeo(raw: unknown): StaticSeoSettings {
  const defaultEntry = defaultSettings.staticSeo.home
  const normalizeEntry = (entry: any): StaticSeoEntry => ({
    title: typeof entry?.title === "string" ? entry.title : "",
    description: typeof entry?.description === "string" ? entry.description : "",
    keywords: typeof entry?.keywords === "string" ? entry.keywords : "",
    ogImage: typeof entry?.ogImage === "string" ? entry.ogImage : "",
    canonical: typeof entry?.canonical === "string" ? entry.canonical : "",
    noIndex: Boolean(entry?.noIndex),
    noFollow: Boolean(entry?.noFollow),
  })
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw
    if (!parsed || typeof parsed !== "object") return defaultSettings.staticSeo
    return {
      home: normalizeEntry(parsed.home ?? defaultEntry),
      about: normalizeEntry(parsed.about ?? defaultEntry),
      services: normalizeEntry(parsed.services ?? defaultEntry),
      training: normalizeEntry(parsed.training ?? defaultEntry),
      contact: normalizeEntry(parsed.contact ?? defaultEntry),
      blog: normalizeEntry(parsed.blog ?? defaultEntry),
    }
  } catch {
    return defaultSettings.staticSeo
  }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: "site" } })
    if (!settings) return defaultSettings

    const fallbackHomeVisibility = {
      services: settings.showServices ?? defaultSettings.showServices,
      training: settings.showTraining ?? defaultSettings.showTraining,
      testimonials: settings.showTestimonials ?? defaultSettings.showTestimonials,
      whyChoose: true,
    }
    const homeSections = parseHomeSections(settings.homeSections, fallbackHomeVisibility)
    const resolvedVisibility = homeSections.reduce(
      (acc, section) => {
        acc[section.id] = section.enabled
        return acc
      },
      {
        services: fallbackHomeVisibility.services,
        training: fallbackHomeVisibility.training,
        testimonials: fallbackHomeVisibility.testimonials,
        "why-choose": fallbackHomeVisibility.whyChoose,
      },
    )

    const navItemsGroup = parseNavItemsGroup(settings.navItems)

    return {
      siteTitle: settings.siteTitle ?? defaultSettings.siteTitle,
      logoUrl: resolveLogoUrl(settings.logoUrl),
      faviconUrl: resolveFaviconUrl(settings.faviconUrl),
      navAlignment: settings.navAlignment ?? defaultSettings.navAlignment,
      navLoginText: settings.navLoginText ?? defaultSettings.navLoginText,
      navCtaText: settings.navCtaText ?? defaultSettings.navCtaText,
      navCtaHref: settings.navCtaHref ?? defaultSettings.navCtaHref,
      navCtaEnabled: settings.navCtaEnabled ?? defaultSettings.navCtaEnabled,
      heroSlides: parseHeroSlides(settings.heroSlides),
      heroMode: (settings.heroMode as "static" | "parallax") ?? defaultSettings.heroMode,
      heroStaticIndex: settings.heroStaticIndex ?? defaultSettings.heroStaticIndex,
      heroAutoplaySeconds: settings.heroAutoplaySeconds ?? defaultSettings.heroAutoplaySeconds,
      heroHeight: settings.heroHeight ?? defaultSettings.heroHeight,
      showServices: resolvedVisibility.services,
      showTraining: resolvedVisibility.training,
      showTestimonials: resolvedVisibility.testimonials,
      navItems: navItemsGroup.main,
      footerNavItems: navItemsGroup.footer,
      homeSections,
      businessHoursSchedule: parseBusinessHoursSchedule(settings.businessHoursSchedule),
      showBusinessHours: settings.showBusinessHours ?? defaultSettings.showBusinessHours,
      businessHoursMode: (settings.businessHoursMode as "table" | "summary" | "hidden") ?? defaultSettings.businessHoursMode,
      businessHours: settings.businessHours ?? defaultSettings.businessHours,
      businessDays: settings.businessDays ?? defaultSettings.businessDays,
      layoutMode: (settings.layoutMode as "full" | "container") ?? defaultSettings.layoutMode,
      layoutWidth: settings.layoutWidth ?? defaultSettings.layoutWidth,
      logoWidth: settings.logoWidth ?? defaultSettings.logoWidth,
      logoHeight: settings.logoHeight ?? defaultSettings.logoHeight,
      logoRadius: settings.logoRadius ?? defaultSettings.logoRadius,
      showLoginLink: settings.showLoginLink ?? defaultSettings.showLoginLink,
      editorApprovalRequired: settings.editorApprovalRequired ?? defaultSettings.editorApprovalRequired,
      whyChooseTitle: settings.whyChooseTitle ?? defaultSettings.whyChooseTitle,
      whyChooseSubtitle: settings.whyChooseSubtitle ?? defaultSettings.whyChooseSubtitle,
      whyChooseItems: parseWhyChooseItems(settings.whyChooseItems),
      whyChooseLayout: (settings.whyChooseLayout as "grid" | "scroll") ?? defaultSettings.whyChooseLayout,
      whyChooseMobileLayout:
        (settings.whyChooseMobileLayout as "match" | "grid" | "scroll") ?? defaultSettings.whyChooseMobileLayout,
      whyChooseScrollSpeed: settings.whyChooseScrollSpeed ?? defaultSettings.whyChooseScrollSpeed,
      analyticsScript: settings.analyticsScript ?? defaultSettings.analyticsScript,
      headerCode: settings.headerCode ?? defaultSettings.headerCode,
      footerCode: settings.footerCode ?? defaultSettings.footerCode,
      allowIndexing: settings.allowIndexing ?? defaultSettings.allowIndexing,
      seoTitleTemplate: settings.seoTitleTemplate ?? defaultSettings.seoTitleTemplate,
      seoDefaultTitle: settings.seoDefaultTitle ?? defaultSettings.seoDefaultTitle,
      seoDefaultDescription: settings.seoDefaultDescription ?? defaultSettings.seoDefaultDescription,
      seoDefaultKeywords: settings.seoDefaultKeywords ?? defaultSettings.seoDefaultKeywords,
      seoDefaultOgImage: settings.seoDefaultOgImage ?? defaultSettings.seoDefaultOgImage,
      seoDefaultCanonicalBase: settings.seoDefaultCanonicalBase ?? defaultSettings.seoDefaultCanonicalBase,
      staticSeo: parseStaticSeo(settings.staticSeo),
      contactEmail: settings.contactEmail ?? defaultSettings.contactEmail,
      contactPhone: settings.contactPhone ?? defaultSettings.contactPhone,
      contactAddress: settings.contactAddress ?? defaultSettings.contactAddress,
    }
  } catch (error) {
    console.error("Failed to load site settings, using defaults:", error)
    return defaultSettings
  }
}
