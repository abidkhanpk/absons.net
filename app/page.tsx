import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import Link from "next/link"
import { Fragment } from "react"
import { GraduationCap, BookOpen, School, Award, Activity, Package, ArrowRight, Star, Check } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { getSiteSettings } from "@/lib/site-settings"
import { HeroSlider } from "@/components/hero-slider"
import { WhyChooseSectionClient } from "@/components/home/why-choose-section-client"
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

export default async function HomePage() {
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
  const homeSectionBlocks = {
    services: (
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Services</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
              Comprehensive solutions tailored to your organization's specific needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {services?.map((service) => {
              const IconComponent = iconMap[service.icon as keyof typeof iconMap] || Package
              return (
                <Card key={service.id} className="border-border hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-semibold">{service.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{service.description}</p>
                    <Button asChild variant="link" className="p-0">
                      <Link href="/services">
                        Learn more <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>

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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Products</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
              Ready-to-deploy products that help your teams launch faster and operate with confidence.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {(products.length > 0
              ? products.map((product) => ({
                  id: product.id,
                  title: product.title,
                  description: product.description,
                }))
              : [
                  {
                    id: "fallback-product-1",
                    title: "Education Suite",
                    description: "Admissions, attendance, exams, and fee tracking designed for schools and institutions.",
                  },
                  {
                    id: "fallback-product-2",
                    title: "Operations Dashboard",
                    description: "One place to monitor workflows, team activity, and key performance indicators.",
                  },
                  {
                    id: "fallback-product-3",
                    title: "Reporting Toolkit",
                    description: "Actionable analytics and export-ready reports for leadership and stakeholders.",
                  },
                ]).map((product) => (
              <Card key={product.id} className="border-border hover:shadow-lg transition-shadow">
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-xl font-semibold">{product.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{product.description}</p>
                  <Button asChild variant="link" className="p-0">
                    <Link href="/products">
                      Explore product <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    ),
    pricing: (
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Pricing</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
              Transparent plans for organizations at different stages, with support included.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {(pricingPlans.length > 0
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
                ]).map((plan) => (
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
            ))}
          </div>
        </div>
      </section>
    ),
    training:
      trainings && trainings.length > 0 ? (
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Training Programs</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
                Vibration analysis training aligned with Mobius Institute standards.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {trainings.map((course) => (
                <Card key={course.id} className="border-border hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="text-xl font-semibold">{course.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{course.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {course.duration && <span>Duration: {course.duration}</span>}
                      {course.level && <span>Level: {course.level}</span>}
                    </div>
                    <Button asChild variant="link" className="p-0">
                      <Link href="/training">
                        Learn more <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
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
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Clients Say</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
                Trusted by institutions and organizations across the region
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial) => (
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
              ))}
            </div>
          </div>
        </section>
      ) : null,
    "why-choose": (
      <WhyChooseSectionClient
        title={siteSettings.whyChooseTitle || `Why Choose ${siteSettings.siteTitle || "Our Company"}`}
        subtitle={siteSettings.whyChooseSubtitle || "Trusted by educational institutions and organizations across Pakistan"}
        items={siteSettings.whyChooseItems}
        layout={siteSettings.whyChooseLayout}
        mobileLayout={siteSettings.whyChooseMobileLayout}
        scrollSpeed={siteSettings.whyChooseScrollSpeed}
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
