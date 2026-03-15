import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { withRls, prisma } from "@/lib/prisma"

async function requireAdmin() {
  const session = await getSession()
  if (!session) return { session: null, user: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return { session, user, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) }
  }
  return { session, user, error: null }
}

export async function POST(request: Request) {
  const { session, error } = await requireAdmin()
  if (error) return error

  try {
    const body = await request.json()
    const { title, description, icon, image_url, link_url, link_label, category, is_featured, display_order } = body
    if (!title || !description || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await withRls(session!.userId, (tx) =>
      tx.service.create({
        data: {
          title,
          description,
          icon,
          imageUrl: image_url || null,
          linkUrl: link_url || null,
          linkLabel: link_label || null,
          category,
          isFeatured: Boolean(is_featured),
          displayOrder: Number(display_order) || 0,
        },
      }),
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Create service error:", err)
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const { session, error } = await requireAdmin()
  if (error) return error

  try {
    const body = await request.json()
    const { id, title, description, icon, image_url, link_url, link_label, category, is_featured, display_order } = body
    if (!id) return NextResponse.json({ error: "Service id is required" }, { status: 400 })

    await withRls(session!.userId, (tx) =>
      tx.service.update({
        where: { id },
        data: {
          title,
          description,
          icon,
          imageUrl: image_url || null,
          linkUrl: link_url || null,
          linkLabel: link_label || null,
          category,
          isFeatured: Boolean(is_featured),
          displayOrder: Number(display_order) || 0,
        },
      }),
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Update service error:", err)
    return NextResponse.json({ error: "Failed to update service" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const { session, error } = await requireAdmin()
  if (error) return error

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "Service id is required" }, { status: 400 })

    await withRls(session!.userId, (tx) => tx.service.delete({ where: { id } }))
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Delete service error:", err)
    return NextResponse.json({ error: "Failed to delete service" }, { status: 500 })
  }
}
