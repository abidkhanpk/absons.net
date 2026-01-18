import { BlogForm } from "@/components/admin/blog-form"
import { getSession } from "@/lib/auth"
import { withRls } from "@/lib/prisma"
import { getSiteSettings } from "@/lib/site-settings"
import { redirect } from "next/navigation"

export default async function NewBlogPage() {
  const session = await getSession()
  if (!session) redirect("/auth/login")

  const [user, settings] = await Promise.all([
    withRls(session.userId, (tx) => tx.user.findUnique({ where: { id: session.userId }, select: { role: true } })),
    getSiteSettings(),
  ])

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create New Blog Post</h1>
        <p className="text-muted-foreground mt-1">Write and publish a new blog post</p>
      </div>

      <BlogForm
        currentUserRole={user?.role || "editor"}
        editorApprovalRequired={settings.editorApprovalRequired ?? true}
      />
    </div>
  )
}
