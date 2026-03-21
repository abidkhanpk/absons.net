import TestimonialSubmitForm from "@/components/testimonial-submit-form"

export const metadata = {
  title: "Submit Testimonial",
}

export default function SubmitTestimonialPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Submit Testimonial</h1>
        <p className="text-muted-foreground mt-1">Share your experience with our product or service</p>
      </div>

      <TestimonialSubmitForm />
    </div>
  )
}
