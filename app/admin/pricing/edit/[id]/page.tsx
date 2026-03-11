import { PricingForm } from "@/components/admin/pricing-form"
import { notFound, redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { withRls } from "@/lib/prisma"

export default async function EditPricingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const session = await getSession()
  if (!session) notFound()

  const adminUser = await withRls(session.userId, (tx) =>
    tx.user.findUnique({ where: { id: session.userId }, select: { role: true } }),
  )
  if (!adminUser || (adminUser.role !== "admin" && adminUser.role !== "super_admin")) {
    redirect("/admin/blog")
  }

  const plan = await withRls(session.userId, (tx) => tx.pricingPlan.findUnique({ where: { id } }))
  if (!plan) notFound()

  const features = Array.isArray(plan.features) ? plan.features.map((entry) => String(entry)).filter(Boolean) : []

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Pricing Plan</h1>
        <p className="text-muted-foreground mt-1">Update pricing plan information</p>
      </div>

      <PricingForm
        plan={{
          ...plan,
          period: plan.period || "",
          features,
        }}
      />
    </div>
  )
}
