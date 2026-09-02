import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Package, ArrowRight } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { getSiteSettings } from "@/lib/site-settings"
import { buildSeoMetadata } from "@/lib/seo"
import { contentIconMap } from "@/lib/content-icons"
import { resolveAssetUrl } from "@/lib/asset-url"
import { getImageFitClass } from "@/lib/image-fit"
import { getItemLinkTargetProps, resolveItemLinkHref } from "@/lib/item-link"
import { contentEndsWithSection, contentStartsWithSection } from "@/lib/section-page-layout"
import { RichContentRenderer } from "@/components/cms/rich-content-renderer"
import { resolveContentKeywordTokens } from "@/lib/content-keywords"
import { toPublicFooterSettings, toPublicHeaderSettings } from "@/lib/site-public-settings"

export async function generateMetadata() {
  const settings = await getSiteSettings()
  const override = settings.staticSeo.services
  return buildSeoMetadata(settings, {
    title: override.title || "Services",
    description:
      override.description || "Explore our comprehensive software solutions and services for educational institutions and organizations.",
    keywords: override.keywords || undefined,
    ogImage: override.ogImage || undefined,
    canonical: override.canonical || "/services",
    noIndex: override.noIndex,
    noFollow: override.noFollow,
  })
}

export default async function ServicesPage() {
  const resolveItemLink = (link: string | null | undefined, fallback: string) =>
    resolveItemLinkHref(link, fallback)

  const services = await prisma.service.findMany({ orderBy: { displayOrder: "asc" } })
  const siteSettings = await getSiteSettings()
  const headerSettings = toPublicHeaderSettings(siteSettings)
  const footerSettings = toPublicFooterSettings(siteSettings)
  const pageConfig = siteSettings.sectionPageContent.services
  const resolveText = (value: string | null | undefined) => resolveContentKeywordTokens(value || "", siteSettings)
  const beforeListContent = resolveContentKeywordTokens(pageConfig.beforeListContent, siteSettings)
  const afterListContent = resolveContentKeywordTokens(pageConfig.afterListContent, siteSettings)
  const startsWithSection = contentStartsWithSection(beforeListContent)
  const endsWithSection = contentEndsWithSection(afterListContent)

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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => {
                const IconComponent = contentIconMap[service.icon as keyof typeof contentIconMap] || Package
                const serviceTitle = resolveText(service.title)
                const serviceDescription = resolveText(service.description)
                const serviceLinkLabel = resolveText(service.linkLabel || "") || "Learn more"
                return (
                  <Card key={service.id} className="border-border hover:shadow-lg transition-shadow">
                    <CardContent className="p-6 space-y-4 min-h-[10rem]">
                      {service.imageUrl ? (
                        <img
                          src={resolveAssetUrl(service.imageUrl)}
                          alt={serviceTitle}
                        className={`w-full h-44 ${getImageFitClass(service.imageFitMode)} rounded-md border border-border/60`}
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg icon-tile">
                          <IconComponent className="h-6 w-6" />
                        </div>
                      )}
                      <h3 className="text-xl font-semibold">{serviceTitle}</h3>
                      <p className="text-muted-foreground leading-relaxed">{serviceDescription}</p>
                      <Button asChild variant="link" className="p-0">
                        <Link
                          href={resolveItemLink(service.linkUrl, "/services")}
                          {...getItemLinkTargetProps(service.linkUrl)}
                        >
                          {serviceLinkLabel} <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
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
