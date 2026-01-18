import { randomUUID } from "crypto"
import { NextResponse } from "next/server"

import { getSession, hashPassword } from "@/lib/auth"
import { prisma, withRls } from "@/lib/prisma"

const ALLOWED_ROLES = ["super_admin", "admin", "editor"] as const
type AllowedRole = (typeof ALLOWED_ROLES)[number]

async function getRequester() {
  const session = await getSession()
  if (!session) return { session: null, requesterRole: null as AllowedRole | null }

  const requester = await withRls(session.userId, (tx) =>
    tx.user.findUnique({
      where: { id: session.userId },
      select: { role: true },
    }),
  )

  return { session, requesterRole: (requester?.role as AllowedRole | null) ?? null }
}

export async function POST(request: Request) {
  try {
    const { email, password, fullName, role }: { email?: string; password?: string; fullName?: string; role?: AllowedRole } =
      await request.json()

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: "Email, password, and full name are required" }, { status: 400 })
    }

    const totalUsers = await prisma.user.count()
    const isBootstrap = totalUsers === 0
    const newUserId = randomUUID()

    const { session, requesterRole } = await getRequester()

    if (!isBootstrap && (!session || !requesterRole || (requesterRole !== "admin" && requesterRole !== "super_admin"))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const requestedRole: AllowedRole = ALLOWED_ROLES.find((r) => r === role) ?? "admin"
    if (!isBootstrap && requestedRole === "super_admin" && requesterRole !== "super_admin") {
      return NextResponse.json({ error: "Only super admins can create another super admin" }, { status: 403 })
    }
    if (!isBootstrap && requesterRole === "admin" && requestedRole !== "editor") {
      return NextResponse.json({ error: "Admins can only create editors" }, { status: 403 })
    }

    const resolvedRole: AllowedRole = isBootstrap ? "super_admin" : requestedRole
    const actingUserId = isBootstrap ? newUserId : session!.userId

    const existing = await withRls(actingUserId, (tx) => tx.user.findFirst({ where: { email } }))
    if (existing) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    await withRls(actingUserId, (tx) =>
      tx.user.create({
        data: {
          id: newUserId,
          email,
          fullName,
          role: resolvedRole,
          passwordHash: hashPassword(password),
        },
      }),
    )

    return NextResponse.json({ success: true, userId: newUserId, role: resolvedRole })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create user"
    console.error("Error creating user:", error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("id")

    if (!userId) {
      return NextResponse.json({ error: "User id is required" }, { status: 400 })
    }

    const { session, requesterRole } = await getRequester()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.userId === userId) {
      return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 })
    }

    if (!requesterRole || (requesterRole !== "admin" && requesterRole !== "super_admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const target = await withRls(session.userId, (tx) =>
      tx.user.findUnique({
        where: { id: userId },
        select: { role: true },
      }),
    )

    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (target.role === "super_admin" && requesterRole !== "super_admin") {
      return NextResponse.json({ error: "Only super admins can remove another super admin" }, { status: 403 })
    }
    if (requesterRole === "admin" && target.role !== "editor") {
      return NextResponse.json({ error: "Admins can only remove editors" }, { status: 403 })
    }

    await withRls(session.userId, (tx) => tx.user.delete({ where: { id: userId } }))

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete user"
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { id, fullName, role, password }: { id?: string; fullName?: string; role?: AllowedRole; password?: string } =
      await request.json()

    if (!id || !fullName) {
      return NextResponse.json({ error: "User id and full name are required" }, { status: 400 })
    }

    const { session } = await getRequester()
    const sessionData = session

    if (!sessionData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const requester = await withRls(sessionData.userId, (tx) =>
      tx.user.findUnique({
        where: { id: sessionData.userId },
        select: { role: true },
      }),
    )

    const requesterRole = (requester?.role as AllowedRole | null) ?? null
    const isSelf = sessionData.userId === id

    if (!isSelf && (!requesterRole || (requesterRole !== "admin" && requesterRole !== "super_admin"))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const target = await withRls(sessionData.userId, (tx) =>
      tx.user.findUnique({
        where: { id },
        select: { role: true },
      }),
    )

    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (!isSelf && target.role === "super_admin" && requesterRole !== "super_admin") {
      return NextResponse.json({ error: "Only super admins can modify another super admin" }, { status: 403 })
    }
    if (!isSelf && requesterRole === "admin" && target.role !== "editor") {
      return NextResponse.json({ error: "Admins can only modify editors" }, { status: 403 })
    }

    const requestedRole: AllowedRole | undefined = ALLOWED_ROLES.find((r) => r === role)
    const canChangeRole = !isSelf && requesterRole && (requesterRole === "admin" || requesterRole === "super_admin")
    if (!isSelf && requesterRole === "admin" && requestedRole && requestedRole !== "editor") {
      return NextResponse.json({ error: "Admins can only assign editor role" }, { status: 403 })
    }
    const nextRole: AllowedRole = canChangeRole && requestedRole ? requestedRole : (target.role as AllowedRole)

    if (nextRole === "super_admin" && requesterRole !== "super_admin" && !isSelf) {
      return NextResponse.json({ error: "Only super admins can assign super admin" }, { status: 403 })
    }

    const dataToUpdate: { fullName?: string; role?: string; passwordHash?: string } = {
      fullName,
    }

    if (canChangeRole) {
      dataToUpdate.role = nextRole
    }

    if (isSelf && password) {
      dataToUpdate.passwordHash = hashPassword(password)
    }

    await withRls(sessionData.userId, (tx) =>
      tx.user.update({
        where: { id },
        data: dataToUpdate,
      }),
    )

    return NextResponse.json({ success: true, role: nextRole })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update user"
    console.error("Error updating user:", error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
