import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Award, Clock, TrendingUp, CheckCircle2 } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { getSiteSettings } from "@/lib/site-settings"
import { buildSeoMetadata } from "@/lib/seo"
import { resolveAssetUrl } from "@/lib/asset-url"
import { getItemLinkTargetProps, resolveItemLinkHref } from "@/lib/item-link"
import { contentEndsWithSection, contentStartsWithSection } from "@/lib/section-page-layout"
import { RichContentRenderer } from "@/components/cms/rich-content-renderer"

export async function generateMetadata() {
  const settings = await getSiteSettings()
  const siteTitle = settings.siteTitle || "Our Company"
  const override = settings.staticSeo.training
  return buildSeoMetadata(settings, {
    title: override.title || "Training Programs",
    description:
      override.description || `Professional vibration analysis training and certification from ${siteTitle}`,
    keywords: override.keywords || undefined,
    ogImage: override.ogImage || undefined,
    canonical: override.canonical || undefined,
    noIndex: override.noIndex,
    noFollow: override.noFollow,
  })
}

export default async function TrainingPage() {
  const resolveItemLink = (link: string | null | undefined, fallback: string) =>
    resolveItemLinkHref(link, fallback)

  const courses = await prisma.trainingCourse.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: "asc" },
  })
  const siteSettings = await getSiteSettings()
  const pageConfig = siteSettings.sectionPageContent.training
  const startsWithSection = contentStartsWithSection(pageConfig.beforeListContent)
  const endsWithSection = contentEndsWithSection(pageConfig.afterListContent)

  return (
    <div className="flex flex-col min-h-screen">
      <Header settings={siteSettings} />

      <main className="flex-1">
        <section className={`${startsWithSection ? "pt-0" : "pt-16"} ${endsWithSection ? "pb-0" : "pb-16"} bg-muted/30`}>
          <div className="container mx-auto px-4 lg:px-8">
            {pageConfig.beforeListContent ? (
              <div className="mb-10">
                <RichContentRenderer content={pageConfig.beforeListContent} className="prose prose-lg max-w-none" />
              </div>
            ) : null}

            <div className="space-y-6">
              {courses?.map((course) => (
                <Card key={course.id} className="border-border hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 md:p-7">
                    <div className="space-y-5">
                      {course.featuredImage ? (
                        <img
                          src={resolveAssetUrl(course.featuredImage)}
                          alt={course.title}
                          className="w-full h-56 object-cover rounded-md border border-border/60"
                        />
                      ) : null}

                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0 flex-1 space-y-3">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-2xl font-bold text-balance">{course.title}</h3>
                            <Badge variant="secondary">{course.level}</Badge>
                          </div>
                          <p className="text-muted-foreground leading-relaxed">{course.description}</p>
                        </div>

                        <Button asChild className="w-full md:w-auto md:shrink-0">
                          <Link
                            href={resolveItemLink(course.linkUrl, "/contact")}
                            {...getItemLinkTargetProps(course.linkUrl)}
                          >
                            {course.linkLabel || "Enroll Now"}
                          </Link>
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-border/60 pt-3 text-sm text-muted-foreground">
                        {course.duration ? (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{course.duration}</span>
                          </div>
                        ) : null}
                        {course.provider ? (
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4" />
                            <span>{course.provider}</span>
                          </div>
                        ) : null}
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          <span>{course.level} Level</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
