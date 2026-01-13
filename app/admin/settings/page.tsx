import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SiteSettingsForm } from "@/components/admin/site-settings-form"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getSiteSettings } from "@/lib/site-settings"

export default async function SettingsPage() {
  const session = await getSession()
  if (!session) redirect("/auth/login")

  const currentUser = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!currentUser) redirect("/auth/login")
  if (currentUser.role !== "super_admin") redirect("/admin")

  const settings = await prisma.siteSettings.findUnique({ where: { id: "site" } })
  const resolved = await getSiteSettings()

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
            initial={{
              site_title: settings?.siteTitle || "ABSON Solutions",
              logo_url: settings?.logoUrl || null,
              favicon_url: settings?.faviconUrl || "/icon-light-32x32.png",
              contact_email: settings?.contactEmail || "info@absonsolutions.com",
              contact_phone: settings?.contactPhone || "+92 XXX XXXXXXX",
              contact_address: settings?.contactAddress || "Pakistan",
              nav_alignment: (settings?.navAlignment as "left" | "center" | "right") || "left",
              nav_login_text: settings?.navLoginText || "Login",
              nav_cta_text: settings?.navCtaText || "Get Started",
              nav_cta_href: settings?.navCtaHref || "/contact",
              nav_cta_enabled: settings?.navCtaEnabled ?? true,
              layout_mode: (settings?.layoutMode as "full" | "container") || "container",
              layout_width: settings?.layoutWidth ?? 90,
              hero_mode: (settings?.heroMode as "static" | "parallax") || resolved.heroMode || "static",
              hero_static_index: settings?.heroStaticIndex ?? resolved.heroStaticIndex ?? 0,
              hero_slides: JSON.stringify(settings?.heroSlides ? JSON.parse(settings.heroSlides) : resolved.heroSlides),
              hero_autoplay_seconds: settings?.heroAutoplaySeconds ?? resolved.heroAutoplaySeconds ?? 6,
              hero_image_fit:
                (settings?.heroImageFit as "cover" | "contain" | "none") || resolved.heroImageFit || "cover",
              logo_width: settings?.logoWidth || 40,
              logo_height: settings?.logoHeight || 40,
              logo_radius: settings?.logoRadius ?? 8,
              show_login_link: settings?.showLoginLink ?? true,
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
