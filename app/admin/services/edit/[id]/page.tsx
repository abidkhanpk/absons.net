import { ServiceForm } from "@/components/admin/service-form"
import { notFound, redirect } from "next/navigation"
import { withRls } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const session = await getSession()
  if (!session) notFound()

  const adminUser = await withRls(session.userId, (tx) =>
    tx.user.findUnique({ where: { id: session.userId }, select: { role: true } }),
  )
  if (!adminUser || (adminUser.role !== "admin" && adminUser.role !== "super_admin")) {
    redirect("/admin/blog")
  }

  const service = await withRls(session.userId, (tx) => tx.service.findUnique({ where: { id } }))

  if (!service) {
    notFound()
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Service</h1>
        <p className="text-muted-foreground mt-1">Update service information</p>
      </div>

      <ServiceForm service={service} />
    </div>
  )
}
