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
    const { title, slug, content, published, approved } = body
    if (!title || !slug || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const approvalRequired = await isEditorApprovalRequired()
    const isEditor = user?.role === "editor"
    const resolvedApproved = isEditor ? !approvalRequired : typeof approved === "boolean" ? approved : true
    const resolvedApprovedAt = resolvedApproved ? new Date() : null

    await withRls(session!.userId, (tx) =>
      tx.page.create({
        data: {
          title,
          slug,
          content,
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
    console.error("Create page error:", err)
    return NextResponse.json({ error: "Failed to create page" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const { session, user, error } = await requireEditorAccess()
  if (error) return error

  try {
    const body = await request.json()
    const { id, title, slug, content, published, approved } = body
    if (!id) return NextResponse.json({ error: "Page id is required" }, { status: 400 })

    const approvalRequired = await isEditorApprovalRequired()
    const isEditor = user?.role === "editor"

    if (isEditor) {
      const existing = await withRls(session!.userId, (tx) =>
        tx.page.findUnique({ where: { id }, select: { authorId: true } }),
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
      tx.page.update({
        where: { id },
        data: {
          title,
          slug,
          content,
          published: Boolean(published),
          publishedAt: resolvedPublishedAt,
          ...approvalUpdate,
        },
      }),
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Update page error:", err)
    return NextResponse.json({ error: "Failed to update page" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const { session, user, error } = await requireEditorAccess()
  if (error) return error

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "Page id is required" }, { status: 400 })

    const isEditor = user?.role === "editor"
    if (isEditor) {
      const existing = await withRls(session!.userId, (tx) =>
        tx.page.findUnique({ where: { id }, select: { authorId: true } }),
      )
      if (!existing || existing.authorId !== session!.userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    await withRls(session!.userId, (tx) => tx.page.delete({ where: { id } }))
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Delete page error:", err)
    return NextResponse.json({ error: "Failed to delete page" }, { status: 500 })
  }
}
