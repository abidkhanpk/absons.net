import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, Edit, Star } from "lucide-react"
import { DeleteTestimonialButton } from "@/components/admin/delete-testimonial-button"
import { getSession } from "@/lib/auth"
import { withRls } from "@/lib/prisma"
import { redirect } from "next/navigation"

export default async function TestimonialsManagementPage() {
  const session = await getSession()
  if (!session) return null

  const adminUser = await withRls(session.userId, (tx) =>
    tx.user.findUnique({ where: { id: session.userId }, select: { role: true } }),
  )
  if (!adminUser || (adminUser.role !== "admin" && adminUser.role !== "super_admin")) {
    redirect("/admin/blog")
  }

  const testimonials = await withRls(session.userId, (tx) =>
    tx.testimonial.findMany({ orderBy: { displayOrder: "asc" } }),
  )

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Testimonials</h1>
          <p className="text-muted-foreground mt-1">Manage client testimonials and reviews</p>
        </div>
        <Button asChild>
          <Link href="/admin/testimonials/new">
            <Plus className="mr-2 h-4 w-4" />
            New Testimonial
          </Link>
        </Button>
      </div>

      {/* Testimonials List */}
      {testimonials && testimonials.length > 0 ? (
        <div className="grid gap-4">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="border-border">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-semibold">{testimonial.clientName}</h3>
                      {testimonial.isFeatured && <Badge>Featured</Badge>}
                      <div className="flex gap-1">
                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.clientPosition}
                      {testimonial.clientCompany && `, ${testimonial.clientCompany}`}
                    </p>
                    <p className="text-muted-foreground line-clamp-2 italic">"{testimonial.content}"</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/testimonials/edit/${testimonial.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <DeleteTestimonialButton testimonialId={testimonial.id} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-border">
          <CardContent className="p-12 text-center">
            <p className="text-lg font-medium mb-2">No testimonials yet</p>
            <p className="text-muted-foreground mb-4">Add client testimonials to build trust</p>
            <Button asChild>
              <Link href="/admin/testimonials/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Testimonial
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
