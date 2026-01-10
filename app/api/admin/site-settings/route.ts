import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { siteTitle, logoUrl, contactEmail, contactPhone, contactAddress, navAlignment, navLoginText } = body

    const supabase = await createServerClient()
    const adminClient = createAdminClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: requester } = await adminClient.from("users").select("role").eq("id", user.id).single()
    if (requester?.role !== "super_admin") {
      return NextResponse.json({ error: "Only super admins can update settings" }, { status: 403 })
    }

    const { error } = await adminClient
      .from("site_settings")
      .update({
        site_title: siteTitle,
        logo_url: logoUrl,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        contact_address: contactAddress,
        nav_alignment: navAlignment,
        nav_login_text: navLoginText,
      })
      .eq("id", "site")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating site settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
