import { TestimonialForm } from "@/components/admin/testimonial-form"

export default function NewTestimonialPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create New Testimonial</h1>
        <p className="text-muted-foreground mt-1">Add a client testimonial</p>
      </div>

      <TestimonialForm />
    </div>
  )
}
