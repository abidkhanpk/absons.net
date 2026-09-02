import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Building2 } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { getSiteSettings } from "@/lib/site-settings"
import { buildSeoMetadata } from "@/lib/seo"
import { contentIconMap } from "@/lib/content-icons"
import { resolveAssetUrl } from "@/lib/asset-url"
import { getImageFitClass } from "@/lib/image-fit"
import { findManyDepartmentsCompat } from "@/lib/department-compat"
import { getItemLinkTargetProps, resolveItemLinkHref } from "@/lib/item-link"
import { contentEndsWithSection, contentStartsWithSection } from "@/lib/section-page-layout"
import { RichContentRenderer } from "@/components/cms/rich-content-renderer"
import { resolveContentKeywordTokens } from "@/lib/content-keywords"
import { toPublicFooterSettings, toPublicHeaderSettings } from "@/lib/site-public-settings"

export async function generateMetadata() {
  const settings = await getSiteSettings()
  const override = settings.staticSeo.departments
  return buildSeoMetadata(settings, {
    title: override.title || "Departments",
    description: override.description || "Explore our core departments and their capabilities.",
    keywords: override.keywords || undefined,
    ogImage: override.ogImage || undefined,
    canonical: override.canonical || "/departments",
    noIndex: override.noIndex,
    noFollow: override.noFollow,
  })
}

export default async function DepartmentsPage() {
  const resolveItemLink = (link: string | null | undefined, fallback: string) =>
    resolveItemLinkHref(link, fallback)

  const [departments, siteSettings] = await Promise.all([
    findManyDepartmentsCompat(prisma, {
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
    }),
    getSiteSettings(),
  ])
  const pageConfig = siteSettings.sectionPageContent.departments
  const headerSettings = toPublicHeaderSettings(siteSettings)
  const footerSettings = toPublicFooterSettings(siteSettings)
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
            {departments.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {departments.map((department) => {
                  const IconComponent = contentIconMap[department.icon as keyof typeof contentIconMap] || Building2
                  const departmentTitle = resolveText(department.title)
                  const departmentDescription = resolveText(department.description)
                  const departmentLinkLabel = resolveText(department.linkLabel || "") || "Learn more"
                  return (
                    <Card key={department.id} className="border-border hover:shadow-lg transition-shadow h-full">
                      <CardContent className="p-6 h-full flex flex-col gap-4">
                        {department.imageUrl ? (
                          <img
                            src={resolveAssetUrl(department.imageUrl)}
                            alt={departmentTitle}
                            className={`w-full h-44 ${getImageFitClass((department as any).imageFitMode)} rounded-md border border-border/60`}
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg icon-tile">
                            <IconComponent className="h-6 w-6" />
                          </div>
                        )}
                        <h3 className="text-xl font-semibold">{departmentTitle}</h3>
                        <p className="text-muted-foreground leading-relaxed">{departmentDescription}</p>
                        <Button asChild variant="outline" className="w-full bg-transparent mt-auto">
                          <Link
                            href={resolveItemLink(department.linkUrl, "/departments")}
                            {...getItemLinkTargetProps(department.linkUrl)}
                          >
                            {departmentLinkLabel} <ArrowRight className="ml-2 h-4 w-4" />
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
                  <p className="text-lg font-medium mb-2">No departments yet</p>
                  <p className="text-muted-foreground">Add departments from admin to display them here.</p>
                </CardContent>
              </Card>
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
