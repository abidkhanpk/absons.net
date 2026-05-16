import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, Edit } from "lucide-react"
import { DeleteDepartmentButton } from "@/components/admin/delete-department-button"
import { getSession } from "@/lib/auth"
import { withRls } from "@/lib/prisma"
import { findManyDepartmentsCompat } from "@/lib/department-compat"
import { redirect } from "next/navigation"

export default async function DepartmentsManagementPage() {
  const session = await getSession()
  if (!session) return null

  const adminUser = await withRls(session.userId, (tx) =>
    tx.user.findUnique({ where: { id: session.userId }, select: { role: true } }),
  )
  if (!adminUser || (adminUser.role !== "admin" && adminUser.role !== "super_admin")) {
    redirect("/admin/blog")
  }

  const departments = await withRls(session.userId, (tx) =>
    findManyDepartmentsCompat(tx, { orderBy: { displayOrder: "asc" } }),
  )

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Departments</h1>
          <p className="text-muted-foreground mt-1">Manage department listings</p>
        </div>
        <Button asChild>
          <Link href="/admin/departments/new">
            <Plus className="mr-2 h-4 w-4" />
            New Department
          </Link>
        </Button>
      </div>

      {departments.length > 0 ? (
        <div className="grid gap-4">
          {departments.map((department) => (
            <Card key={department.id} className="border-border">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-semibold">{department.title}</h3>
                      {department.isFeatured ? <Badge variant="outline">Featured</Badge> : null}
                      <Badge variant={department.isActive ? "default" : "secondary"}>
                        {department.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground line-clamp-2">{department.description}</p>
                    <p className="text-sm text-muted-foreground">Display Order: {department.displayOrder}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/departments/edit/${department.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <DeleteDepartmentButton departmentId={department.id} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-border">
          <CardContent className="p-12 text-center">
            <p className="text-lg font-medium mb-2">No departments yet</p>
            <p className="text-muted-foreground mb-4">Add your first department to get started</p>
            <Button asChild>
              <Link href="/admin/departments/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Department
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
