import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { normalizeAssetDbValue } from "@/lib/asset-key"

const ALLOWED_SECTIONS = ["services", "training", "products", "departments", "pricing"] as const
type AllowedSection = (typeof ALLOWED_SECTIONS)[number]

function isAllowedSection(section: string): section is AllowedSection {
  return ALLOWED_SECTIONS.includes(section as AllowedSection)
}

export async function PUT(request: Request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const requester = await prisma.user.findUnique({ where: { id: session.userId }, select: { role: true } })
    if (!requester || (requester.role !== "admin" && requester.role !== "super_admin")) {
      return NextResponse.json({ error: "Only admins can update section page settings" }, { status: 403 })
    }

    const body = await request.json()
    const section = typeof body.section === "string" ? body.section.trim() : ""
    if (!isAllowedSection(section)) {
      return NextResponse.json({ error: "Invalid section key" }, { status: 400 })
    }

    const settings = await prisma.siteSettings.findUnique({
      where: { id: "site" },
      select: { staticSeo: true },
    })
    if (!settings) return NextResponse.json({ error: "Site settings not found" }, { status: 404 })

    const current = settings.staticSeo && typeof settings.staticSeo === "object" && !Array.isArray(settings.staticSeo)
      ? (settings.staticSeo as Record<string, unknown>)
      : {}

    const currentSection =
      current[section] && typeof current[section] === "object" && !Array.isArray(current[section])
        ? (current[section] as Record<string, unknown>)
        : {}

    const normalizedOgImage = normalizeAssetDbValue(typeof body.ogImage === "string" ? body.ogImage : "")

    const nextSection = {
      ...currentSection,
      title: typeof body.title === "string" ? body.title : "",
      description: typeof body.description === "string" ? body.description : "",
      keywords: typeof body.keywords === "string" ? body.keywords : "",
      ogImage: typeof normalizedOgImage === "string" ? normalizedOgImage : "",
      canonical: typeof body.canonical === "string" ? body.canonical : "",
      noIndex: Boolean(body.noIndex),
      noFollow: Boolean(body.noFollow),
      beforeListContent: typeof body.beforeListContent === "string" ? body.beforeListContent : "",
      afterListContent: typeof body.afterListContent === "string" ? body.afterListContent : "",
    }

    const nextStaticSeo = {
      ...current,
      [section]: nextSection,
    }

    await prisma.siteSettings.update({
      where: { id: "site" },
      data: {
        staticSeo: nextStaticSeo,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating section page settings:", error)
    return NextResponse.json({ error: "Failed to update section page settings" }, { status: 500 })
  }
}
