import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getSiteSettings } from "@/lib/site-settings"
import { buildSeoMetadata } from "@/lib/seo"
import { resolveAssetUrl } from "@/lib/asset-url"
import { RichContentRenderer } from "@/components/cms/rich-content-renderer"
import { resolveContentKeywordTokens } from "@/lib/content-keywords"
import { toPublicFooterSettings, toPublicHeaderSettings } from "@/lib/site-public-settings"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const settings = await getSiteSettings()
  const approvalRequired = settings.editorApprovalRequired ?? true
  const post = await prisma.blogPost.findFirst({
    where: approvalRequired ? { slug, published: true, approved: true } : { slug, published: true },
  })

  if (!post) {
    return buildSeoMetadata(settings, { title: "Post Not Found", noIndex: true, noFollow: true })
  }

  const canonicalBase = settings.seoDefaultCanonicalBase?.replace(/\/$/, "")
  const canonical = post.seoCanonicalUrl || (canonicalBase ? `${canonicalBase}/blog/${post.slug}` : undefined)

  return buildSeoMetadata(settings, {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    keywords: post.seoKeywords || undefined,
    ogImage: post.seoOgImage || post.featuredImage || undefined,
    canonical,
    noIndex: post.seoNoIndex,
    noFollow: post.seoNoFollow,
  })
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const siteSettings = await getSiteSettings()
  const headerSettings = toPublicHeaderSettings(siteSettings)
  const footerSettings = toPublicFooterSettings(siteSettings)
  const approvalRequired = siteSettings.editorApprovalRequired ?? true
  const post = await prisma.blogPost.findFirst({
    where: approvalRequired ? { slug, published: true, approved: true } : { slug, published: true },
  })

  if (!post) {
    notFound()
  }
  const resolveText = (value: string | null | undefined) => resolveContentKeywordTokens(value || "", siteSettings)
  const postTitle = resolveText(post.title)
  const resolvedContent = resolveContentKeywordTokens(post.content || "", siteSettings)

  return (
    <div className="flex flex-col min-h-screen">
      <Header settings={headerSettings} />

      <main className="flex-1">
        <article className="py-16 bg-background">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <Button asChild variant="ghost" className="mb-8">
                <Link href="/blog">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Blog
                </Link>
              </Button>

              {post.featuredImage && (
                <div className="w-full h-96 bg-muted rounded-lg overflow-hidden mb-8">
                  <img
                    src={resolveAssetUrl(post.featuredImage) || "/placeholder.svg"}
                    alt={postTitle}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="space-y-4 mb-8 cms-page-title-wrap">
                <h1 className="cms-page-title text-balance">{postTitle}</h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <time dateTime={post.publishedAt ?? undefined}>
                    {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ""}
                  </time>
                </div>
              </div>

              <RichContentRenderer content={resolvedContent} className="prose prose-lg max-w-none" />
            </div>
          </div>
        </article>
      </main>

      <Footer settings={footerSettings} />
    </div>
  )
}
