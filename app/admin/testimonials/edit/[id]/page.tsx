import { TestimonialForm } from "@/components/admin/testimonial-form"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

export default async function EditTestimonialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: testimonial } = await supabase.from("testimonials").select("*").eq("id", id).single()

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
