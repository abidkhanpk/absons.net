import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getSession } from "@/lib/auth"
import { withRls } from "@/lib/prisma"
import { getSiteSettings } from "@/lib/site-settings"
import { WhyChooseForm } from "@/components/admin/why-choose-form"

export default async function WhyChoosePage() {
  const session = await getSession()
  if (!session) redirect("/auth/login")

  const currentUser = await withRls(session.userId, (tx) =>
    tx.user.findUnique({ where: { id: session.userId }, select: { role: true } }),
  )
  if (!currentUser) redirect("/auth/login")
  if (currentUser.role !== "super_admin") redirect("/admin")

  const settings = await getSiteSettings()

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Why Choose Us</h1>
        <p className="text-muted-foreground mt-1">Edit the homepage Why Choose Us section</p>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Section Content</CardTitle>
          <CardDescription>Update the layout, tiles, and icon choices</CardDescription>
        </CardHeader>
        <CardContent>
          <WhyChooseForm
            initial={{
              whyChooseTitle: settings.whyChooseTitle,
              whyChooseSubtitle: settings.whyChooseSubtitle,
              whyChooseItems: settings.whyChooseItems,
              whyChooseLayout: settings.whyChooseLayout,
              whyChooseScrollSpeed: settings.whyChooseScrollSpeed,
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
