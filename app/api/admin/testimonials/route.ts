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
    const { client_name, client_company, client_position, content, rating, avatar_url, is_featured, display_order } = body
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
          avatarUrl: avatar_url,
          isFeatured: Boolean(is_featured),
          displayOrder: Number(display_order) || 0,
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
    const { id, client_name, client_company, client_position, content, rating, avatar_url, is_featured, display_order } =
      body
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
          avatarUrl: avatar_url,
          isFeatured: Boolean(is_featured),
          displayOrder: Number(display_order) || 0,
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
