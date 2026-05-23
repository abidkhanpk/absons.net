import { notFound } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { prisma } from "@/lib/prisma"
import { getSiteSettings } from "@/lib/site-settings"
import { buildSeoMetadata } from "@/lib/seo"
import { RichContentRenderer } from "@/components/cms/rich-content-renderer"
import { resolveContentKeywordTokens } from "@/lib/content-keywords"

export const dynamic = "force-dynamic"
export const revalidate = 0

function resolveSlugFromParams(slugParts: string[] | undefined) {
  const parts = Array.isArray(slugParts) ? slugParts.filter(Boolean) : []
  return parts.join("/")
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params
  const resolvedSlug = resolveSlugFromParams(slug)
  if (!resolvedSlug) {
    return buildSeoMetadata(await getSiteSettings(), { title: "Page Not Found", noIndex: true, noFollow: true })
  }
  const settings = await getSiteSettings()
  const approvalRequired = settings.editorApprovalRequired ?? true
  const page = await prisma.page.findFirst({
    where: approvalRequired ? { slug: resolvedSlug, published: true, approved: true } : { slug: resolvedSlug, published: true },
  })

  if (!page) {
    return buildSeoMetadata(settings, { title: "Page Not Found", noIndex: true, noFollow: true })
  }

  const canonicalBase = settings.seoDefaultCanonicalBase?.replace(/\/$/, "")
  const canonical = page.seoCanonicalUrl || (canonicalBase ? `${canonicalBase}/${page.slug}` : undefined)

  return buildSeoMetadata(settings, {
    title: page.seoTitle || page.title,
    description: page.seoDescription || undefined,
    keywords: page.seoKeywords || undefined,
    ogImage: page.seoOgImage || undefined,
    canonical,
    noIndex: page.seoNoIndex,
    noFollow: page.seoNoFollow,
  })
}

export default async function ContentPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params
  const resolvedSlug = resolveSlugFromParams(slug)
  if (!resolvedSlug) return notFound()
  const siteSettings = await getSiteSettings()
  const approvalRequired = siteSettings.editorApprovalRequired ?? true
  const page = await prisma.page.findFirst({
    where: approvalRequired ? { slug: resolvedSlug, published: true, approved: true } : { slug: resolvedSlug, published: true },
  })
  if (!page) return notFound()
  const resolvedContent = resolveContentKeywordTokens(page.content || "", siteSettings)

  return (
    <div className="flex flex-col min-h-screen">
      <Header settings={siteSettings} />

      <main className="flex-1">
        <section className="border-b border-border bg-muted/20">
          <div className="container mx-auto px-4 lg:px-8 cms-page-title-wrap">
            <h1 className="cms-page-title">{page.title}</h1>
          </div>
        </section>

        <section className="cms-page-content-wrap">
          <div className="container mx-auto px-4 lg:px-8">
            <RichContentRenderer content={resolvedContent} className="prose prose-lg max-w-none" />
          </div>
        </section>
      </main>

      <Footer settings={siteSettings} />
    </div>
  )
}
