import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Calendar, Clock, ArrowRight } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { getSiteSettings } from "@/lib/site-settings"

export const metadata = {
  title: "Blog - ABSON Solutions",
  description: "Latest news, insights, and updates from ABSON Solutions",
}

export default async function BlogPage() {
  const siteSettings = await getSiteSettings()
  const approvalRequired = siteSettings.editorApprovalRequired ?? true
  const posts = await prisma.blogPost.findMany({
    where: approvalRequired ? { published: true, approved: true } : { published: true },
    orderBy: { publishedAt: "desc" },
  })

  return (
    <div className="flex flex-col min-h-screen">
      <Header settings={siteSettings} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 border-b border-border">
          <div className="container mx-auto px-4 lg:px-8 py-16">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-balance">Blog & News</h1>
              <p className="text-lg text-muted-foreground text-pretty leading-relaxed">
                Stay updated with the latest insights, news, and updates from ABSON Solutions
              </p>
            </div>
          </div>
        </section>

        {/* Blog Posts */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 lg:px-8">
            {posts && posts.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <Card key={post.id} className="border-border hover:shadow-lg transition-shadow flex flex-col">
                    <CardContent className="p-6 space-y-4 flex flex-col flex-1">
                      {post.featuredImage && (
                        <div className="w-full h-48 bg-muted rounded-lg overflow-hidden">
                          <img
                            src={post.featuredImage || "/placeholder.svg"}
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex flex-col gap-2">
                        <Badge variant="secondary" className="w-fit">
                          News
                        </Badge>
                        <h3 className="text-xl font-semibold line-clamp-2">{post.title}</h3>
                      </div>
                      <p className="text-muted-foreground leading-relaxed line-clamp-3 flex-1">{post.excerpt}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground pt-4 border-t border-border">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ""}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>5 min read</span>
                        </div>
                      </div>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
                      >
                        Read more <ArrowRight className="h-4 w-4" />
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">No blog posts available yet. Check back soon!</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer settings={siteSettings} />
    </div>
  )
}
