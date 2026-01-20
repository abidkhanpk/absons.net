import Link from "next/link"
import { Plus, Calendar, Edit } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DeletePageButton } from "@/components/admin/delete-page-button"
import { getSession } from "@/lib/auth"
import { withRls } from "@/lib/prisma"

export default async function PagesManagementPage() {
  const session = await getSession()
  if (!session) return null

  const user = await withRls(session.userId, (tx) =>
    tx.user.findUnique({ where: { id: session.userId }, select: { role: true } }),
  )
  const isEditor = user?.role === "editor"

  const pages = await withRls(session.userId, (tx) =>
    tx.page.findMany({ where: isEditor ? { authorId: session.userId } : undefined, orderBy: { createdAt: "desc" } }),
  )

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pages</h1>
          <p className="text-muted-foreground mt-1">Create and manage site pages</p>
        </div>
        <Button asChild>
          <Link href="/admin/pages/new">
            <Plus className="mr-2 h-4 w-4" />
            New Page
          </Link>
        </Button>
      </div>

      {pages && pages.length > 0 ? (
        <div className="grid gap-4">
          {pages.map((page) => (
            <Card key={page.id} className="border-border">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-semibold">{page.title}</h3>
                      <Badge variant={page.published ? "default" : "secondary"}>
                        {page.published ? "Published" : "Draft"}
                      </Badge>
                      {page.rejectedAt ? (
                        <Badge variant="destructive">Rejected</Badge>
                      ) : page.resubmittedAt && !page.approved ? (
                        <Badge variant="outline">Resubmitted</Badge>
                      ) : (
                        !page.approved && <Badge variant="outline">Pending Approval</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">/{page.slug}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {page.publishedAt
                          ? new Date(page.publishedAt).toLocaleDateString()
                          : new Date(page.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/pages/edit/${page.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    {(!page.published || page.approved || page.rejectedAt) && <DeletePageButton pageId={page.id} />}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-border">
          <CardContent className="p-12 text-center">
            <p className="text-lg font-medium mb-2">No pages yet</p>
            <p className="text-muted-foreground mb-4">Create your first page to get started</p>
            <Button asChild>
              <Link href="/admin/pages/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Page
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
