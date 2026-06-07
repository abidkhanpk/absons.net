import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { withRls } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { userId } = await request.json()
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const adminUser = await withRls(session.userId, (tx) =>
      tx.user.findUnique({
        where: { id: session.userId },
        select: { role: true, isActive: true },
      }),
    )

    if (!adminUser?.isActive || (adminUser.role !== "admin" && adminUser.role !== "super_admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Placeholder endpoint retained for compatibility. No-op confirmation using Prisma auth layer.
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error confirming user:", error)
    return NextResponse.json({ error: "Failed to confirm user" }, { status: 500 })
  }
}
