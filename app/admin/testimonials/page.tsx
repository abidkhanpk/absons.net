import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import { getSession } from "@/lib/auth"
import { withRls } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { getSiteSettings } from "@/lib/site-settings"
import { TestimonialsManagementClient } from "@/components/admin/testimonials-management-client"

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
  const siteSettings = await getSiteSettings()
  const testimonialSection = siteSettings.homeSections.find((section) => section.id === "testimonials")
  const initialHomeTestimonialLimit =
    typeof testimonialSection?.homeTestimonialLimit === "number" && Number.isFinite(testimonialSection.homeTestimonialLimit)
      ? Math.max(0, Math.floor(testimonialSection.homeTestimonialLimit))
      : 3

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

      <TestimonialsManagementClient
        initialTestimonials={testimonials.map((testimonial) => ({
          id: testimonial.id,
          clientName: testimonial.clientName,
          clientCompany: testimonial.clientCompany,
          clientPosition: testimonial.clientPosition,
          content: testimonial.content,
          rating: testimonial.rating,
          isFeatured: testimonial.isFeatured,
          displayOrder: testimonial.displayOrder,
        }))}
        initialHomeTestimonialLimit={initialHomeTestimonialLimit}
        canManageHomeLimit={adminUser.role === "super_admin"}
      />
    </div>
  )
}
