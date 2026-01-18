import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, Calendar, Edit } from "lucide-react"
import { DeleteBlogButton } from "@/components/admin/delete-blog-button"
import { getSession } from "@/lib/auth"
import { withRls } from "@/lib/prisma"

export default async function BlogManagementPage() {
  const session = await getSession()
  if (!session) return null

  const user = await withRls(session.userId, (tx) =>
    tx.user.findUnique({ where: { id: session.userId }, select: { role: true } }),
  )
  const isEditor = user?.role === "editor"

  const posts = await withRls(session.userId, (tx) =>
    tx.blogPost.findMany({
      where: isEditor ? { authorId: session.userId } : undefined,
      orderBy: { createdAt: "desc" },
    }),
  )

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blog Posts</h1>
          <p className="text-muted-foreground mt-1">Create and manage blog content</p>
        </div>
        <Button asChild>
          <Link href="/admin/blog/new">
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Link>
        </Button>
      </div>

      {/* Posts List */}
      {posts && posts.length > 0 ? (
        <div className="grid gap-4">
          {posts.map((post) => (
            <Card key={post.id} className="border-border">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-semibold">{post.title}</h3>
                      <Badge variant={post.published ? "default" : "secondary"}>
                        {post.published ? "Published" : "Draft"}
                      </Badge>
                      {!post.approved && <Badge variant="outline">Pending Approval</Badge>}
                    </div>
                    <p className="text-muted-foreground line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {post.publishedAt
                          ? new Date(post.publishedAt).toLocaleDateString()
                          : new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/blog/edit/${post.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <DeleteBlogButton postId={post.id} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-border">
          <CardContent className="p-12 text-center">
            <p className="text-lg font-medium mb-2">No blog posts yet</p>
            <p className="text-muted-foreground mb-4">Create your first blog post to get started</p>
            <Button asChild>
              <Link href="/admin/blog/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Post
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
