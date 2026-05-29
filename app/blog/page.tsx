import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, Clock, ArrowRight } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { getSiteSettings } from "@/lib/site-settings"
import { buildSeoMetadata } from "@/lib/seo"
import { resolveAssetUrl } from "@/lib/asset-url"
import { contentEndsWithSection, contentStartsWithSection } from "@/lib/section-page-layout"
import { RichContentRenderer } from "@/components/cms/rich-content-renderer"
import { resolveContentKeywordTokens } from "@/lib/content-keywords"
import { toPublicFooterSettings, toPublicHeaderSettings } from "@/lib/site-public-settings"

const BLOG_CARD_EXCERPT_LENGTH = 255

function truncateExcerpt(excerpt: string, maxLength = BLOG_CARD_EXCERPT_LENGTH) {
  const normalizedExcerpt = excerpt.trim()

  if (normalizedExcerpt.length <= maxLength) return normalizedExcerpt

  const clippedExcerpt = normalizedExcerpt.slice(0, maxLength).trimEnd()
  const lastSpaceIndex = clippedExcerpt.lastIndexOf(" ")
  const truncatedExcerpt = lastSpaceIndex > maxLength * 0.6
    ? clippedExcerpt.slice(0, lastSpaceIndex)
    : clippedExcerpt

  return `${truncatedExcerpt}...`
}

export async function generateMetadata() {
  const settings = await getSiteSettings()
  const siteTitle = settings.siteTitle || "Our Company"
  const override = settings.staticSeo.blog
  return buildSeoMetadata(settings, {
    title: override.title || "Blog",
    description: override.description || `Latest news, insights, and updates from ${siteTitle}`,
    keywords: override.keywords || undefined,
    ogImage: override.ogImage || undefined,
    canonical: override.canonical || undefined,
    noIndex: override.noIndex,
    noFollow: override.noFollow,
  })
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string | string[] }>
}) {
  const resolvedSearchParams = await searchParams
  const siteSettings = await getSiteSettings()
  const headerSettings = toPublicHeaderSettings(siteSettings)
  const footerSettings = toPublicFooterSettings(siteSettings)
  const resolveText = (value: string | null | undefined) => resolveContentKeywordTokens(value || "", siteSettings)
  const pageConfig = siteSettings.sectionPageContent.blog
  const requestedView = Array.isArray(resolvedSearchParams?.view) ? resolvedSearchParams.view[0] : resolvedSearchParams?.view
  const blogListLayout = requestedView === "grid" || requestedView === "list"
    ? requestedView
    : pageConfig.listLayout === "grid"
      ? "grid"
      : "list"
  const beforeListContent = resolveContentKeywordTokens(pageConfig.beforeListContent, siteSettings)
  const afterListContent = resolveContentKeywordTokens(pageConfig.afterListContent, siteSettings)
  const startsWithSection = contentStartsWithSection(beforeListContent)
  const endsWithSection = contentEndsWithSection(afterListContent)
  const approvalRequired = siteSettings.editorApprovalRequired ?? true
  const posts = await prisma.blogPost.findMany({
    where: approvalRequired ? { published: true, approved: true } : { published: true },
    orderBy: { publishedAt: "desc" },
  })

  return (
    <div className="flex flex-col min-h-screen">
      <Header settings={headerSettings} />

      <main className="flex-1">
        <section className={`${startsWithSection ? "pt-0" : "pt-16"} ${endsWithSection ? "pb-0" : "pb-16"} bg-background`}>
          <div className="container mx-auto px-4 lg:px-8">
            {beforeListContent ? (
              <div className={startsWithSection ? "mb-0" : "mb-10"}>
                <RichContentRenderer content={beforeListContent} className="prose prose-lg max-w-none" />
              </div>
            ) : null}
            {posts && posts.length > 0 ? (
              <div className="mb-6 flex items-center justify-end gap-2">
                <Button asChild variant={blogListLayout === "list" ? "default" : "outline"} size="sm">
                  <Link href="/blog?view=list">List View</Link>
                </Button>
                <Button asChild variant={blogListLayout === "grid" ? "default" : "outline"} size="sm">
                  <Link href="/blog?view=grid">Grid View</Link>
                </Button>
              </div>
            ) : null}
            {posts && posts.length > 0 ? (
              blogListLayout === "grid" ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {posts.map((post) => {
                    const postTitle = resolveText(post.title)
                    const postExcerpt = resolveText(post.excerpt)
                    const postExcerptPreview = truncateExcerpt(postExcerpt)
                    const postCategory = resolveText(post.category || "News")
                    return (
                      <Card key={post.id} className="border-border hover:shadow-lg transition-shadow flex flex-col">
                        <CardContent className="p-6 space-y-4 flex flex-col flex-1">
                          {post.featuredImage && (
                            <div className="w-full h-48 bg-muted rounded-lg overflow-hidden">
                              <img
                                src={resolveAssetUrl(post.featuredImage) || "/placeholder.svg"}
                                alt={postTitle}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex flex-col gap-2">
                            <h3 className="text-xl font-semibold line-clamp-2">{postTitle}</h3>
                          </div>
                          <div className="flex-1">
                            <p className="text-muted-foreground leading-relaxed">
                              {postExcerptPreview}{" "}
                              <Link
                                href={`/blog/${post.slug}`}
                                className="ml-2 inline-flex items-center gap-2 whitespace-nowrap text-primary font-medium hover:gap-3 transition-all"
                              >
                                Read more <ArrowRight className="h-4 w-4" />
                              </Link>
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border">
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                              <Badge variant="secondary" className="w-fit">
                                {postCategory}
                              </Badge>
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
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <div className="space-y-6">
                  {posts.map((post) => {
                    const postTitle = resolveText(post.title)
                    const postExcerpt = resolveText(post.excerpt)
                    const postExcerptPreview = truncateExcerpt(postExcerpt)
                    const postCategory = resolveText(post.category || "News")
                    return (
                      <Card key={post.id} className="border-border hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex flex-col gap-6 md:flex-row">
                            {post.featuredImage ? (
                              <div className="w-full md:w-72 h-48 md:h-44 bg-muted rounded-lg overflow-hidden shrink-0">
                                <img
                                  src={resolveAssetUrl(post.featuredImage) || "/placeholder.svg"}
                                  alt={postTitle}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : null}
                            <div className="flex-1 flex flex-col gap-4">
                              <div className="flex flex-col gap-2">
                                <h3 className="text-2xl font-semibold line-clamp-2">{postTitle}</h3>
                              </div>
                              <div>
                                <p className="text-muted-foreground leading-relaxed">
                                  {postExcerptPreview}{" "}
                                  <Link
                                    href={`/blog/${post.slug}`}
                                    className="ml-2 inline-flex items-center gap-2 whitespace-nowrap text-primary font-medium hover:gap-3 transition-all"
                                  >
                                    Read more <ArrowRight className="h-4 w-4" />
                                  </Link>
                                </p>
                              </div>
                              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border">
                                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                  <Badge variant="secondary" className="w-fit">
                                    {postCategory}
                                  </Badge>
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
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">No blog posts available yet. Check back soon!</p>
              </div>
            )}
            {afterListContent ? (
              <div className={endsWithSection ? "mt-0" : "mt-10"}>
                <RichContentRenderer content={afterListContent} className="prose prose-lg max-w-none" />
              </div>
            ) : null}
          </div>
        </section>
      </main>

      <Footer settings={footerSettings} />
    </div>
  )
}
