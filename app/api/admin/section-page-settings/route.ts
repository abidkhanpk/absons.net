import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

const ALLOWED_SECTIONS = ["services", "training", "products", "departments", "pricing", "blog"] as const
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

    const nextSection = {
      beforeListContent: typeof body.beforeListContent === "string" ? body.beforeListContent : "",
      afterListContent: typeof body.afterListContent === "string" ? body.afterListContent : "",
    }

    await prisma.sectionPageSetting.upsert({
      where: { sectionKey: section },
      create: {
        sectionKey: section,
        beforeListContent: nextSection.beforeListContent,
        afterListContent: nextSection.afterListContent,
      },
      update: {
        beforeListContent: nextSection.beforeListContent,
        afterListContent: nextSection.afterListContent,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating section page settings:", error)
    return NextResponse.json({ error: "Failed to update section page settings" }, { status: 500 })
  }
}
