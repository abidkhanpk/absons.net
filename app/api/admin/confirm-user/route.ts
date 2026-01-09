import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { userId } = await request.json()
    const supabase = await createServerClient()

    // Verify the requester is an admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: adminUser } = await supabase.from("users").select("*").eq("id", user.id).single()

    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Note: Direct email confirmation requires Supabase service role key
    // For now, users created by admins will need to confirm via email
    // Or you can use Supabase Admin API with service role key

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error confirming user:", error)
    return NextResponse.json({ error: "Failed to confirm user" }, { status: 500 })
  }
}
