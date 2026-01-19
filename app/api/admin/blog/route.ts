import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { withRls, prisma } from "@/lib/prisma"

async function requireEditorAccess() {
  const session = await getSession()
  if (!session) return { session: null, user: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!user || (user.role !== "admin" && user.role !== "super_admin" && user.role !== "editor")) {
    return { session, user: null, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) }
  }
  return { session, user, error: null }
}

async function isEditorApprovalRequired() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "site" }, select: { editorApprovalRequired: true } })
  return settings?.editorApprovalRequired ?? true
}

export async function POST(request: Request) {
  const { session, user, error } = await requireEditorAccess()
  if (error) return error

  try {
    const body = await request.json()
    const {
      title,
      slug,
      excerpt,
      content,
      featured_image,
      published,
      approved,
      seoTitle,
      seoDescription,
      seoKeywords,
      seoOgImage,
      seoCanonicalUrl,
      seoNoIndex,
      seoNoFollow,
    } = body
    if (!title || !slug || !excerpt || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const approvalRequired = await isEditorApprovalRequired()
    const isEditor = user?.role === "editor"
    const resolvedApproved = isEditor ? !approvalRequired : typeof approved === "boolean" ? approved : true
    const resolvedApprovedAt = resolvedApproved ? new Date() : null

    await withRls(session!.userId, (tx) =>
      tx.blogPost.create({
        data: {
          title,
          slug,
          excerpt,
          content,
          featuredImage: featured_image,
          seoTitle,
          seoDescription,
          seoKeywords,
          seoOgImage,
          seoCanonicalUrl,
          seoNoIndex: Boolean(seoNoIndex),
          seoNoFollow: Boolean(seoNoFollow),
          published: Boolean(published),
          publishedAt: published ? new Date() : null,
          approved: resolvedApproved,
          approvedAt: resolvedApprovedAt,
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
  const { session, user, error } = await requireEditorAccess()
  if (error) return error

  try {
    const body = await request.json()
    const {
      id,
      title,
      slug,
      excerpt,
      content,
      featured_image,
      published,
      approved,
      seoTitle,
      seoDescription,
      seoKeywords,
      seoOgImage,
      seoCanonicalUrl,
      seoNoIndex,
      seoNoFollow,
    } = body
    if (!id) return NextResponse.json({ error: "Post id is required" }, { status: 400 })

    const approvalRequired = await isEditorApprovalRequired()
    const isEditor = user?.role === "editor"

    if (isEditor) {
      const existing = await withRls(session!.userId, (tx) =>
        tx.blogPost.findUnique({ where: { id }, select: { authorId: true, publishedAt: true } }),
      )
      if (!existing || existing.authorId !== session!.userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    const approvalUpdate = isEditor
      ? {
          approved: !approvalRequired,
          approvedAt: !approvalRequired ? new Date() : null,
        }
      : typeof approved === "boolean"
        ? {
            approved,
            approvedAt: approved ? new Date() : null,
          }
        : {}
    const resolvedPublishedAt = published ? new Date() : null

    await withRls(session!.userId, (tx) =>
      tx.blogPost.update({
        where: { id },
        data: {
          title,
          slug,
          excerpt,
          content,
          featuredImage: featured_image,
          seoTitle,
          seoDescription,
          seoKeywords,
          seoOgImage,
          seoCanonicalUrl,
          seoNoIndex: Boolean(seoNoIndex),
          seoNoFollow: Boolean(seoNoFollow),
          published: Boolean(published),
          publishedAt: resolvedPublishedAt,
          ...approvalUpdate,
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
  const { session, user, error } = await requireEditorAccess()
  if (error) return error

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "Post id is required" }, { status: 400 })

    const isEditor = user?.role === "editor"
    if (isEditor) {
      const existing = await withRls(session!.userId, (tx) =>
        tx.blogPost.findUnique({ where: { id }, select: { authorId: true } }),
      )
      if (!existing || existing.authorId !== session!.userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    await withRls(session!.userId, (tx) => tx.blogPost.delete({ where: { id } }))
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Delete blog error:", err)
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 })
  }
}
