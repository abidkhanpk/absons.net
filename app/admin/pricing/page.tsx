import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, Edit } from "lucide-react"
import { DeletePricingButton } from "@/components/admin/delete-pricing-button"
import { getSession } from "@/lib/auth"
import { withRls } from "@/lib/prisma"
import { redirect } from "next/navigation"

export default async function PricingManagementPage() {
  const session = await getSession()
  if (!session) return null

  const adminUser = await withRls(session.userId, (tx) =>
    tx.user.findUnique({ where: { id: session.userId }, select: { role: true } }),
  )
  if (!adminUser || (adminUser.role !== "admin" && adminUser.role !== "super_admin")) {
    redirect("/admin/blog")
  }

  const plans = await withRls(session.userId, (tx) =>
    tx.pricingPlan.findMany({ orderBy: { displayOrder: "asc" } }),
  )

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pricing Plans</h1>
          <p className="text-muted-foreground mt-1">Manage pricing plans and features</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/section-pages/pricing">Edit Website Page</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/pricing/new">
              <Plus className="mr-2 h-4 w-4" />
              New Plan
            </Link>
          </Button>
        </div>
      </div>

      {plans.length > 0 ? (
        <div className="grid gap-4">
          {plans.map((plan) => (
            <Card key={plan.id} className="border-border">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-semibold">{plan.name}</h3>
                      <Badge variant={plan.isActive ? "default" : "secondary"}>
                        {plan.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline">{`${plan.price}${plan.period || ""}`}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Display Order: {plan.displayOrder}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/pricing/edit/${plan.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <DeletePricingButton planId={plan.id} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-border">
          <CardContent className="p-12 text-center">
            <p className="text-lg font-medium mb-2">No pricing plans yet</p>
            <p className="text-muted-foreground mb-4">Add your first plan to get started</p>
            <Button asChild>
              <Link href="/admin/pricing/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Plan
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
