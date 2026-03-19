import { WhoWeServeForm } from "@/components/admin/who-we-serve-form"
import { notFound, redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { withRls } from "@/lib/prisma"

export default async function EditWhoWeServePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const session = await getSession()
  if (!session) notFound()

  const adminUser = await withRls(session.userId, (tx) =>
    tx.user.findUnique({ where: { id: session.userId }, select: { role: true } }),
  )
  if (!adminUser || (adminUser.role !== "admin" && adminUser.role !== "super_admin")) {
    redirect("/admin/blog")
  }

  const item = await withRls(session.userId, (tx) => tx.whoWeServe.findUnique({ where: { id } }))
  if (!item) notFound()

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Who We Serve Entry</h1>
        <p className="text-muted-foreground mt-1">Update audience segment information</p>
      </div>

      <WhoWeServeForm item={item} />
    </div>
  )
}
