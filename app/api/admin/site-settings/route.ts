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

function normalizeFooterMeta(raw: unknown) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined
  const base = raw as Record<string, unknown>
  const quickLinksTitle =
    typeof base.quickLinksTitle === "string" && base.quickLinksTitle.trim() ? base.quickLinksTitle.trim() : "Quick Links"
  const secondaryTitle =
    typeof base.secondaryTitle === "string" && base.secondaryTitle.trim() ? base.secondaryTitle.trim() : "Services"
  const contactTitle =
    typeof base.contactTitle === "string" && base.contactTitle.trim() ? base.contactTitle.trim() : "Contact Info"
  const showSecondary = typeof base.showSecondary === "boolean" ? base.showSecondary : true
  const showContact = typeof base.showContact === "boolean" ? base.showContact : true
  const showCompany = typeof base.showCompany === "boolean" ? base.showCompany : true
  const companyName = typeof base.companyName === "string" ? base.companyName.trim() : ""
  const companyDescription =
    typeof base.companyDescription === "string" && base.companyDescription.trim()
      ? base.companyDescription.trim()
      : "Professional software solutions and training services for educational institutions and organizations."
  const companyTagline = typeof base.companyTagline === "string" ? base.companyTagline.trim() : ""
  const showHeaderTagline = typeof base.showHeaderTagline === "boolean" ? base.showHeaderTagline : true
  const showFooterTagline = typeof base.showFooterTagline === "boolean" ? base.showFooterTagline : true
  const secondary =
    Array.isArray(base.secondary)
      ? base.secondary
          .filter((entry): entry is Record<string, unknown> => Boolean(entry) && typeof entry === "object")
          .map((entry, idx) => ({
            id:
              typeof entry.id === "string" && entry.id.trim()
                ? entry.id.trim()
                : `footer-secondary-${idx + 1}`,
            label: typeof entry.label === "string" ? entry.label.trim() : "",
            href: typeof entry.href === "string" ? entry.href.trim() : "",
            enabled: typeof entry.enabled === "boolean" ? entry.enabled : true,
          }))
          .filter((entry) => entry.label && entry.href)
      : []

  return {
    quickLinksTitle,
    secondaryTitle,
    contactTitle,
    showSecondary,
    showContact,
    showCompany,
    companyName,
    companyDescription,
    companyTagline,
    showHeaderTagline,
    showFooterTagline,
    secondary,
  }
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
      footerMeta,
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
      expectedUpdatedAt,
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

    const expectedUpdatedAtDate =
      typeof expectedUpdatedAt === "string" && expectedUpdatedAt.trim() ? new Date(expectedUpdatedAt) : null
    if (typeof heroSlides !== "undefined" && !expectedUpdatedAtDate) {
      return NextResponse.json(
        { error: "Missing settings version token. Reload settings page and try again." },
        { status: 400 },
      )
    }
    if (expectedUpdatedAtDate && Number.isNaN(expectedUpdatedAtDate.getTime())) {
      return NextResponse.json({ error: "Invalid settings version token" }, { status: 400 })
    }

    const existingSettings = await prisma.siteSettings.findUnique({
      where: { id: "site" },
      select: { updatedAt: true, navItems: true },
    })
    if (!existingSettings) {
      return NextResponse.json({ error: "Site settings not found" }, { status: 404 })
    }

    if (expectedUpdatedAtDate && existingSettings.updatedAt.getTime() !== expectedUpdatedAtDate.getTime()) {
      return NextResponse.json(
        {
          error: "Settings were changed in another session. Reload this page before saving.",
          latestUpdatedAt: existingSettings.updatedAt.toISOString(),
        },
        { status: 409 },
      )
    }

    const normalizedFooterMetaFromPayload = normalizeFooterMeta(
      typeof footerMeta === "undefined" && navItems && typeof navItems === "object" && !Array.isArray(navItems)
        ? (navItems as Record<string, unknown>).footerMeta
        : footerMeta,
    )
    const normalizedFooterMetaFromExisting = normalizeFooterMeta(
      existingSettings.navItems && typeof existingSettings.navItems === "object" && !Array.isArray(existingSettings.navItems)
        ? (existingSettings.navItems as Record<string, unknown>).footerMeta
        : undefined,
    )
    const normalizedFooterMeta = normalizedFooterMetaFromPayload ?? normalizedFooterMetaFromExisting

    const updateData = {
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
          ? normalizedFooterMeta
            ? { main: navItems, footer: footerNavItems, footerMeta: normalizedFooterMeta }
            : { main: navItems, footer: footerNavItems }
          : Array.isArray(navItems)
            ? navItems
            : typeof navItems === "object" && navItems !== null
              ? normalizedFooterMeta
                ? { ...(navItems as Record<string, unknown>), footerMeta: normalizedFooterMeta }
                : navItems
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
      updatedAt: new Date(),
    }

    if (expectedUpdatedAtDate) {
      const updateResult = await prisma.siteSettings.updateMany({
        where: { id: "site", updatedAt: existingSettings.updatedAt },
        data: updateData,
      })
      if (updateResult.count === 0) {
        const latest = await prisma.siteSettings.findUnique({
          where: { id: "site" },
          select: { updatedAt: true },
        })
        return NextResponse.json(
          {
            error: "Settings were changed in another session. Reload this page before saving.",
            latestUpdatedAt: latest?.updatedAt.toISOString() ?? existingSettings.updatedAt.toISOString(),
          },
          { status: 409 },
        )
      }
    } else {
      await prisma.siteSettings.update({
        where: { id: "site" },
        data: updateData,
      })
    }

    const updatedSettings = await prisma.siteSettings.findUnique({
      where: { id: "site" },
      select: { updatedAt: true },
    })
    if (!updatedSettings) {
      return NextResponse.json({ error: "Site settings not found" }, { status: 404 })
    }

    if (normalizedHeroSlides.wasExplicitlyEmpty) {
      console.warn("Ignored empty heroSlides payload to prevent accidental overwrite.")
    }

    return NextResponse.json({ success: true, updatedAt: updatedSettings.updatedAt.toISOString() })
  } catch (error) {
    console.error("Error updating site settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
