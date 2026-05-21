import { PageForm } from "@/components/admin/page-form"
import { getSession } from "@/lib/auth"
import { withRls } from "@/lib/prisma"
import { getSiteSettings } from "@/lib/site-settings"
import { derivePageSlugPrefixOptions } from "@/lib/page-slug"
import { redirect } from "next/navigation"

export default async function NewPage() {
  const session = await getSession()
  if (!session) redirect("/auth/login")

  const [user, settings, pages] = await Promise.all([
    withRls(session.userId, (tx) => tx.user.findUnique({ where: { id: session.userId }, select: { role: true } })),
    getSiteSettings(),
    withRls(session.userId, (tx) => tx.page.findMany({ select: { slug: true } })),
  ])
  const slugPrefixOptions = derivePageSlugPrefixOptions(pages.map((entry) => entry.slug))

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Page</h1>
        <p className="text-muted-foreground mt-1">Add a new page to the website</p>
      </div>
      <PageForm
        currentUserRole={user?.role || "editor"}
        editorApprovalRequired={settings.editorApprovalRequired ?? true}
        slugPrefixOptions={slugPrefixOptions}
      />
    </div>
  )
}
