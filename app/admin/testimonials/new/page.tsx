import { TestimonialForm } from "@/components/admin/testimonial-form"
import { getSession } from "@/lib/auth"
import { withRls } from "@/lib/prisma"
import { redirect } from "next/navigation"

export default async function NewTestimonialPage() {
  const session = await getSession()
  if (!session) redirect("/auth/login")

  const adminUser = await withRls(session.userId, (tx) =>
    tx.user.findUnique({ where: { id: session.userId }, select: { role: true } }),
  )
  if (!adminUser || (adminUser.role !== "admin" && adminUser.role !== "super_admin")) {
    redirect("/admin/blog")
  }

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
