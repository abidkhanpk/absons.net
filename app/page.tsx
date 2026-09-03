import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Fragment, type ReactNode } from "react"
import { ArrowRight, Star, Check, Package, Users } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { getSiteSettings } from "@/lib/site-settings"
import { HeroSlider } from "@/components/hero-slider"
import { WhyChooseSectionClient } from "@/components/home/why-choose-section-client"
import { ScrollingLoop } from "@/components/home/scrolling-loop"
import { buildSeoMetadata } from "@/lib/seo"
import TestimonialSubmittedBanner from "@/components/testimonial-submitted-banner"
import { contentIconMap } from "@/lib/content-icons"
import { resolveAssetUrl } from "@/lib/asset-url"
import { getImageFitClass } from "@/lib/image-fit"
import { findManyProductsCompat } from "@/lib/product-compat"
import { findManyDepartmentsCompat } from "@/lib/department-compat"
import { getItemLinkTargetProps, resolveItemLinkHref } from "@/lib/item-link"
import { resolveContentKeywordTokens } from "@/lib/content-keywords"
import { toPublicFooterSettings, toPublicHeaderSettings } from "@/lib/site-public-settings"

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
    canonical: override.canonical || "/",
    noIndex: override.noIndex,
    noFollow: override.noFollow,
  })
}

type HomeSectionId =
  | "services"
  | "products"
  | "pricing"
  | "training"
  | "departments"
  | "testimonials"
  | "who-we-serve"
  | "why-choose"
  | "cta"

export default async function HomePage() {
  const resolveItemLink = (link: string | null | undefined, fallback: string) =>
    resolveItemLinkHref(link, fallback)

  const siteSettings = await getSiteSettings()
  const testimonialSection = siteSettings.homeSections.find((section) => section.id === "testimonials")
  const homeTestimonialLimit =
    typeof testimonialSection?.homeTestimonialLimit === "number" && Number.isFinite(testimonialSection.homeTestimonialLimit)
      ? Math.max(0, Math.floor(testimonialSection.homeTestimonialLimit))
      : 3

  const [services, testimonials, trainings, products, departments, pricingPlans, whoWeServeItems] = await Promise.all([
    prisma.service.findMany({
      where: { isFeatured: true },
      orderBy: { displayOrder: "asc" },
      take: 3,
    }),
    prisma.testimonial.findMany({
      where: { isPublished: true },
      orderBy: { displayOrder: "asc" },
      ...(homeTestimonialLimit > 0 ? { take: homeTestimonialLimit } : {}),
    }),
    prisma.trainingCourse.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
      take: 3,
    }),
    findManyProductsCompat(prisma, {
    where: { isActive: true },
    orderBy: { displayOrder: "asc" },
    take: 6,
    }),
    findManyDepartmentsCompat(prisma, {
    where: { isActive: true },
    orderBy: { displayOrder: "asc" },
    take: 6,
    }),
    prisma.pricingPlan.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
      take: 6,
    }),
    prisma.whoWeServe.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
      take: 6,
    }),
  ])
  const headerSettings = toPublicHeaderSettings(siteSettings)
  const footerSettings = toPublicFooterSettings(siteSettings)
  const resolveText = (value: string | null | undefined) => resolveContentKeywordTokens(value || "", siteSettings)
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
    departments: {
      title: "Departments",
      subtitle: "Explore our specialized departments and their core capabilities.",
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
    "who-we-serve": {
      title: "Who We Serve",
      subtitle: "Built for institutions, teams, and organizations that need dependable digital operations.",
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
    cta: {
      title: "Ready to Transform Your Organization?",
      subtitle: "Get in touch with us today to discuss how we can help you achieve your goals with our innovative solutions.",
      itemsLayout: "grid",
      mobileLayout: "match",
      scrollSpeed: 30,
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
    const safeItems = (items || []).filter((item): item is T => Boolean(item))
    const { itemsLayout, mobileLayout, scrollSpeed, pauseOnHover, dragEnabled } = getSectionConfig(sectionId)
    const desktopScroll = itemsLayout === "scroll"
    const mobileResolvedLayout = mobileLayout === "match" ? itemsLayout : mobileLayout
    const mobileScroll = mobileResolvedLayout === "scroll"

    const renderScroll = (className: string) => {
      const scrollingItems = safeItems.length > 1 ? [...safeItems, ...safeItems] : safeItems
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
      <div className={className}>{safeItems.map((item, index) => renderCard(item, index))}</div>
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
      <section className="py-12 md:py-14 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-8 md:mb-10">
            <h2 className="section-title text-3xl md:text-4xl font-bold mb-4 text-gradient-brand">{getSectionConfig("services").title}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
              {getSectionConfig("services").subtitle}
            </p>
          </div>

          {renderSectionItems(
            "services",
            services || [],
            (service) => {
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
            },
            (service) => service.id,
          )}

          <div className="text-center mt-6">
            <Button asChild variant="outline" size="lg">
              <Link href="/services">View All Services</Link>
            </Button>
          </div>
        </div>
      </section>
    ),
    products: (
      <section className="py-12 md:py-14 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-8 md:mb-10">
            <h2 className="section-title text-3xl md:text-4xl font-bold mb-4 text-gradient-brand">{getSectionConfig("products").title}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
              {getSectionConfig("products").subtitle}
            </p>
          </div>

          {renderSectionItems(
            "products",
            products.map((product) => ({
              id: product.id,
              title: resolveText(product.title),
              description: resolveText(product.description),
              imageUrl: product.imageUrl,
              linkUrl: product.linkUrl,
              linkLabel: resolveText(product.linkLabel || "") || "Explore product",
              isFeatured: product.isFeatured,
              tags: product.tags.map((tag) => resolveText(tag)),
            })),
            (product) => (
              <Card key={product.id} className="border-border hover:shadow-lg transition-shadow h-full">
                <CardContent className="p-6 h-full flex flex-col gap-4">
                  {product.imageUrl ? (
                    <img
                      src={resolveAssetUrl(product.imageUrl)}
                      alt={product.title}
                      className={`w-full h-44 ${getImageFitClass((product).imageFitMode)} rounded-md border border-border/60`}
                    />
                  ) : null}
                  <div className="flex flex-wrap items-center gap-2">
                    {product.isFeatured ? <Badge>Featured</Badge> : null}
                    {product.tags.slice(0, 2).map((tag) => (
                      <Badge key={`${product.id}-${tag}`} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <h3 className="text-xl font-semibold">{product.title}</h3>
                  <p className="text-muted-foreground leading-relaxed flex-1">{product.description}</p>
                  <Button asChild variant="link" className="p-0 mt-auto self-start">
                    <Link
                      href={resolveItemLink(product.linkUrl, "/products")}
                      {...getItemLinkTargetProps(product.linkUrl)}
                    >
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
      <section className="py-12 md:py-14 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-8 md:mb-10">
            <h2 className="section-title text-3xl md:text-4xl font-bold mb-4 text-gradient-brand">{getSectionConfig("pricing").title}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
              {getSectionConfig("pricing").subtitle}
            </p>
          </div>

          {renderSectionItems(
            "pricing",
            pricingPlans.map((plan) => ({
              id: plan.id,
              name: resolveText(plan.name),
              price: resolveText(plan.price),
              period: resolveText(plan.period || ""),
              features: Array.isArray(plan.features)
                ? plan.features.map((entry) => resolveText(String(entry))).slice(0, 4)
                : ["Contact us for full plan details"],
            })),
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
        <section className="py-12 md:py-14 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-8 md:mb-10">
              <h2 className="section-title text-3xl md:text-4xl font-bold mb-4 text-gradient-brand">{getSectionConfig("training").title}</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
                {getSectionConfig("training").subtitle}
              </p>
            </div>
            {renderSectionItems(
              "training",
              trainings,
              (course) => {
                const courseTitle = resolveText(course.title)
                const courseDescription = resolveText(course.description)
                const courseDuration = resolveText(course.duration || "")
                const courseLevel = resolveText(course.level || "")
                const courseLinkLabel = resolveText(course.linkLabel || "") || "Learn more"
                return (
                  <Card key={course.id} className="border-border hover:shadow-lg transition-shadow">
                    <CardContent className="p-6 space-y-4">
                      {course.featuredImage ? (
                        <img
                          src={resolveAssetUrl(course.featuredImage)}
                          alt={courseTitle}
                          className={`w-full h-44 ${getImageFitClass(course.imageFitMode)} rounded-md border border-border/60`}
                        />
                      ) : null}
                      <h3 className="text-xl font-semibold">{courseTitle}</h3>
                      <p className="text-muted-foreground leading-relaxed">{courseDescription}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {courseDuration && <span>Duration: {courseDuration}</span>}
                        {courseLevel && <span>Level: {courseLevel}</span>}
                      </div>
                      <Button asChild variant="link" className="p-0">
                        <Link
                          href={resolveItemLink(course.linkUrl, "/training")}
                          {...getItemLinkTargetProps(course.linkUrl)}
                        >
                          {courseLinkLabel} <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                )
              },
              (course) => course.id,
            )}
            <div className="text-center mt-6">
              <Button asChild variant="outline" size="lg">
                <Link href="/training">View All Training</Link>
              </Button>
            </div>
          </div>
        </section>
      ) : null,
    departments:
      departments && departments.length > 0 ? (
        <section className="py-12 md:py-14 bg-background">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-8 md:mb-10">
              <h2 className="section-title text-3xl md:text-4xl font-bold mb-4 text-gradient-brand">{getSectionConfig("departments").title}</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
                {getSectionConfig("departments").subtitle}
              </p>
            </div>

            {renderSectionItems(
              "departments",
              departments,
              (department) => {
                const DepartmentIcon = contentIconMap[department.icon as keyof typeof contentIconMap] || Users
                const departmentTitle = resolveText(department.title)
                const departmentDescription = resolveText(department.description)
                const departmentLinkLabel = resolveText(department.linkLabel || "") || "Learn more"
                return (
                  <Card key={department.id} className="border-border hover:shadow-lg transition-shadow">
                    <CardContent className="p-6 space-y-4 min-h-[10rem]">
                      {department.imageUrl ? (
                        <img
                          src={resolveAssetUrl(department.imageUrl)}
                          alt={departmentTitle}
                          className={`w-full h-44 ${getImageFitClass(department.imageFitMode)} rounded-md border border-border/60`}
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg icon-tile">
                          <DepartmentIcon className="h-6 w-6" />
                        </div>
                      )}
                      <h3 className="text-xl font-semibold">{departmentTitle}</h3>
                      <p className="text-muted-foreground leading-relaxed">{departmentDescription}</p>
                      <Button asChild variant="link" className="p-0">
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
              },
              (department) => department.id,
            )}

            <div className="text-center mt-6">
              <Button asChild variant="outline" size="lg">
                <Link href="/departments">View All Departments</Link>
              </Button>
            </div>
          </div>
        </section>
      ) : null,
    testimonials:
      testimonials && testimonials.length > 0 ? (
        <section className="py-12 md:py-14 bg-background">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-8 md:mb-10">
              <h2 className="section-title text-3xl md:text-4xl font-bold mb-4 text-gradient-brand">{getSectionConfig("testimonials").title}</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
                {getSectionConfig("testimonials").subtitle}
              </p>
              <div className="mt-6">
                <div className="text-center">
                  <Button asChild variant="outline">
                    <Link href="/testimonials/submit">Share Your Experience</Link>
                  </Button>
                </div>
                {/* testimonial submission success banner (client) */}
                <TestimonialSubmittedBanner />
              </div>
            </div>

            {renderSectionItems(
              "testimonials",
              testimonials,
              (testimonial) => {
                const testimonialContent = resolveText(testimonial.content || "")
                const testimonialClientName = resolveText(testimonial.clientName || "")
                const testimonialClientPosition = resolveText(testimonial.clientPosition || "")
                const testimonialClientCompany = resolveText(testimonial.clientCompany || "")

                return (
                  <Card
                    key={testimonial.id}
                    tabIndex={0}
                    data-scroll-toggle="true"
                    className="border-border group overflow-hidden transition-shadow hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    <CardContent className="p-6 space-y-4">
                      <div className="flex gap-1">
                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                          <Star key={i} className="h-5 w-5 fill-[var(--brand-amber)] text-[var(--brand-amber)]" />
                        ))}
                      </div>
                      <div className="max-h-20 overflow-hidden group-hover:max-h-[1000px] group-focus-within:max-h-[1000px] transition-all duration-300 ease-in-out">
                        <p className="text-muted-foreground leading-relaxed italic testimonial-clamp">"{testimonialContent}"</p>
                      </div>
                      <div>
                        <p className="font-semibold">{testimonialClientName}</p>
                        <p className="text-sm text-muted-foreground">
                          {testimonialClientPosition}
                          {testimonialClientCompany && `, ${testimonialClientCompany}`}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )
              },
              (testimonial) => testimonial.id,
            )}
          </div>
        </section>
      ) : null,
    "who-we-serve":
      whoWeServeItems && whoWeServeItems.length > 0 ? (
        <section className="py-12 md:py-14 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-8 md:mb-10">
              <h2 className="section-title text-3xl md:text-4xl font-bold mb-4 text-gradient-brand">{getSectionConfig("who-we-serve").title}</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
                {getSectionConfig("who-we-serve").subtitle}
              </p>
            </div>

            {renderSectionItems(
              "who-we-serve",
              whoWeServeItems,
              (segment) => {
                const SegmentIcon = contentIconMap[segment.icon as keyof typeof contentIconMap] || Users
                const segmentTitle = resolveText(segment.title)
                const segmentDescription = resolveText(segment.description)
                return (
                  <Card key={segment.id} className="border-border hover:shadow-lg transition-shadow">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg icon-tile">
                        <SegmentIcon className="h-6 w-6" />
                      </div>
                      <h3 className="text-xl font-semibold">{segmentTitle}</h3>
                      <p className="text-muted-foreground leading-relaxed">{segmentDescription}</p>
                    </CardContent>
                  </Card>
                )
              },
              (segment) => segment.id,
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
    cta: (
      <section className="py-12 md:py-14 bg-gradient-brand-strong text-primary-foreground">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-balance">{getSectionConfig("cta").title}</h2>
            <p className="text-lg text-primary-foreground/90 text-pretty leading-relaxed">
              {getSectionConfig("cta").subtitle}
            </p>
            <Button asChild size="lg" variant="secondary" className="text-base">
              <Link href={resolveItemLink(sectionConfigMap.get("cta")?.ctaHref, "/contact")}>
                {sectionConfigMap.get("cta")?.ctaText?.trim() || "Contact Us Today"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    ),
  }
  const orderedHomeSections = siteSettings.homeSections || []
  const enabledHomeSections = orderedHomeSections.filter((section) => section.enabled)
  const primaryHomeSections = enabledHomeSections.slice(0, 2)
  const secondaryHomeSections = enabledHomeSections.slice(2)
  return (
    <>
      <Header settings={headerSettings} />

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

      </main>

      <Footer settings={footerSettings} />
    </>
  )
}
