import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

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
    } = body

    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const requester = await prisma.user.findUnique({ where: { id: session.userId } })
    if (requester?.role !== "super_admin") {
      return NextResponse.json({ error: "Only super admins can update settings" }, { status: 403 })
    }

    await prisma.siteSettings.update({
      where: { id: "site" },
      data: {
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
        heroSlides: typeof heroSlides === "string" ? heroSlides : JSON.stringify(heroSlides ?? []),
        heroMode,
        heroStaticIndex,
        heroAutoplaySeconds,
        heroHeight,
        businessHours,
        businessDays,
        businessHoursSchedule:
          typeof businessHoursSchedule === "string" ? businessHoursSchedule : JSON.stringify(businessHoursSchedule ?? []),
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
        seoDefaultOgImage,
        seoDefaultCanonicalBase,
        staticSeo: staticSeo ? staticSeo : undefined,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating site settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
