import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { withRls, prisma } from "@/lib/prisma"
import { normalizeAssetDbValue } from "@/lib/asset-key"

async function requireAdmin() {
  const session = await getSession()
  if (!session) return { session: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return { session, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) }
  }
  return { session, user, error: null }
}

export async function POST(request: Request) {
  const { session, error } = await requireAdmin()
  if (error) return error

  try {
    const body = await request.json()
    const { client_name, client_company, client_position, content, rating, avatar_url, display_order, submitter_email, is_published } = body
    const normalizedAvatarUrl = normalizeAssetDbValue(avatar_url)
    if (!client_name || !content || !rating) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await withRls(session!.userId, (tx) =>
      tx.testimonial.create({
        data: {
          clientName: client_name,
          clientCompany: client_company,
          clientPosition: client_position,
          content,
          rating: Number(rating),
          avatarUrl: typeof normalizedAvatarUrl === "string" && normalizedAvatarUrl ? normalizedAvatarUrl : null,
          isFeatured: false,
          displayOrder: Number(display_order) || 0,
          submitterEmail: submitter_email || null,
          isPublished: typeof is_published === "boolean" ? is_published : true,
        },
      }),
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Create testimonial error:", err)
    return NextResponse.json({ error: "Failed to create testimonial" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const { session, error } = await requireAdmin()
  if (error) return error

  try {
    const body = await request.json()
    const { id, client_name, client_company, client_position, content, rating, avatar_url, display_order, submitter_email, is_published } =
      body
    const normalizedAvatarUrl = normalizeAssetDbValue(avatar_url)
    if (!id) return NextResponse.json({ error: "Testimonial id is required" }, { status: 400 })

    await withRls(session!.userId, (tx) =>
      tx.testimonial.update({
        where: { id },
        data: {
          clientName: client_name,
          clientCompany: client_company,
          clientPosition: client_position,
          content,
          rating: Number(rating),
          avatarUrl: typeof normalizedAvatarUrl === "string" && normalizedAvatarUrl ? normalizedAvatarUrl : null,
          isFeatured: false,
          displayOrder: Number(display_order) || 0,
          submitterEmail: submitter_email || null,
          isPublished: typeof is_published === "boolean" ? is_published : true,
        },
      }),
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Update testimonial error:", err)
    return NextResponse.json({ error: "Failed to update testimonial" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const { session, error } = await requireAdmin()
  if (error) return error

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "Testimonial id is required" }, { status: 400 })

    await withRls(session!.userId, (tx) => tx.testimonial.delete({ where: { id } }))
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Delete testimonial error:", err)
    return NextResponse.json({ error: "Failed to delete testimonial" }, { status: 500 })
  }
}

function parseHomeSections(raw: unknown): Array<Record<string, unknown>> {
  if (Array.isArray(raw)) {
    return raw.filter((entry): entry is Record<string, unknown> => Boolean(entry) && typeof entry === "object")
  }
  if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed.filter((entry): entry is Record<string, unknown> => Boolean(entry) && typeof entry === "object")
      }
    } catch {
      return []
    }
  }
  return []
}

export async function PATCH(request: Request) {
  const { session, user, error } = await requireAdmin()
  if (error) return error

  try {
    const body = await request.json()
    const orderedIds = Array.isArray(body?.orderedIds) ? body.orderedIds : null
    const hasHomeLimit = typeof body?.homeTestimonialLimit !== "undefined"
    const parsedHomeLimit = Number(body?.homeTestimonialLimit)
    const homeTestimonialLimit =
      hasHomeLimit && Number.isFinite(parsedHomeLimit) && parsedHomeLimit >= 0 ? Math.floor(parsedHomeLimit) : null

    let didUpdate = false

    if (orderedIds) {
      const normalizedIds = orderedIds.filter((id): id is string => typeof id === "string" && id.trim().length > 0)
      if (!normalizedIds.length) {
        return NextResponse.json({ error: "orderedIds must include at least one testimonial id" }, { status: 400 })
      }
      await withRls(session!.userId, async (tx) => {
        await Promise.all(
          normalizedIds.map((id, index) =>
            tx.testimonial.update({
              where: { id },
              data: { displayOrder: index + 1 },
            }),
          ),
        )
      })
      didUpdate = true
    }

    if (hasHomeLimit) {
      if (user?.role !== "super_admin") {
        return NextResponse.json(
          { error: "Only super admins can update home testimonial display count" },
          { status: 403 },
        )
      }
      if (homeTestimonialLimit === null) {
        return NextResponse.json(
          { error: "homeTestimonialLimit must be a number greater than or equal to 0" },
          { status: 400 },
        )
      }
      await withRls(session!.userId, async (tx) => {
        const settings = await tx.siteSettings.findUnique({
          where: { id: "site" },
          select: { homeSections: true },
        })
        if (!settings) return
        const sections = parseHomeSections(settings.homeSections)
        const nextSections = [...sections]
        const existingIndex = nextSections.findIndex((entry) => entry.id === "testimonials")
        if (existingIndex >= 0) {
          nextSections[existingIndex] = {
            ...nextSections[existingIndex],
            homeTestimonialLimit,
          }
        } else {
          nextSections.push({
            id: "testimonials",
            enabled: true,
            title: "What Our Clients Say",
            subtitle: "Trusted by institutions and organizations across the region",
            itemsLayout: "scroll",
            mobileLayout: "match",
            scrollSpeed: 30,
            pauseOnHover: true,
            dragEnabled: true,
            homeTestimonialLimit,
          })
        }
        await tx.siteSettings.update({
          where: { id: "site" },
          data: {
            homeSections: nextSections,
            updatedAt: new Date(),
          },
        })
      })
      didUpdate = true
    }

    if (!didUpdate) {
      return NextResponse.json({ error: "No valid update payload provided" }, { status: 400 })
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Patch testimonial settings/order error:", err)
    return NextResponse.json({ error: "Failed to update testimonial configuration" }, { status: 500 })
  }
}
