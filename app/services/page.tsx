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
import { getItemLinkTargetProps, resolveItemLinkHref } from "@/lib/item-link"
import { RichContentRenderer } from "@/components/cms/rich-content-renderer"

export async function generateMetadata() {
  const settings = await getSiteSettings()
  const override = settings.staticSeo.services
  return buildSeoMetadata(settings, {
    title: override.title || "Services",
    description:
      override.description || "Explore our comprehensive software solutions and services for educational institutions and organizations.",
    keywords: override.keywords || undefined,
    ogImage: override.ogImage || undefined,
    canonical: override.canonical || undefined,
    noIndex: override.noIndex,
    noFollow: override.noFollow,
  })
}

export default async function ServicesPage() {
  const resolveItemLink = (link: string | null | undefined, fallback: string) =>
    resolveItemLinkHref(link, fallback)

  const services = await prisma.service.findMany({ orderBy: { displayOrder: "asc" } })
  const siteSettings = await getSiteSettings()
  const pageConfig = siteSettings.sectionPageContent.services

  return (
    <div className="flex flex-col min-h-screen">
      <Header settings={siteSettings} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 border-b border-border">
          <div className="container mx-auto px-4 lg:px-8 py-16">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-balance">Our Services</h1>
              <p className="text-lg text-muted-foreground text-pretty leading-relaxed">
                Comprehensive solutions designed to meet the unique needs of your organization
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 lg:px-8">
            {pageConfig.beforeListContent ? (
              <div className="mb-10">
                <RichContentRenderer content={pageConfig.beforeListContent} className="prose prose-lg max-w-none" />
              </div>
            ) : null}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => {
                const IconComponent = contentIconMap[service.icon as keyof typeof contentIconMap] || Package
                return (
                  <Card key={service.id} className="border-border hover:shadow-lg transition-shadow">
                    <CardContent className="p-6 space-y-4 min-h-[10rem]">
                      {service.imageUrl ? (
                        <img
                          src={resolveAssetUrl(service.imageUrl)}
                          alt={service.title}
                          className="w-full h-44 object-cover rounded-md border border-border/60"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <IconComponent className="h-6 w-6" />
                        </div>
                      )}
                      <h3 className="text-xl font-semibold">{service.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{service.description}</p>
                      <Button asChild variant="link" className="p-0">
                        <Link
                          href={resolveItemLink(service.linkUrl, "/services")}
                          {...getItemLinkTargetProps(service.linkUrl)}
                        >
                          {service.linkLabel || "Learn more"} <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
            {pageConfig.afterListContent ? (
              <div className="mt-10">
                <RichContentRenderer content={pageConfig.afterListContent} className="prose prose-lg max-w-none" />
              </div>
            ) : null}
          </div>
        </section>
      </main>

      <Footer settings={siteSettings} />
    </div>
  )
}
