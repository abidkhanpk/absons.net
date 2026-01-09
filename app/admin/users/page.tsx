import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, Pencil } from "lucide-react"
import { DeleteUserButton } from "@/components/admin/delete-user-button"
import { RequestAccountDeletionButton } from "@/components/admin/request-account-deletion-button"

export default async function UsersPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const { data: adminUser } = await supabase.from("users").select("*").eq("id", user.id).single()

  if (!adminUser) {
    redirect("/auth/login")
  }

  // Fetch all admin users
  const { data: users } = await supabase.from("users").select("*").order("created_at", { ascending: false })

  // Role badge colors
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "super_admin":
        return <Badge className="bg-purple-600">Super Admin</Badge>
      case "admin":
        return <Badge className="bg-blue-600">Admin</Badge>
      case "editor":
        return <Badge variant="secondary">Editor</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage admin users and permissions</p>
        </div>
        <Button asChild>
          <Link href="/admin/users/new">
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admin Users</CardTitle>
          <CardDescription>List of all users with admin access to the CMS</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">
                    {u.full_name || "N/A"}
                    {u.id === user.id && (
                      <Badge variant="outline" className="ml-2">
                        You
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{getRoleBadge(u.role)}</TableCell>
                  <TableCell>{new Date(u.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/users/edit/${u.id}`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    {u.id === user.id ? (
                      <RequestAccountDeletionButton userId={u.id} userEmail={u.email} fullName={u.full_name} />
                    ) : (
                      <DeleteUserButton userId={u.id} userEmail={u.email} />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
