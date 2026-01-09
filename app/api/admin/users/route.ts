import { NextResponse } from "next/server"

import { createServerClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

const ALLOWED_ROLES = ["super_admin", "admin", "editor"] as const
type AllowedRole = (typeof ALLOWED_ROLES)[number]

export async function POST(request: Request) {
  try {
    const { email, password, fullName, role }: { email?: string; password?: string; fullName?: string; role?: AllowedRole } =
      await request.json()

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: "Email, password, and full name are required" }, { status: 400 })
    }

    const adminClient = createAdminClient()
    const supabase = await createServerClient()

    const {
      data: { user: requester },
    } = await supabase.auth.getUser()

    const { count: adminCount = 0 } = await adminClient.from("users").select("id", { count: "exact", head: true })
    const hasAdmins = adminCount > 0

    let requesterRole: AllowedRole | null = null
    if (requester) {
      const { data: requesterRow } = await adminClient.from("users").select("role").eq("id", requester.id).single()
      requesterRole = (requesterRow?.role as AllowedRole) || null
    }

    // Authorization: allow existing admins, or bootstrap first admin if none exists
    if (hasAdmins && !requesterRole) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (role === "super_admin" && requesterRole !== "super_admin" && hasAdmins) {
      return NextResponse.json({ error: "Only super admins can create another super admin" }, { status: 403 })
    }

    const requestedRole: AllowedRole = ALLOWED_ROLES.find((r) => r === role) ?? "admin"
    const resolvedRole: AllowedRole = hasAdmins ? requestedRole : "super_admin"

    const { data: createdUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      },
    })

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 })
    }

    const userId = createdUser.user?.id
    if (!userId) {
      return NextResponse.json({ error: "User creation failed" }, { status: 500 })
    }

    const { error: adminInsertError } = await adminClient.from("users").insert({
      id: userId,
      email,
      full_name: fullName,
      role: resolvedRole,
    })

    if (adminInsertError) {
      return NextResponse.json({ error: adminInsertError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, userId, role: resolvedRole })
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

    const adminClient = createAdminClient()
    const supabase = await createServerClient()

    const {
      data: { user: requester },
    } = await supabase.auth.getUser()

    if (!requester) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (requester.id === userId) {
      return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 })
    }

    const { data: requesterRow } = await adminClient.from("users").select("role").eq("id", requester.id).single()
    const requesterRole = (requesterRow?.role as AllowedRole) || null

    if (!requesterRole) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: targetRow } = await adminClient.from("users").select("role").eq("id", userId).single()
    if (!targetRow) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const targetRole = (targetRow.role as AllowedRole) || null

    if (targetRole === "super_admin" && requesterRole !== "super_admin") {
      return NextResponse.json({ error: "Only super admins can remove another super admin" }, { status: 403 })
    }

    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId)
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete user"
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
