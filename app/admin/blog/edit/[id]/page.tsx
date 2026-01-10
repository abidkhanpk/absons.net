import { BlogForm } from "@/components/admin/blog-form"
import { notFound } from "next/navigation"
import { withRls } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const session = await getSession()
  if (!session) notFound()

  const post = await withRls(session.userId, (tx) => tx.blogPost.findUnique({ where: { id } }))

  if (!post) {
    notFound()
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Blog Post</h1>
        <p className="text-muted-foreground mt-1">Update your blog post content</p>
      </div>

      <BlogForm post={post} />
    </div>
  )
}
