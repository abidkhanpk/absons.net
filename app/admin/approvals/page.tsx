import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getSession } from "@/lib/auth"
import { withRls } from "@/lib/prisma"
import { ApprovalsList } from "@/components/admin/approvals-list"

type PendingItem = {
  id: string
  title: string
  type: "blog" | "page"
  authorId: string | null
  createdAt: Date
}

export default async function ApprovalsPage() {
  const session = await getSession()
  if (!session) redirect("/auth/login")

  const currentUser = await withRls(session.userId, (tx) =>
    tx.user.findUnique({ where: { id: session.userId }, select: { role: true } }),
  )
  if (!currentUser) redirect("/auth/login")
  if (currentUser.role !== "admin" && currentUser.role !== "super_admin") redirect("/admin")

  const [pendingPosts, pendingPages] = await withRls(session.userId, (tx) =>
    Promise.all([
      tx.blogPost.findMany({
        where: { published: true, approved: false },
        select: { id: true, title: true, authorId: true, createdAt: true, publishedAt: true },
        orderBy: { createdAt: "desc" },
      }),
      tx.page.findMany({
        where: { published: true, approved: false },
        select: { id: true, title: true, authorId: true, createdAt: true, publishedAt: true },
        orderBy: { createdAt: "desc" },
      }),
    ]),
  )

  const pendingItems: PendingItem[] = [
    ...pendingPosts.map((post) => ({ ...post, type: "blog" as const })),
    ...pendingPages.map((page) => ({ ...page, type: "page" as const })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

  const authorIds = Array.from(new Set(pendingItems.map((item) => item.authorId).filter(Boolean))) as string[]
  const authors = authorIds.length
    ? await withRls(session.userId, (tx) =>
        tx.user.findMany({ where: { id: { in: authorIds } }, select: { id: true, fullName: true, email: true } }),
      )
    : []
  const authorMap = new Map(authors.map((author) => [author.id, author]))

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Approvals</h1>
        <p className="text-muted-foreground mt-1">Review editor submissions before publishing them publicly.</p>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Pending Approvals</CardTitle>
          <CardDescription>
            {pendingItems.length > 0
              ? `${pendingItems.length} item${pendingItems.length === 1 ? "" : "s"} awaiting approval`
              : "No items are waiting for approval."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ApprovalsList
            items={pendingItems.map((item) => ({
              id: item.id,
              title: item.title,
              type: item.type,
              author: item.authorId ? authorMap.get(item.authorId) ?? null : null,
            }))}
          />
        </CardContent>
      </Card>
    </div>
  )
}
