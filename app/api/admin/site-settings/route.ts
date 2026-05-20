import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { normalizeAssetDbValue } from "@/lib/asset-key"
import { normalizeHeadingTypography } from "@/lib/heading-typography"

function normalizeWhyChooseItems(raw: unknown) {
  if (!Array.isArray(raw)) return undefined
  const allowedIcons = new Set(["check", "award", "book", "star", "shield", "bolt", "heart", "users", "globe", "sparkles"])
  const normalized = raw
    .filter((entry): entry is Record<string, unknown> => Boolean(entry) && typeof entry === "object")
    .map((entry) => ({
      title: typeof entry.title === "string" ? entry.title.trim() : "",
      description: typeof entry.description === "string" ? entry.description.trim() : "",
      icon: typeof entry.icon === "string" && allowedIcons.has(entry.icon) ? entry.icon : "check",
    }))
    .filter((entry) => entry.title && entry.description)
  return normalized
}

function normalizeHomeSections(raw: unknown) {
  if (!Array.isArray(raw)) return undefined
  const allowed = new Set([
    "services",
    "products",
    "pricing",
    "training",
    "departments",
    "testimonials",
    "who-we-serve",
    "why-choose",
    "cta",
  ])
  const seen = new Set<string>()
  return raw
    .filter((entry): entry is Record<string, unknown> => Boolean(entry) && typeof entry === "object")
    .map((entry) => {
      const id = typeof entry.id === "string" ? entry.id.trim() : ""
      if (!id || !allowed.has(id) || seen.has(id)) return null
      seen.add(id)
      return {
        ...entry,
        id,
      }
    })
    .filter((entry): entry is Record<string, unknown> => Boolean(entry))
}

function normalizeHeroSlides(raw: unknown): { serialized?: string; wasExplicitlyEmpty: boolean } {
  if (typeof raw === "undefined") return { serialized: undefined, wasExplicitlyEmpty: false }

  let parsed: unknown = raw
  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw)
    } catch {
      return { serialized: undefined, wasExplicitlyEmpty: false }
    }
  }

  if (!Array.isArray(parsed)) return { serialized: undefined, wasExplicitlyEmpty: false }
  if (parsed.length === 0) return { serialized: undefined, wasExplicitlyEmpty: true }

  const normalized = parsed
    .filter((slide): slide is Record<string, unknown> => Boolean(slide) && typeof slide === "object")
    .map((slide) => {
      const rawImage = typeof slide.image === "string" ? slide.image : ""
      const image = normalizeAssetDbValue(rawImage)
      return {
        title: typeof slide.title === "string" ? slide.title : "",
        subtitle: typeof slide.subtitle === "string" ? slide.subtitle : "",
        ctaText: typeof slide.ctaText === "string" ? slide.ctaText : "",
        ctaHref: typeof slide.ctaHref === "string" ? slide.ctaHref : "",
        image: typeof image === "string" ? image : "",
        layout: typeof slide.layout === "string" ? slide.layout : "full",
        bgColor: typeof slide.bgColor === "string" ? slide.bgColor : "",
      }
    })

  return normalized.length > 0 ? { serialized: JSON.stringify(normalized), wasExplicitlyEmpty: false } : { serialized: undefined, wasExplicitlyEmpty: true }
}

function normalizeStaticSeo(raw: unknown, headingTypographyRaw: unknown) {
  if ((!raw || typeof raw !== "object" || Array.isArray(raw)) && typeof headingTypographyRaw === "undefined") {
    return undefined
  }
  const allowedKeys = ["home", "about", "services", "training", "contact", "blog"] as const
  const parsedRaw = raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {}
  const normalized: Record<string, unknown> = {}
  for (const key of allowedKeys) {
    const entry = parsedRaw[key]
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) continue
    const ogImage = normalizeAssetDbValue(
      typeof (entry as Record<string, unknown>).ogImage === "string" ? ((entry as Record<string, unknown>).ogImage as string) : "",
    )
    normalized[key] = {
      ...entry,
      ogImage: typeof ogImage === "string" ? ogImage : "",
    }
  }
  const headingSource =
    typeof headingTypographyRaw !== "undefined" ? headingTypographyRaw : (parsedRaw as Record<string, unknown>).typography
  if (typeof headingSource !== "undefined") {
    normalized.typography = normalizeHeadingTypography(headingSource)
  }
  return Object.keys(normalized).length > 0 ? normalized : undefined
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const {
      siteTitle,
      logoUrl,
      faviconUrl,
      contactEmail,
      contactPhone,
      contactAddress,
      navAlignment,
      navLoginText,
      navCtaText,
      navCtaHref,
      navCtaEnabled,
      navItems,
      footerNavItems,
      layoutMode,
      layoutWidth,
      heroSlides,
      heroMode,
      heroStaticIndex,
      heroAutoplaySeconds,
      heroHeight,
      businessHours,
      businessDays,
      businessHoursSchedule,
      businessHoursMode,
      showBusinessHours,
      logoWidth,
      logoHeight,
      logoRadius,
      showLoginLink,
      showServices,
      showTraining,
      showTestimonials,
      homeSections,
      editorApprovalRequired,
      whyChooseTitle,
      whyChooseSubtitle,
      whyChooseItems,
      whyChooseLayout,
      whyChooseMobileLayout,
      whyChooseScrollSpeed,
      analyticsScript,
      headerCode,
      footerCode,
      allowIndexing,
      seoTitleTemplate,
      seoDefaultTitle,
      seoDefaultDescription,
      seoDefaultKeywords,
      seoDefaultOgImage,
      seoDefaultCanonicalBase,
      staticSeo,
      headingTypography,
    } = body

    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const requester = await prisma.user.findUnique({ where: { id: session.userId } })
    if (requester?.role !== "super_admin") {
      return NextResponse.json({ error: "Only super admins can update settings" }, { status: 403 })
    }

    const normalizedHeroSlides = normalizeHeroSlides(heroSlides)
    const normalizedLogoUrl = normalizeAssetDbValue(logoUrl)
    const normalizedFaviconUrl = normalizeAssetDbValue(faviconUrl)
    const normalizedSeoDefaultOgImage = normalizeAssetDbValue(seoDefaultOgImage)
    const normalizedStaticSeo = normalizeStaticSeo(staticSeo, headingTypography)

    const normalizedBusinessHoursSchedule =
      typeof businessHoursSchedule === "string"
        ? businessHoursSchedule
        : Array.isArray(businessHoursSchedule)
          ? JSON.stringify(businessHoursSchedule)
          : undefined

    await prisma.siteSettings.update({
      where: { id: "site" },
      data: {
        siteTitle,
        logoUrl: typeof normalizedLogoUrl === "undefined" ? undefined : normalizedLogoUrl,
        faviconUrl: typeof normalizedFaviconUrl === "undefined" ? undefined : normalizedFaviconUrl,
        contactEmail,
        contactPhone,
        contactAddress,
        navAlignment,
        navLoginText,
        navCtaText,
        navCtaHref,
        navCtaEnabled,
        navItems:
          Array.isArray(navItems) && Array.isArray(footerNavItems)
            ? { main: navItems, footer: footerNavItems }
            : Array.isArray(navItems)
              ? navItems
              : typeof navItems === "object" && navItems !== null
                ? navItems
                : undefined,
        layoutMode,
        layoutWidth,
        heroSlides: normalizedHeroSlides.serialized,
        heroMode,
        heroStaticIndex,
        heroAutoplaySeconds,
        heroHeight,
        businessHours,
        businessDays,
        businessHoursSchedule: normalizedBusinessHoursSchedule,
        businessHoursMode,
        showBusinessHours,
        logoWidth,
        logoHeight,
        logoRadius,
        showLoginLink,
        showServices,
        showTraining,
        showTestimonials,
        homeSections: normalizeHomeSections(homeSections),
        editorApprovalRequired,
        whyChooseTitle,
        whyChooseSubtitle,
        whyChooseItems: normalizeWhyChooseItems(whyChooseItems),
        whyChooseLayout,
        whyChooseMobileLayout,
        whyChooseScrollSpeed,
        analyticsScript,
        headerCode,
        footerCode,
        allowIndexing,
        seoTitleTemplate,
        seoDefaultTitle,
        seoDefaultDescription,
        seoDefaultKeywords,
        seoDefaultOgImage: typeof normalizedSeoDefaultOgImage === "undefined" ? undefined : normalizedSeoDefaultOgImage,
        seoDefaultCanonicalBase,
        staticSeo: normalizedStaticSeo ?? (staticSeo ? staticSeo : undefined),
      },
    })

    if (normalizedHeroSlides.wasExplicitlyEmpty) {
      console.warn("Ignored empty heroSlides payload to prevent accidental overwrite.")
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating site settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
