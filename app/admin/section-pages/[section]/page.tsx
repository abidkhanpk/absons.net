import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getSession } from "@/lib/auth"
import { withRls } from "@/lib/prisma"
import { getSiteSettings } from "@/lib/site-settings"
import { SectionPageSettingsForm } from "@/components/admin/section-page-settings-form"

const SECTION_META = {
  services: { label: "Services", publicPath: "/services" },
  training: { label: "Training", publicPath: "/training" },
  products: { label: "Products", publicPath: "/products" },
  departments: { label: "Departments", publicPath: "/departments" },
  pricing: { label: "Pricing", publicPath: "/pricing" },
} as const

type SectionKey = keyof typeof SECTION_META

function isSectionKey(value: string): value is SectionKey {
  return value in SECTION_META
}

export default async function SectionPageSettingsPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params
  if (!isSectionKey(section)) return notFound()

  const session = await getSession()
  if (!session) redirect("/auth/login")

  const adminUser = await withRls(session.userId, (tx) =>
    tx.user.findUnique({ where: { id: session.userId }, select: { role: true } }),
  )
  if (!adminUser || (adminUser.role !== "admin" && adminUser.role !== "super_admin")) {
    redirect("/admin/blog")
  }

  const settings = await getSiteSettings()
  const meta = SECTION_META[section]
  const entry = settings.staticSeo[section]

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit {meta.label} Website Page</h1>
        <p className="text-muted-foreground mt-1">
          Configure SEO and content before/after the auto-generated item list for <code>{meta.publicPath}</code>.
        </p>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>{meta.label} Page Configuration</CardTitle>
          <CardDescription>The item list section stays auto-generated from this module&apos;s items.</CardDescription>
        </CardHeader>
        <CardContent>
          <SectionPageSettingsForm
            sectionKey={section}
            sectionLabel={meta.label}
            initial={{
              title: entry?.title || "",
              description: entry?.description || "",
              keywords: entry?.keywords || "",
              ogImage: entry?.ogImage || "",
              canonical: entry?.canonical || "",
              noIndex: Boolean(entry?.noIndex),
              noFollow: Boolean(entry?.noFollow),
              beforeListContent: entry?.beforeListContent || "",
              afterListContent: entry?.afterListContent || "",
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
