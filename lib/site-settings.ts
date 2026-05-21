import { prisma, isDatabaseConnectionError } from "./prisma"
import { resolveAssetUrl } from "./asset-url"
import {
  DEFAULT_HEADING_TYPOGRAPHY,
  normalizeHeadingTypography,
  type HeadingTypographySettings,
} from "./heading-typography"

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
  footerSecondaryNavItems: NavItem[]
  footerQuickLinksTitle: string
  footerSecondaryTitle: string
  footerContactTitle: string
  footerShowSecondaryColumn: boolean
  footerShowContactColumn: boolean
  footerShowCompanyInfo: boolean
  footerCompanyName: string
  footerCompanyDescription: string
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
  headingTypography: HeadingTypographySettings
}

export type NavItem = {
  id: string
  label: string
  href: string
  enabled: boolean
}

export type HomeSection = {
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
  footerSecondaryNavItems: [
    { id: "school-management", label: "School Management", href: "/services", enabled: true },
    { id: "quran-academy", label: "Quran Academy Solutions", href: "/services", enabled: true },
    { id: "vibration-analysis", label: "Vibration Analysis", href: "/training", enabled: true },
    { id: "order-supply", label: "Order Supply", href: "/services", enabled: true },
  ],
  footerQuickLinksTitle: "Quick Links",
  footerSecondaryTitle: "Services",
  footerContactTitle: "Contact Info",
  footerShowSecondaryColumn: true,
  footerShowContactColumn: true,
  footerShowCompanyInfo: true,
  footerCompanyName: "Site",
  footerCompanyDescription: "Professional software solutions and training services for educational institutions and organizations.",
  homeSections: [
    {
      id: "services",
      enabled: true,
      title: "Our Services",
      subtitle: "Comprehensive solutions tailored to your organization's specific needs",
      itemsLayout: "grid",
      mobileLayout: "match",
      scrollSpeed: 30,
      pauseOnHover: true,
      dragEnabled: true,
    },
    {
      id: "products",
      enabled: true,
      title: "Our Products",
      subtitle: "Ready-to-deploy products that help your teams launch faster and operate with confidence.",
      itemsLayout: "grid",
      mobileLayout: "match",
      scrollSpeed: 30,
      pauseOnHover: true,
      dragEnabled: true,
    },
    {
      id: "pricing",
      enabled: true,
      title: "Pricing",
      subtitle: "Transparent plans for organizations at different stages, with support included.",
      itemsLayout: "grid",
      mobileLayout: "match",
      scrollSpeed: 30,
      pauseOnHover: true,
      dragEnabled: true,
    },
    {
      id: "training",
      enabled: true,
      title: "Training Programs",
      subtitle: "Vibration analysis training aligned with Mobius Institute standards.",
      itemsLayout: "grid",
      mobileLayout: "match",
      scrollSpeed: 30,
      pauseOnHover: true,
      dragEnabled: true,
    },
    {
      id: "departments",
      enabled: true,
      title: "Departments",
      subtitle: "Explore our specialized departments and their core capabilities.",
      itemsLayout: "grid",
      mobileLayout: "match",
      scrollSpeed: 30,
      pauseOnHover: true,
      dragEnabled: true,
    },
    {
      id: "testimonials",
      enabled: true,
      title: "What Our Clients Say",
      subtitle: "Trusted by institutions and organizations across the region",
      itemsLayout: "grid",
      mobileLayout: "match",
      scrollSpeed: 30,
      pauseOnHover: true,
      dragEnabled: true,
    },
    {
      id: "who-we-serve",
      enabled: true,
      title: "Who We Serve",
      subtitle: "Built for institutions, teams, and organizations that need dependable digital operations.",
      itemsLayout: "grid",
      mobileLayout: "match",
      scrollSpeed: 30,
      pauseOnHover: true,
      dragEnabled: true,
    },
    {
      id: "why-choose",
      enabled: true,
      title: "Why Choose Us",
      subtitle: "Trusted by educational institutions and organizations across Pakistan",
      itemsLayout: "grid",
      mobileLayout: "match",
      scrollSpeed: 30,
      pauseOnHover: true,
      dragEnabled: true,
    },
    {
      id: "cta",
      enabled: true,
      title: "Ready to Transform Your Organization?",
      subtitle: "Get in touch with us today to discuss how we can help you achieve your goals with our innovative solutions.",
      ctaText: "Contact Us Today",
      ctaHref: "/contact",
      itemsLayout: "grid",
      mobileLayout: "match",
      scrollSpeed: 30,
      pauseOnHover: true,
      dragEnabled: true,
    },
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
  headingTypography: DEFAULT_HEADING_TYPOGRAPHY,
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

  return resolveAssetUrl(logoUrl) || defaultSettings.logoUrl
}

function resolveFaviconUrl(faviconUrl: string | null | undefined) {
  if (!faviconUrl || faviconUrl.trim() === "") {
    return defaultSettings.faviconUrl
  }

  if (faviconUrl.includes("/wp-includes/")) {
    return defaultSettings.faviconUrl
  }

  return resolveAssetUrl(faviconUrl) || defaultSettings.faviconUrl
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
        image: resolveAssetUrl(typeof slide?.image === "string" ? slide.image : "") ?? "",
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

function parseNavItemsGroup(raw: unknown, fallbackCompanyName: string) {
  const defaultFooterMeta = {
    quickLinksTitle: defaultSettings.footerQuickLinksTitle,
    secondaryTitle: defaultSettings.footerSecondaryTitle,
    contactTitle: defaultSettings.footerContactTitle,
    secondary: defaultSettings.footerSecondaryNavItems,
    showSecondary: defaultSettings.footerShowSecondaryColumn,
    showContact: defaultSettings.footerShowContactColumn,
    showCompany: defaultSettings.footerShowCompanyInfo,
    companyName: fallbackCompanyName || defaultSettings.footerCompanyName,
    companyDescription: defaultSettings.footerCompanyDescription,
  }

  const parseFooterMeta = (rawMeta: unknown) => {
    if (!rawMeta || typeof rawMeta !== "object" || Array.isArray(rawMeta)) return defaultFooterMeta
    const meta = rawMeta as Record<string, unknown>
    return {
      quickLinksTitle:
        typeof meta.quickLinksTitle === "string" && meta.quickLinksTitle.trim()
          ? meta.quickLinksTitle.trim()
          : defaultFooterMeta.quickLinksTitle,
      secondaryTitle:
        typeof meta.secondaryTitle === "string" && meta.secondaryTitle.trim()
          ? meta.secondaryTitle.trim()
          : defaultFooterMeta.secondaryTitle,
      contactTitle:
        typeof meta.contactTitle === "string" && meta.contactTitle.trim()
          ? meta.contactTitle.trim()
          : defaultFooterMeta.contactTitle,
      secondary: parseNavItems(meta.secondary, defaultSettings.footerSecondaryNavItems),
      showSecondary: typeof meta.showSecondary === "boolean" ? meta.showSecondary : defaultFooterMeta.showSecondary,
      showContact: typeof meta.showContact === "boolean" ? meta.showContact : defaultFooterMeta.showContact,
      showCompany: typeof meta.showCompany === "boolean" ? meta.showCompany : defaultFooterMeta.showCompany,
      companyName:
        typeof meta.companyName === "string" && meta.companyName.trim()
          ? meta.companyName.trim()
          : defaultFooterMeta.companyName,
      companyDescription:
        typeof meta.companyDescription === "string" && meta.companyDescription.trim()
          ? meta.companyDescription.trim()
          : defaultFooterMeta.companyDescription,
    }
  }

  try {
    if (!raw) {
      return { main: defaultSettings.navItems, footer: defaultSettings.footerNavItems, footerMeta: defaultFooterMeta }
    }
    if (Array.isArray(raw)) {
      const normalized = parseNavItems(raw, defaultSettings.navItems)
      return {
        main: normalized,
        footer: parseNavItems(raw, defaultSettings.footerNavItems),
        footerMeta: defaultFooterMeta,
      }
    }
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw
    if (Array.isArray(parsed)) {
      const normalized = parseNavItems(parsed, defaultSettings.navItems)
      return {
        main: normalized,
        footer: parseNavItems(parsed, defaultSettings.footerNavItems),
        footerMeta: defaultFooterMeta,
      }
    }
    if (parsed && typeof parsed === "object") {
      const main = parseNavItems((parsed as { main?: unknown }).main, defaultSettings.navItems)
      const footer = parseNavItems((parsed as { footer?: unknown }).footer, defaultSettings.footerNavItems)
      const footerMeta = parseFooterMeta((parsed as { footerMeta?: unknown }).footerMeta)
      return { main, footer, footerMeta }
    }
    return { main: defaultSettings.navItems, footer: defaultSettings.footerNavItems, footerMeta: defaultFooterMeta }
  } catch {
    return { main: defaultSettings.navItems, footer: defaultSettings.footerNavItems, footerMeta: defaultFooterMeta }
  }
}

function parseHomeSections(
  raw: unknown,
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

  try {
    const parsed = Array.isArray(raw) ? raw : raw ? JSON.parse(String(raw)) : []
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
      const fallbackEnabled = fallback[id]
      normalized.push({
        id,
        enabled: typeof entry.enabled === "boolean" ? entry.enabled : fallbackEnabled,
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
      if (!seen.has(id)) normalized.push({ id, enabled: fallback[id], ...defaultMeta[id] })
    })
    return normalized
  } catch {
    return defaultHomeSections
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

function parseHeadingTypography(raw: unknown): HeadingTypographySettings {
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return DEFAULT_HEADING_TYPOGRAPHY
    }
    return normalizeHeadingTypography((parsed as Record<string, unknown>).typography)
  } catch {
    return DEFAULT_HEADING_TYPOGRAPHY
  }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: "site" } })
    if (!settings) return defaultSettings

    const fallbackHomeVisibility = {
      services: settings.showServices ?? defaultSettings.showServices,
      products: true,
      pricing: true,
      training: settings.showTraining ?? defaultSettings.showTraining,
      departments: true,
      testimonials: settings.showTestimonials ?? defaultSettings.showTestimonials,
      "who-we-serve": true,
      "why-choose": true,
      cta: true,
    }
    const homeSections = parseHomeSections(settings.homeSections, fallbackHomeVisibility)
    const resolvedVisibility = homeSections.reduce(
      (acc, section) => {
        acc[section.id] = section.enabled
        return acc
      },
      {
        services: fallbackHomeVisibility.services,
        products: fallbackHomeVisibility.products,
        pricing: fallbackHomeVisibility.pricing,
        training: fallbackHomeVisibility.training,
        departments: fallbackHomeVisibility.departments,
        testimonials: fallbackHomeVisibility.testimonials,
        "who-we-serve": fallbackHomeVisibility["who-we-serve"],
        "why-choose": fallbackHomeVisibility["why-choose"],
        cta: fallbackHomeVisibility.cta,
      },
    )

    const navItemsGroup = parseNavItemsGroup(settings.navItems, settings.siteTitle ?? defaultSettings.siteTitle)

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
      footerSecondaryNavItems: navItemsGroup.footerMeta.secondary,
      footerQuickLinksTitle: navItemsGroup.footerMeta.quickLinksTitle,
      footerSecondaryTitle: navItemsGroup.footerMeta.secondaryTitle,
      footerContactTitle: navItemsGroup.footerMeta.contactTitle,
      footerShowSecondaryColumn: navItemsGroup.footerMeta.showSecondary,
      footerShowContactColumn: navItemsGroup.footerMeta.showContact,
      footerShowCompanyInfo: navItemsGroup.footerMeta.showCompany,
      footerCompanyName: navItemsGroup.footerMeta.companyName,
      footerCompanyDescription: navItemsGroup.footerMeta.companyDescription,
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
      headingTypography: parseHeadingTypography(settings.staticSeo),
      contactEmail: settings.contactEmail ?? defaultSettings.contactEmail,
      contactPhone: settings.contactPhone ?? defaultSettings.contactPhone,
      contactAddress: settings.contactAddress ?? defaultSettings.contactAddress,
    }
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      console.error("Site settings DB connection error, using defaults:", error)
      return defaultSettings
    }
    console.error("Failed to load site settings, using defaults:", error)
    return defaultSettings
  }
}
