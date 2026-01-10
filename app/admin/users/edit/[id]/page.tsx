import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserForm } from "@/components/admin/user-form"
import { redirect, notFound } from "next/navigation"
import { getSession } from "@/lib/auth"
import { withRls } from "@/lib/prisma"

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()
  if (!session) {
    redirect("/auth/login")
  }

  const currentAdminUser = await withRls(session.userId, (tx) =>
    tx.user.findUnique({
      where: { id: session.userId },
      select: { id: true, role: true },
    }),
  )

  if (!currentAdminUser) {
    redirect("/auth/login")
  }

  const isSelf = id === session.userId
  if (!isSelf && currentAdminUser.role !== "admin" && currentAdminUser.role !== "super_admin") {
    redirect("/admin")
  }

  const userToEdit = await withRls(session.userId, (tx) =>
    tx.user.findUnique({
      where: { id },
    }),
  )

  if (!userToEdit) {
    notFound()
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit User</h1>
        <p className="text-muted-foreground mt-1">Update user information and permissions</p>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>User Details</CardTitle>
          <CardDescription>Modify the user's information and role</CardDescription>
        </CardHeader>
        <CardContent>
          <UserForm
            user={{
              ...userToEdit,
              full_name: userToEdit.fullName ?? "",
            }}
            currentUserRole={currentAdminUser.role}
            currentUserId={session.userId}
          />
        </CardContent>
      </Card>
    </div>
  )
}
