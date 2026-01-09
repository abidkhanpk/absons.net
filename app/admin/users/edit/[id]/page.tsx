import { createServerClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserForm } from "@/components/admin/user-form"

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if current user is admin and get their role
  const { data: currentAdminUser } = await supabase.from("admin_users").select("*").eq("id", user.id).single()

  if (!currentAdminUser) {
    redirect("/auth/login")
  }

  // Fetch the user to edit
  const { data: userToEdit, error } = await supabase.from("admin_users").select("*").eq("id", id).single()

  if (error || !userToEdit) {
    notFound()
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit User</h1>
        <p className="text-muted-foreground mt-1">Update user information and permissions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Details</CardTitle>
          <CardDescription>Modify the user's information and role</CardDescription>
        </CardHeader>
        <CardContent>
          <UserForm user={userToEdit} currentUserRole={currentAdminUser.role} />
        </CardContent>
      </Card>
    </div>
  )
}
