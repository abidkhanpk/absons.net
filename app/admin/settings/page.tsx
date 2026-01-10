import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SiteSettingsForm } from "@/components/admin/site-settings-form"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export default async function SettingsPage() {
  const session = await getSession()
  if (!session) redirect("/auth/login")

  const currentUser = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!currentUser) redirect("/auth/login")
  if (currentUser.role !== "super_admin") redirect("/admin")

  const settings = await prisma.siteSettings.findUnique({ where: { id: "site" } })

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Site Settings</h1>
        <p className="text-muted-foreground mt-1">Manage global site configuration</p>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Branding & Footer</CardTitle>
          <CardDescription>Update the website title, logo, and contact information</CardDescription>
        </CardHeader>
        <CardContent>
          <SiteSettingsForm
            initial={
              settings || {
                site_title: "ABSON Solutions",
                logo_url: null,
                contact_email: "info@absonsolutions.com",
                contact_phone: "+92 XXX XXXXXXX",
                contact_address: "Pakistan",
                nav_alignment: "left",
                nav_login_text: "Login",
              }
            }
          />
        </CardContent>
      </Card>
    </div>
  )
}
