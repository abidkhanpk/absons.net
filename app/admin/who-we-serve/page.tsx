import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, Edit } from "lucide-react"
import { DeleteWhoWeServeButton } from "@/components/admin/delete-who-we-serve-button"
import { getSession } from "@/lib/auth"
import { withRls } from "@/lib/prisma"
import { redirect } from "next/navigation"

export default async function WhoWeServeManagementPage() {
  const session = await getSession()
  if (!session) return null

  const adminUser = await withRls(session.userId, (tx) =>
    tx.user.findUnique({ where: { id: session.userId }, select: { role: true } }),
  )
  if (!adminUser || (adminUser.role !== "admin" && adminUser.role !== "super_admin")) {
    redirect("/admin/blog")
  }

  const items = await withRls(session.userId, (tx) =>
    tx.whoWeServe.findMany({ orderBy: { displayOrder: "asc" } }),
  )

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Who We Serve</h1>
          <p className="text-muted-foreground mt-1">Manage audience segments for the homepage section</p>
        </div>
        <Button asChild>
          <Link href="/admin/who-we-serve/new">
            <Plus className="mr-2 h-4 w-4" />
            New Entry
          </Link>
        </Button>
      </div>

      {items.length > 0 ? (
        <div className="grid gap-4">
          {items.map((item) => (
            <Card key={item.id} className="border-border">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-semibold">{item.title}</h3>
                      <Badge variant={item.isActive ? "default" : "secondary"}>
                        {item.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground line-clamp-2">{item.description}</p>
                    <p className="text-sm text-muted-foreground">Display Order: {item.displayOrder}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/who-we-serve/edit/${item.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <DeleteWhoWeServeButton itemId={item.id} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-border">
          <CardContent className="p-12 text-center">
            <p className="text-lg font-medium mb-2">No entries yet</p>
            <p className="text-muted-foreground mb-4">Add your first audience segment to get started</p>
            <Button asChild>
              <Link href="/admin/who-we-serve/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Entry
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
