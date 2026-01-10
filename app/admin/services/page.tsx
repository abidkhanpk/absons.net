import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, Edit } from "lucide-react"
import { DeleteServiceButton } from "@/components/admin/delete-service-button"
import { getSession } from "@/lib/auth"
import { withRls } from "@/lib/prisma"

export default async function ServicesManagementPage() {
  const session = await getSession()
  if (!session) {
    return null
  }
  const services = await withRls(session.userId, (tx) =>
    tx.service.findMany({ orderBy: { displayOrder: "asc" } }),
  )

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Services</h1>
          <p className="text-muted-foreground mt-1">Manage your service offerings</p>
        </div>
        <Button asChild>
          <Link href="/admin/services/new">
            <Plus className="mr-2 h-4 w-4" />
            New Service
          </Link>
        </Button>
      </div>

      {/* Services List */}
      {services && services.length > 0 ? (
        <div className="grid gap-4">
          {services.map((service) => (
            <Card key={service.id} className="border-border">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-semibold">{service.title}</h3>
                      {service.isFeatured && <Badge>Featured</Badge>}
                      <Badge variant="outline">{service.category}</Badge>
                    </div>
                    <p className="text-muted-foreground line-clamp-2">{service.description}</p>
                    <p className="text-sm text-muted-foreground">Display Order: {service.displayOrder}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/services/edit/${service.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <DeleteServiceButton serviceId={service.id} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-border">
          <CardContent className="p-12 text-center">
            <p className="text-lg font-medium mb-2">No services yet</p>
            <p className="text-muted-foreground mb-4">Add your first service to get started</p>
            <Button asChild>
              <Link href="/admin/services/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Service
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
