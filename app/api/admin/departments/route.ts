import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { withRls, prisma } from "@/lib/prisma"

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
    const { title, description, icon, image_url, link_url, link_label, is_featured, is_active, display_order } = body

    if (!title || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await withRls(session!.userId, (tx) =>
      tx.department.create({
        data: {
          title,
          description,
          icon,
          imageUrl: image_url || null,
          linkUrl: link_url || null,
          linkLabel: link_label || null,
          isFeatured: is_featured ?? false,
          isActive: is_active ?? true,
          displayOrder: Number(display_order) || 0,
        },
      }),
    )
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Create department error:", err)
    return NextResponse.json({ error: "Failed to create department" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const { session, error } = await requireAdmin()
  if (error) return error

  try {
    const body = await request.json()
    const { id, title, description, icon, image_url, link_url, link_label, is_featured, is_active, display_order } = body

    if (!id) return NextResponse.json({ error: "Department id is required" }, { status: 400 })

    await withRls(session!.userId, (tx) =>
      tx.department.update({
        where: { id },
        data: {
          title,
          description,
          icon,
          imageUrl: image_url || null,
          linkUrl: link_url || null,
          linkLabel: link_label || null,
          isFeatured: is_featured ?? false,
          isActive: is_active ?? true,
          displayOrder: Number(display_order) || 0,
        },
      }),
    )
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Update department error:", err)
    return NextResponse.json({ error: "Failed to update department" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const { session, error } = await requireAdmin()
  if (error) return error

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "Department id is required" }, { status: 400 })

    await withRls(session!.userId, (tx) => tx.department.delete({ where: { id } }))
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Delete department error:", err)
    return NextResponse.json({ error: "Failed to delete department" }, { status: 500 })
  }
}
