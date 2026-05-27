import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { getSiteSettings } from "@/lib/site-settings"
import { buildSeoMetadata } from "@/lib/seo"
import { contentEndsWithSection, contentStartsWithSection } from "@/lib/section-page-layout"
import { RichContentRenderer } from "@/components/cms/rich-content-renderer"
import { resolveContentKeywordTokens } from "@/lib/content-keywords"

export async function generateMetadata() {
  const settings = await getSiteSettings()
  const override = settings.staticSeo.pricing
  return buildSeoMetadata(settings, {
    title: override.title || "Pricing",
    description: override.description || "Choose a plan that fits your stage and team requirements.",
    keywords: override.keywords || undefined,
    ogImage: override.ogImage || undefined,
    canonical: override.canonical || undefined,
    noIndex: override.noIndex,
    noFollow: override.noFollow,
  })
}

export default async function PricingPage() {
  const [plans, siteSettings] = await Promise.all([
    prisma.pricingPlan.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
    }),
    getSiteSettings(),
  ])
  const pageConfig = siteSettings.sectionPageContent.pricing
  const resolveText = (value: string | null | undefined) => resolveContentKeywordTokens(value || "", siteSettings)
  const beforeListContent = resolveContentKeywordTokens(pageConfig.beforeListContent, siteSettings)
  const afterListContent = resolveContentKeywordTokens(pageConfig.afterListContent, siteSettings)
  const startsWithSection = contentStartsWithSection(beforeListContent)
  const endsWithSection = contentEndsWithSection(afterListContent)

  return (
    <div className="flex flex-col min-h-screen">
      <Header settings={siteSettings} />

      <main className="flex-1">
        <section className={`${startsWithSection ? "pt-0" : "pt-16"} ${endsWithSection ? "pb-0" : "pb-16"} bg-background`}>
          <div className="container mx-auto px-4 lg:px-8">
            {beforeListContent ? (
              <div className={startsWithSection ? "mb-0" : "mb-10"}>
                <RichContentRenderer content={beforeListContent} className="prose prose-lg max-w-none" />
              </div>
            ) : null}
            {plans.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan) => {
                  const features = Array.isArray(plan.features)
                    ? plan.features.map((entry) => resolveText(String(entry))).filter(Boolean)
                    : []
                  const planName = resolveText(plan.name)
                  const planPrice = resolveText(plan.price)
                  const planPeriod = resolveText(plan.period || "")
                  return (
                    <Card key={plan.id} className="border-border hover:shadow-lg transition-shadow">
                      <CardContent className="p-6 space-y-5">
                        <div>
                          <h3 className="text-xl font-semibold">{planName}</h3>
                          <p className="mt-2 text-2xl font-bold">
                            {planPrice}
                            {planPeriod && <span className="text-sm font-normal text-muted-foreground">{planPeriod}</span>}
                          </p>
                        </div>
                        <ul className="space-y-2">
                          {features.map((feature) => (
                            <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <Check className="h-4 w-4 mt-0.5 text-primary" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                        <Button asChild variant="outline" className="w-full">
                          <Link href="/contact">Get Started</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <Card className="border-border">
                <CardContent className="p-12 text-center">
                  <p className="text-lg font-medium mb-2">No pricing plans yet</p>
                  <p className="text-muted-foreground">Add plans from admin to display them here.</p>
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

      <Footer settings={siteSettings} />
    </div>
  )
}
