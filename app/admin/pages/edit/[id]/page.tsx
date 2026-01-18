import { notFound } from "next/navigation"
import { PageForm } from "@/components/admin/page-form"
import { withRls } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { getSiteSettings } from "@/lib/site-settings"

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const session = await getSession()
  if (!session) notFound()

  const [page, user, settings] = await Promise.all([
    withRls(session.userId, (tx) => tx.page.findUnique({ where: { id } })),
    withRls(session.userId, (tx) => tx.user.findUnique({ where: { id: session.userId }, select: { role: true } })),
    getSiteSettings(),
  ])
  if (!page) return notFound()

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Page</h1>
        <p className="text-muted-foreground mt-1">Update page content and settings</p>
      </div>
      <PageForm
        page={page}
        currentUserRole={user?.role || "editor"}
        editorApprovalRequired={settings.editorApprovalRequired ?? true}
      />
    </div>
  )
}
