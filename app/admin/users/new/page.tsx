import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserForm } from "@/components/admin/user-form"

export default async function NewUserPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is admin and get their role
  const { data: adminUser } = await supabase.from("users").select("*").eq("id", user.id).single()

  if (!adminUser) {
    redirect("/auth/login")
  }

  if (adminUser.role !== "admin" && adminUser.role !== "super_admin") {
    redirect("/admin")
  }

  return (
    <div className="max-w-2xl mx-auto p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add New User</h1>
        <p className="text-muted-foreground mt-1">Create a new admin user account</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Details</CardTitle>
          <CardDescription>Enter the information for the new admin user</CardDescription>
        </CardHeader>
        <CardContent>
          <UserForm currentUserRole={adminUser.role} currentUserId={adminUser.id} />
        </CardContent>
      </Card>
    </div>
  )
}
