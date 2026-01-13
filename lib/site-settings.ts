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
  layoutMode: "full" | "container"
  layoutWidth: number
  logoWidth: number
  logoHeight: number
  logoRadius: number
  showLoginLink: boolean
  contactEmail: string | null
  contactPhone: string | null
  contactAddress: string | null
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

const defaultSettings: SiteSettings = {
  siteTitle: "ABSON Solutions",
  logoUrl: "/uploads/default-logo.png",
  faviconUrl: "/icon-light-32x32.png",
  navAlignment: "left",
  navLoginText: "Login",
  navCtaText: "Get Started",
  navCtaHref: "/contact",
  navCtaEnabled: true,
  heroSlides: [
    {
      title: "School & Madaris Management",
      subtitle: "Digital admissions, attendance, fee and exam workflows built for schools and madaris in Pakistan.",
      ctaText: "See Education Solutions",
      ctaHref: "/services",
      image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=80",
      layout: "image-left",
      bgColor: "#0f172a",
    },
    {
      title: "Certified Vibration Training",
      subtitle: "Mobius Institute-aligned vibration analysis courses with local delivery and global credentials.",
      ctaText: "View Training Tracks",
      ctaHref: "/training",
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1600&q=80",
      layout: "image-right",
      bgColor: "#0b132b",
    },
    {
      title: "Partner With ABSON",
      subtitle: "From custom software to general order supplies, we deliver reliable outcomes for growing organizations.",
      ctaText: "Talk to Us",
      ctaHref: "/contact",
      image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1600&q=80",
      layout: "full",
      bgColor: "#111827",
    },
  ],
  heroMode: "static",
  heroStaticIndex: 0,
  heroAutoplaySeconds: 6,
  layoutMode: "container",
  layoutWidth: 90,
  logoWidth: 40,
  logoHeight: 40,
  logoRadius: 8,
  showLoginLink: true,
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

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: "site" } })
    if (!settings) return defaultSettings

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
      layoutMode: (settings.layoutMode as "full" | "container") ?? defaultSettings.layoutMode,
      layoutWidth: settings.layoutWidth ?? defaultSettings.layoutWidth,
      logoWidth: settings.logoWidth ?? defaultSettings.logoWidth,
      logoHeight: settings.logoHeight ?? defaultSettings.logoHeight,
      logoRadius: settings.logoRadius ?? defaultSettings.logoRadius,
      showLoginLink: settings.showLoginLink ?? defaultSettings.showLoginLink,
      contactEmail: settings.contactEmail ?? defaultSettings.contactEmail,
      contactPhone: settings.contactPhone ?? defaultSettings.contactPhone,
      contactAddress: settings.contactAddress ?? defaultSettings.contactAddress,
    }
  } catch (error) {
    console.error("Failed to load site settings, using defaults:", error)
    return defaultSettings
  }
}
