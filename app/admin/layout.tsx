import type React from "react"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { withRls } from "@/lib/prisma"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { getSiteSettings } from "@/lib/site-settings"

export async function generateMetadata() {
  const settings = await getSiteSettings()
  const siteTitle = settings.siteTitle || "Site"
  return {
    title: `Admin Dashboard - ${siteTitle} CMS`,
    description: `Content Management System for ${siteTitle}`,
  }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect("/auth/login")

  const adminUser = await withRls(session.userId, (db) =>
    db.user.findFirst({ where: { id: session.userId, role: { in: ["admin", "super_admin", "editor"] } } }),
  )
  if (!adminUser) redirect("/auth/login")

  const [settings, approvalCount, rejectedBlogCount] = await Promise.all([
    getSiteSettings(),
    adminUser.role === "admin" || adminUser.role === "super_admin"
      ? withRls(session.userId, async (db) => {
          const [posts, pages] = await Promise.all([
            db.blogPost.count({ where: { published: true, approved: false, rejectedAt: null } }),
            db.page.count({ where: { published: true, approved: false, rejectedAt: null } }),
          ])
          return posts + pages
        })
      : Promise.resolve(0),
    adminUser.role === "editor"
      ? withRls(session.userId, (db) =>
          db.blogPost.count({
            where: { authorId: session.userId, approved: false, rejectedAt: { not: null } },
          }),
        )
      : Promise.resolve(0),
  ])

  return (
    <div className="flex min-h-screen">
      <AdminSidebar
        user={{ id: adminUser.id, email: adminUser.email, role: adminUser.role }}
        pendingApprovals={approvalCount}
        rejectedBlogCount={rejectedBlogCount}
        siteTitle={settings.siteTitle}
      />
      <main className="flex-1 bg-muted/30">{children}</main>
    </div>
  )
}
