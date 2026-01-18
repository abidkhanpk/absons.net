import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

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
      whyChooseScrollSpeed,
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
        homeSections: Array.isArray(homeSections) ? homeSections : undefined,
        editorApprovalRequired,
        whyChooseTitle,
        whyChooseSubtitle,
        whyChooseItems: Array.isArray(whyChooseItems) ? whyChooseItems : undefined,
        whyChooseLayout,
        whyChooseScrollSpeed,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating site settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
