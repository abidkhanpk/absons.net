import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserForm } from "@/components/admin/user-form"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { withRls } from "@/lib/prisma"

export default async function NewUserPage() {
  const session = await getSession()
  if (!session) {
    redirect("/auth/login")
  }

  const adminUser = await withRls(session.userId, (tx) =>
    tx.user.findUnique({
      where: { id: session.userId },
      select: { id: true, role: true },
    }),
  )

  if (!adminUser || (adminUser.role !== "admin" && adminUser.role !== "super_admin")) {
    redirect("/admin")
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add New User</h1>
        <p className="text-muted-foreground mt-1">Create a new admin user account</p>
      </div>

      <Card className="w-full">
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
