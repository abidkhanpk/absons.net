import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { withRls, prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { role: true } })
  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { id, type, action, reason, notifyAuthor } = body
    if (!id || (type !== "blog" && type !== "page")) {
      return NextResponse.json({ error: "Invalid approval request" }, { status: 400 })
    }

    const now = new Date()
    const resolvedAction = action === "reject" ? "reject" : action === "undo" ? "undo" : "approve"
    const trimmedReason = typeof reason === "string" ? reason.trim() : ""
    const shouldNotify = notifyAuthor === true
    const rejectionData =
      resolvedAction === "reject"
        ? {
            approved: false,
            approvedAt: null,
            rejectedAt: now,
            rejectedReason: trimmedReason.length > 0 ? trimmedReason : null,
            rejectionNotifiedAt: shouldNotify ? now : null,
            resubmittedAt: null,
            resubmissionNote: null,
          }
        : resolvedAction === "undo"
          ? {
              approved: false,
              approvedAt: null,
              rejectedAt: null,
              rejectedReason: null,
              rejectionNotifiedAt: null,
              resubmittedAt: null,
              resubmissionNote: null,
            }
          : {
              approved: true,
              approvedAt: now,
              rejectedAt: null,
              rejectedReason: null,
              rejectionNotifiedAt: null,
              resubmittedAt: null,
              resubmissionNote: null,
            }

    if (type === "blog") {
      await withRls(session.userId, (tx) => tx.blogPost.update({ where: { id }, data: rejectionData }))
    } else {
      await withRls(session.userId, (tx) => tx.page.update({ where: { id }, data: rejectionData }))
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Approval error:", error)
    return NextResponse.json({ error: "Failed to approve content" }, { status: 500 })
  }
}
