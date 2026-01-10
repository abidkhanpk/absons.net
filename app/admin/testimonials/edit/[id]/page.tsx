import { TestimonialForm } from "@/components/admin/testimonial-form"
import { notFound } from "next/navigation"
import { getSession } from "@/lib/auth"
import { withRls } from "@/lib/prisma"

export default async function EditTestimonialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()
  if (!session) notFound()

  const testimonial = await withRls(session.userId, (tx) => tx.testimonial.findUnique({ where: { id } }))

  if (!testimonial) {
    notFound()
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Testimonial</h1>
        <p className="text-muted-foreground mt-1">Update testimonial information</p>
      </div>

      <TestimonialForm testimonial={testimonial} />
    </div>
  )
}
