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
    const { title, slug, excerpt, content, featured_image, published } = body
    if (!title || !slug || !excerpt || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await withRls(session!.userId, (tx) =>
      tx.blogPost.create({
        data: {
          title,
          slug,
          excerpt,
          content,
          featuredImage: featured_image,
          published: Boolean(published),
          publishedAt: published ? new Date() : null,
          authorId: session!.userId,
        },
      }),
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Create blog error:", err)
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const { session, error } = await requireAdmin()
  if (error) return error

  try {
    const body = await request.json()
    const { id, title, slug, excerpt, content, featured_image, published } = body
    if (!id) return NextResponse.json({ error: "Post id is required" }, { status: 400 })

    await withRls(session!.userId, (tx) =>
      tx.blogPost.update({
        where: { id },
        data: {
          title,
          slug,
          excerpt,
          content,
          featuredImage: featured_image,
          published: Boolean(published),
          publishedAt: published ? new Date() : null,
        },
      }),
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Update blog error:", err)
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const { session, error } = await requireAdmin()
  if (error) return error

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "Post id is required" }, { status: 400 })

    await withRls(session!.userId, (tx) => tx.blogPost.delete({ where: { id } }))
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Delete blog error:", err)
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 })
  }
}
