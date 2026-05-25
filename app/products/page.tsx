import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowRight, Package, CheckCircle2 } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { getSiteSettings } from "@/lib/site-settings"
import { buildSeoMetadata } from "@/lib/seo"
import { contentIconMap } from "@/lib/content-icons"
import { resolveAssetUrl } from "@/lib/asset-url"
import { findManyProductsCompat } from "@/lib/product-compat"
import { getItemLinkTargetProps, resolveItemLinkHref } from "@/lib/item-link"
import { RichContentRenderer } from "@/components/cms/rich-content-renderer"

export async function generateMetadata() {
  const settings = await getSiteSettings()
  const override = settings.staticSeo.products
  return buildSeoMetadata(settings, {
    title: override.title || "Products",
    description:
      override.description || "Explore our software products and operational tools built for organizations and institutions.",
    keywords: override.keywords || undefined,
    ogImage: override.ogImage || undefined,
    canonical: override.canonical || undefined,
    noIndex: override.noIndex,
    noFollow: override.noFollow,
  })
}

export default async function ProductsPage() {
  const resolveItemLink = (link: string | null | undefined, fallback: string) =>
    resolveItemLinkHref(link, fallback)

  const [products, siteSettings] = await Promise.all([
    findManyProductsCompat(prisma, {
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
    }),
    getSiteSettings(),
  ])
  const pageConfig = siteSettings.staticSeo.products

  return (
    <div className="flex flex-col min-h-screen">
      <Header settings={siteSettings} />

      <main className="flex-1">
        <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 border-b border-border">
          <div className="container mx-auto px-4 lg:px-8 py-16">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-balance">Our Products</h1>
              <p className="text-lg text-muted-foreground text-pretty leading-relaxed">
                Ready-to-deploy products that improve delivery speed, visibility, and control.
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
            {products.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => {
                  const IconComponent = contentIconMap[product.icon as keyof typeof contentIconMap] || Package
                  return (
                    <Card key={product.id} className="border-border hover:shadow-lg transition-shadow h-full">
                      <CardContent className="p-6 h-full flex flex-col gap-4">
                        {product.imageUrl ? (
                          <img
                            src={resolveAssetUrl(product.imageUrl)}
                            alt={product.title}
                            className="w-full h-44 object-cover rounded-md border border-border/60"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <IconComponent className="h-6 w-6" />
                          </div>
                        )}
                        <div className="flex flex-wrap items-center gap-2">
                          {product.isFeatured ? <Badge>Featured</Badge> : null}
                          {product.tags.slice(0, 3).map((tag) => (
                            <Badge key={`${product.id}-${tag}`} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <h3 className="text-xl font-semibold">{product.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">{product.description}</p>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                            <span className="text-muted-foreground">Scalable architecture</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                            <span className="text-muted-foreground">Operational reporting</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                            <span className="text-muted-foreground">Role-based access support</span>
                          </li>
                        </ul>
                        <Button asChild variant="outline" className="w-full bg-transparent mt-auto">
                          <Link
                            href={resolveItemLink(product.linkUrl, "/products")}
                            {...getItemLinkTargetProps(product.linkUrl)}
                          >
                            {product.linkLabel || "Explore product"} <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <Card className="border-border">
                <CardContent className="p-12 text-center">
                  <p className="text-lg font-medium mb-2">No products yet</p>
                  <p className="text-muted-foreground">Add products from admin to display them here.</p>
                </CardContent>
              </Card>
            )}
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
