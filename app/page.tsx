import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Fragment, type ReactNode } from "react"
import { GraduationCap, BookOpen, School, Award, Activity, Package, ArrowRight, Star, Check } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { getSiteSettings } from "@/lib/site-settings"
import { HeroSlider } from "@/components/hero-slider"
import { WhyChooseSectionClient } from "@/components/home/why-choose-section-client"
import { ScrollingLoop } from "@/components/home/scrolling-loop"
import { buildSeoMetadata } from "@/lib/seo"

// Ensure the homepage is served dynamically so it can gracefully handle missing data in production
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function generateMetadata() {
  const settings = await getSiteSettings()
  const override = settings.staticSeo.home
  return buildSeoMetadata(settings, {
    title: override.title || settings.seoDefaultTitle || settings.siteTitle,
    description: override.description || settings.seoDefaultDescription || undefined,
    keywords: override.keywords || undefined,
    ogImage: override.ogImage || undefined,
    canonical: override.canonical || undefined,
    noIndex: override.noIndex,
    noFollow: override.noFollow,
  })
}

const iconMap = {
  GraduationCap,
  BookOpen,
  School,
  Award,
  Activity,
  Package,
}

type HomeSectionId = "services" | "products" | "pricing" | "training" | "testimonials" | "why-choose"

export default async function HomePage() {
  const resolveItemLink = (link: string | null | undefined, fallback: string) =>
    typeof link === "string" && link.trim() ? link.trim() : fallback

  const services = await prisma.service
    .findMany({
      where: { isFeatured: true },
      orderBy: { displayOrder: "asc" },
      take: 3,
    })
    .catch((error) => {
      console.error("Failed to load services, using empty list:", error)
      return []
    })

  const testimonials = await prisma.testimonial
    .findMany({
      where: { isFeatured: true },
      take: 3,
    })
    .catch((error) => {
      console.error("Failed to load testimonials, using empty list:", error)
      return []
    })
  const trainings = await prisma.trainingCourse
    .findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
      take: 3,
    })
    .catch((error) => {
      console.error("Failed to load training courses, using empty list:", error)
      return []
    })
  const products = await prisma.product
    .findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
      take: 6,
    })
    .catch((error) => {
      console.error("Failed to load products, using empty list:", error)
      return []
    })
  const pricingPlans = await prisma.pricingPlan
    .findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
      take: 6,
    })
    .catch((error) => {
      console.error("Failed to load pricing plans, using empty list:", error)
      return []
    })

  const siteSettings = await getSiteSettings()
  const defaultSectionConfig: Record<
    HomeSectionId,
    {
      title: string
      subtitle: string
      itemsLayout: "grid" | "scroll"
      mobileLayout: "match" | "grid" | "scroll"
      scrollSpeed: number
      pauseOnHover: boolean
      dragEnabled: boolean
    }
  > = {
    services: {
      title: "Our Services",
      subtitle: "Comprehensive solutions tailored to your organization's specific needs",
      itemsLayout: "grid",
      mobileLayout: "match",
      scrollSpeed: 30,
      pauseOnHover: true,
      dragEnabled: true,
    },
    products: {
      title: "Our Products",
      subtitle: "Ready-to-deploy products that help your teams launch faster and operate with confidence.",
      itemsLayout: "grid",
      mobileLayout: "match",
      scrollSpeed: 30,
      pauseOnHover: true,
      dragEnabled: true,
    },
    pricing: {
      title: "Pricing",
      subtitle: "Transparent plans for organizations at different stages, with support included.",
      itemsLayout: "grid",
      mobileLayout: "match",
      scrollSpeed: 30,
      pauseOnHover: true,
      dragEnabled: true,
    },
    training: {
      title: "Training Programs",
      subtitle: "Vibration analysis training aligned with Mobius Institute standards.",
      itemsLayout: "grid",
      mobileLayout: "match",
      scrollSpeed: 30,
      pauseOnHover: true,
      dragEnabled: true,
    },
    testimonials: {
      title: "What Our Clients Say",
      subtitle: "Trusted by institutions and organizations across the region",
      itemsLayout: "grid",
      mobileLayout: "match",
      scrollSpeed: 30,
      pauseOnHover: true,
      dragEnabled: true,
    },
    "why-choose": {
      title: "Why Choose Us",
      subtitle: "Trusted by educational institutions and organizations across Pakistan",
      itemsLayout: "grid",
      mobileLayout: "match",
      scrollSpeed: siteSettings.whyChooseScrollSpeed || 30,
      pauseOnHover: true,
      dragEnabled: true,
    },
  }
  const sectionConfigMap = new Map(siteSettings.homeSections.map((section) => [section.id, section]))
  const getSectionConfig = (id: HomeSectionId) => {
    const section = sectionConfigMap.get(id)
    const fallback =
      id === "why-choose"
        ? {
            title: siteSettings.whyChooseTitle || defaultSectionConfig[id].title,
            subtitle: siteSettings.whyChooseSubtitle || defaultSectionConfig[id].subtitle,
            itemsLayout: siteSettings.whyChooseLayout || defaultSectionConfig[id].itemsLayout,
            mobileLayout: siteSettings.whyChooseMobileLayout || defaultSectionConfig[id].mobileLayout,
            scrollSpeed: siteSettings.whyChooseScrollSpeed || defaultSectionConfig[id].scrollSpeed,
            pauseOnHover: defaultSectionConfig[id].pauseOnHover,
            dragEnabled: defaultSectionConfig[id].dragEnabled,
          }
        : defaultSectionConfig[id]
    return {
      title: section?.title?.trim() || fallback.title,
      subtitle: section?.subtitle?.trim() || fallback.subtitle,
      itemsLayout: section?.itemsLayout === "scroll" ? "scroll" : fallback.itemsLayout,
      mobileLayout:
        section?.mobileLayout === "grid" || section?.mobileLayout === "scroll"
          ? section.mobileLayout
          : fallback.mobileLayout,
      scrollSpeed:
        typeof section?.scrollSpeed === "number" && Number.isFinite(section.scrollSpeed)
          ? Math.min(120, Math.max(5, Math.round(section.scrollSpeed)))
          : fallback.scrollSpeed,
      pauseOnHover: typeof section?.pauseOnHover === "boolean" ? section.pauseOnHover : fallback.pauseOnHover,
      dragEnabled: typeof section?.dragEnabled === "boolean" ? section.dragEnabled : fallback.dragEnabled,
    }
  }
  const renderSectionItems = <T,>(
    sectionId: HomeSectionId,
    items: T[],
    renderCard: (item: T, index: number) => ReactNode,
    keyForItem: (item: T, index: number) => string,
  ) => {
    const { itemsLayout, mobileLayout, scrollSpeed, pauseOnHover, dragEnabled } = getSectionConfig(sectionId)
    const desktopScroll = itemsLayout === "scroll"
    const mobileResolvedLayout = mobileLayout === "match" ? itemsLayout : mobileLayout
    const mobileScroll = mobileResolvedLayout === "scroll"

    const renderScroll = (className: string) => {
      const scrollingItems = items.length > 1 ? [...items, ...items] : items
      return (
        <ScrollingLoop
          durationSeconds={scrollSpeed || 30}
          pauseOnHover={pauseOnHover}
          dragEnabled={dragEnabled}
          className={className}
          trackClassName="home-section-track"
        >
          {scrollingItems.map((item, index) => (
            <div key={`${keyForItem(item, index)}-${index}`} className="home-section-scroll-card">
              {renderCard(item, index)}
            </div>
          ))}
        </ScrollingLoop>
      )
    }
    const renderGrid = (className: string) => (
      <div className={className}>{items.map((item, index) => renderCard(item, index))}</div>
    )

    if (desktopScroll === mobileScroll) {
      return desktopScroll ? renderScroll("home-section-scroll") : renderGrid("grid md:grid-cols-3 gap-6")
    }
    return (
      <>
        {mobileScroll
          ? renderScroll("home-section-scroll md:hidden")
          : renderGrid("grid gap-6 md:hidden")}
        {desktopScroll
          ? renderScroll("home-section-scroll hidden md:block")
          : renderGrid("hidden md:grid md:grid-cols-3 gap-6")}
      </>
    )
  }
  const homeSectionBlocks = {
    services: (
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{getSectionConfig("services").title}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
              {getSectionConfig("services").subtitle}
            </p>
          </div>

          {renderSectionItems(
            "services",
            services || [],
            (service) => {
              const IconComponent = iconMap[service.icon as keyof typeof iconMap] || Package
              return (
                <Card key={service.id} className="border-border hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 space-y-4">
                    {service.imageUrl ? (
                      <img
                        src={service.imageUrl}
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
                      <Link href={resolveItemLink(service.linkUrl, "/services")}>
                        Learn more <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            },
            (service) => service.id,
          )}

          <div className="text-center mt-8">
            <Button asChild variant="outline" size="lg">
              <Link href="/services">View All Services</Link>
            </Button>
          </div>
        </div>
      </section>
    ),
    products: (
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{getSectionConfig("products").title}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
              {getSectionConfig("products").subtitle}
            </p>
          </div>

          {renderSectionItems(
            "products",
            products.length > 0
              ? products.map((product) => ({
                  id: product.id,
                  title: product.title,
                  description: product.description,
                  imageUrl: product.imageUrl,
                  linkUrl: product.linkUrl,
                  linkLabel: product.linkLabel || "Explore product",
                }))
              : [
                  {
                    id: "fallback-product-1",
                    title: "Education Suite",
                    description: "Admissions, attendance, exams, and fee tracking designed for schools and institutions.",
                    imageUrl: "",
                    linkUrl: "/products",
                    linkLabel: "Explore product",
                  },
                  {
                    id: "fallback-product-2",
                    title: "Operations Dashboard",
                    description: "One place to monitor workflows, team activity, and key performance indicators.",
                    imageUrl: "",
                    linkUrl: "/products",
                    linkLabel: "Explore product",
                  },
                  {
                    id: "fallback-product-3",
                    title: "Reporting Toolkit",
                    description: "Actionable analytics and export-ready reports for leadership and stakeholders.",
                    imageUrl: "",
                    linkUrl: "/products",
                    linkLabel: "Explore product",
                  },
                ],
            (product) => (
              <Card key={product.id} className="border-border hover:shadow-lg transition-shadow h-full">
                <CardContent className="p-6 h-full flex flex-col gap-4">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-full h-44 object-cover rounded-md border border-border/60"
                    />
                  ) : null}
                  <h3 className="text-xl font-semibold">{product.title}</h3>
                  <p className="text-muted-foreground leading-relaxed flex-1">{product.description}</p>
                  <Button asChild variant="link" className="p-0 mt-auto self-start">
                    <Link href={resolveItemLink(product.linkUrl, "/products")}>
                      {product.linkLabel || "Explore product"} <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ),
            (product) => product.id,
          )}
        </div>
      </section>
    ),
    pricing: (
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{getSectionConfig("pricing").title}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
              {getSectionConfig("pricing").subtitle}
            </p>
          </div>

          {renderSectionItems(
            "pricing",
            pricingPlans.length > 0
              ? pricingPlans.map((plan) => ({
                  id: plan.id,
                  name: plan.name,
                  price: plan.price,
                  period: plan.period || "",
                  features: Array.isArray(plan.features)
                    ? plan.features.map((entry) => String(entry)).slice(0, 4)
                    : ["Contact us for full plan details"],
                }))
              : [
                  {
                    id: "fallback-pricing-1",
                    name: "Starter",
                    price: "PKR 25,000",
                    period: "/month",
                    features: ["Core modules", "Email support", "Monthly reporting"],
                  },
                  {
                    id: "fallback-pricing-2",
                    name: "Growth",
                    price: "PKR 55,000",
                    period: "/month",
                    features: ["Everything in Starter", "Advanced workflows", "Priority support"],
                  },
                  {
                    id: "fallback-pricing-3",
                    name: "Enterprise",
                    price: "Custom",
                    period: "",
                    features: ["Custom integrations", "Dedicated account team", "On-site training"],
                  },
                ],
            (plan) => (
              <Card key={plan.id} className="border-border hover:shadow-lg transition-shadow">
                <CardContent className="p-6 space-y-5">
                  <div>
                    <h3 className="text-xl font-semibold">{plan.name}</h3>
                    <p className="mt-2 text-2xl font-bold">
                      {plan.price}
                      {plan.period && <span className="text-sm font-normal text-muted-foreground">{plan.period}</span>}
                    </p>
                  </div>
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 mt-0.5 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/pricing">View Plan</Link>
                  </Button>
                </CardContent>
              </Card>
            ),
            (plan) => plan.id,
          )}
        </div>
      </section>
    ),
    training:
      trainings && trainings.length > 0 ? (
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{getSectionConfig("training").title}</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
                {getSectionConfig("training").subtitle}
              </p>
            </div>
            {renderSectionItems(
              "training",
              trainings,
              (course) => (
                <Card key={course.id} className="border-border hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 space-y-4">
                    {course.featuredImage ? (
                      <img
                        src={course.featuredImage}
                        alt={course.title}
                        className="w-full h-44 object-cover rounded-md border border-border/60"
                      />
                    ) : null}
                    <h3 className="text-xl font-semibold">{course.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{course.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {course.duration && <span>Duration: {course.duration}</span>}
                      {course.level && <span>Level: {course.level}</span>}
                    </div>
                    <Button asChild variant="link" className="p-0">
                      <Link href={resolveItemLink(course.linkUrl, "/training")}>
                        Learn more <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ),
              (course) => course.id,
            )}
            <div className="text-center mt-8">
              <Button asChild variant="outline" size="lg">
                <Link href="/training">View All Training</Link>
              </Button>
            </div>
          </div>
        </section>
      ) : null,
    testimonials:
      testimonials && testimonials.length > 0 ? (
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{getSectionConfig("testimonials").title}</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
                {getSectionConfig("testimonials").subtitle}
              </p>
            </div>

            {renderSectionItems(
              "testimonials",
              testimonials,
              (testimonial) => (
                <Card key={testimonial.id} className="border-border">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex gap-1">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-muted-foreground leading-relaxed italic">"{testimonial.content}"</p>
                    <div>
                      <p className="font-semibold">{testimonial.clientName}</p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.clientPosition}
                        {testimonial.clientCompany && `, ${testimonial.clientCompany}`}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ),
              (testimonial) => testimonial.id,
            )}
          </div>
        </section>
      ) : null,
    "why-choose": (
      <WhyChooseSectionClient
        title={getSectionConfig("why-choose").title || siteSettings.whyChooseTitle || `Why Choose ${siteSettings.siteTitle || "Our Company"}`}
        subtitle={getSectionConfig("why-choose").subtitle || siteSettings.whyChooseSubtitle || "Trusted by educational institutions and organizations across Pakistan"}
        items={siteSettings.whyChooseItems}
        layout={getSectionConfig("why-choose").itemsLayout || siteSettings.whyChooseLayout}
        mobileLayout={getSectionConfig("why-choose").mobileLayout || siteSettings.whyChooseMobileLayout}
        scrollSpeed={siteSettings.whyChooseScrollSpeed}
        pauseOnHover={getSectionConfig("why-choose").pauseOnHover}
        dragEnabled={getSectionConfig("why-choose").dragEnabled}
      />
    ),
  }
  const orderedHomeSections = siteSettings.homeSections || []
  const enabledHomeSections = orderedHomeSections.filter((section) => section.enabled)
  const primaryHomeSections = enabledHomeSections.slice(0, 2)
  const secondaryHomeSections = enabledHomeSections.slice(2)
  return (
    <div className="flex flex-col min-h-screen">
      <Header settings={siteSettings} />

      <main className="flex-1">
        <HeroSlider
          slides={siteSettings.heroSlides || []}
          mode={siteSettings.heroMode || "static"}
          staticIndex={siteSettings.heroStaticIndex || 0}
          autoplaySeconds={siteSettings.heroAutoplaySeconds || 6}
          height={siteSettings.heroHeight || 560}
        />

        {primaryHomeSections.map((section) => {
          const content = homeSectionBlocks[section.id]
          if (!content) return null
          return <Fragment key={section.id}>{content}</Fragment>
        })}

        {secondaryHomeSections.map((section) => {
          const content = homeSectionBlocks[section.id]
          if (!content) return null
          return <Fragment key={section.id}>{content}</Fragment>
        })}

        {/* CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-balance">Ready to Transform Your Organization?</h2>
              <p className="text-lg text-primary-foreground/90 text-pretty leading-relaxed">
                Get in touch with us today to discuss how we can help you achieve your goals with our innovative
                solutions.
              </p>
              <Button asChild size="lg" variant="secondary" className="text-base">
                <Link href="/contact">
                  Contact Us Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer settings={siteSettings} />
    </div>
  )
}
