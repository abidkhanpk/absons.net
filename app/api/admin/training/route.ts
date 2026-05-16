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
  return { session, error: null }
}

export async function POST(request: Request) {
  const { session, error } = await requireAdmin()
  if (error) return error

  try {
    const body = await request.json()
    const { title, description, duration, level, provider, featured_image, link_url, link_label, is_active, display_order } =
      body
    const normalizedFeaturedImage = normalizeAssetDbValue(featured_image)
    if (!title || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await withRls(session!.userId, (tx) =>
      tx.trainingCourse.create({
        data: {
          title,
          description,
          duration,
          level,
          provider,
          featuredImage: typeof normalizedFeaturedImage === "undefined" ? undefined : normalizedFeaturedImage,
          linkUrl: link_url || null,
          linkLabel: link_label || null,
          isActive: is_active ?? true,
          displayOrder: Number(display_order) || 0,
        },
      }),
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Create training error:", err)
    return NextResponse.json({ error: "Failed to create training course" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const { session, error } = await requireAdmin()
  if (error) return error

  try {
    const body = await request.json()
    const { id, title, description, duration, level, provider, featured_image, link_url, link_label, is_active, display_order } =
      body
    const normalizedFeaturedImage = normalizeAssetDbValue(featured_image)
    if (!id) return NextResponse.json({ error: "Course id is required" }, { status: 400 })

    await withRls(session!.userId, (tx) =>
      tx.trainingCourse.update({
        where: { id },
        data: {
          title,
          description,
          duration,
          level,
          provider,
          featuredImage: typeof normalizedFeaturedImage === "undefined" ? undefined : normalizedFeaturedImage,
          linkUrl: link_url || null,
          linkLabel: link_label || null,
          isActive: is_active ?? true,
          displayOrder: Number(display_order) || 0,
        },
      }),
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Update training error:", err)
    return NextResponse.json({ error: "Failed to update training course" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const { session, error } = await requireAdmin()
  if (error) return error

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "Course id is required" }, { status: 400 })

    await withRls(session!.userId, (tx) => tx.trainingCourse.delete({ where: { id } }))
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Delete training error:", err)
    return NextResponse.json({ error: "Failed to delete training course" }, { status: 500 })
  }
}
