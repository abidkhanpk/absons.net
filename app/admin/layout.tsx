import type React from "react"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { withRls } from "@/lib/prisma"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

export const metadata = {
  title: "Admin Dashboard - ABSON Solutions CMS",
  description: "Content Management System for ABSON Solutions",
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect("/auth/login")

  const adminUser = await withRls(session.userId, (db) =>
    db.user.findFirst({ where: { id: session.userId, role: { in: ["admin", "super_admin", "editor"] } } }),
  )
  if (!adminUser) redirect("/auth/login")

  const approvalCount =
    adminUser.role === "admin" || adminUser.role === "super_admin"
      ? await withRls(session.userId, async (db) => {
          const [posts, pages] = await Promise.all([
            db.blogPost.count({ where: { published: true, approved: false } }),
            db.page.count({ where: { published: true, approved: false } }),
          ])
          return posts + pages
        })
      : 0

  return (
    <div className="flex min-h-screen">
      <AdminSidebar user={{ id: adminUser.id, email: adminUser.email, role: adminUser.role }} pendingApprovals={approvalCount} />
      <main className="flex-1 bg-muted/30">{children}</main>
    </div>
  )
}
