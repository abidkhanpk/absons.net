import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { withRls, prisma } from "@/lib/prisma"

async function requireAdmin() {
  const session = await getSession()
  if (!session) return { session: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!user?.isActive || (user.role !== "admin" && user.role !== "super_admin")) {
    return { session, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) }
  }
  return { session, error: null }
}

export async function DELETE(request: Request) {
  const { session, error } = await requireAdmin()
  if (error) return error

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "Inquiry id is required" }, { status: 400 })

    await withRls(session!.userId, (tx) => tx.contactInquiry.delete({ where: { id } }))
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Delete inquiry error:", err)
    return NextResponse.json({ error: "Failed to delete inquiry" }, { status: 500 })
  }
}
