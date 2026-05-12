import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Package, ArrowRight, CheckCircle2 } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { getSiteSettings } from "@/lib/site-settings"
import { buildSeoMetadata } from "@/lib/seo"
import { contentIconMap } from "@/lib/content-icons"

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
    typeof link === "string" && link.trim() ? link.trim() : fallback

  const services = await prisma.service.findMany({ orderBy: { displayOrder: "asc" } })
  const siteSettings = await getSiteSettings()

  const educationServices = services?.filter((s) => s.category === "education") || []
  const trainingServices = services?.filter((s) => s.category === "training") || []
  const supplyServices = services?.filter((s) => s.category === "supply") || []

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

        {/* Education Solutions */}
        {educationServices.length > 0 && (
          <section className="py-16 bg-background">
            <div className="container mx-auto px-4 lg:px-8">
              <div className="mb-10">
                <h2 className="text-3xl font-bold mb-3">Educational Software Solutions</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Specialized management systems for schools, academies, and educational institutions
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {educationServices.map((service) => {
                  const IconComponent = contentIconMap[service.icon as keyof typeof contentIconMap] || Package
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
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                            <span className="text-muted-foreground">Student enrollment & records management</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                            <span className="text-muted-foreground">Attendance tracking & reporting</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                            <span className="text-muted-foreground">Progress monitoring & assessment</span>
                          </li>
                        </ul>
                        <Button asChild variant="outline" className="w-full bg-transparent">
                          <Link href={resolveItemLink(service.linkUrl, "/services")}>
                            {service.linkLabel || "Learn more"} <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* Training Solutions */}
        {trainingServices.length > 0 && (
          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4 lg:px-8">
              <div className="mb-10">
                <h2 className="text-3xl font-bold mb-3">Professional Training Services</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Industry-recognized certification programs and professional development
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trainingServices.map((service) => {
                  const IconComponent = contentIconMap[service.icon as keyof typeof contentIconMap] || Package
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
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
                            <IconComponent className="h-6 w-6" />
                          </div>
                        )}
                        <h3 className="text-xl font-semibold">{service.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">{service.description}</p>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 mt-0.5 text-accent flex-shrink-0" />
                            <span className="text-muted-foreground">Mobius Institute certified courses</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 mt-0.5 text-accent flex-shrink-0" />
                            <span className="text-muted-foreground">Expert instructors & hands-on training</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 mt-0.5 text-accent flex-shrink-0" />
                            <span className="text-muted-foreground">Certification exam preparation</span>
                          </li>
                        </ul>
                        <Button asChild variant="outline" className="w-full bg-transparent">
                          <Link href={resolveItemLink(service.linkUrl, "/training")}>
                            {service.linkLabel || "Learn more"} <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* Supply Solutions */}
        {supplyServices.length > 0 && (
          <section className="py-16 bg-background">
            <div className="container mx-auto px-4 lg:px-8">
              <div className="mb-10">
                <h2 className="text-3xl font-bold mb-3">Order Supply Solutions</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Complete procurement and supply chain management services
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {supplyServices.map((service) => {
                  const IconComponent = contentIconMap[service.icon as keyof typeof contentIconMap] || Package
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
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                            <span className="text-muted-foreground">Procurement assistance</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                            <span className="text-muted-foreground">Inventory management</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                            <span className="text-muted-foreground">Supply chain optimization</span>
                          </li>
                        </ul>
                        <Button asChild variant="outline" className="w-full bg-transparent">
                          <Link href={resolveItemLink(service.linkUrl, "/services")}>
                            {service.linkLabel || "Learn more"} <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-balance">Need a Custom Solution?</h2>
              <p className="text-lg text-primary-foreground/90 text-pretty leading-relaxed">
                Contact us today to discuss your specific requirements and learn how we can help your organization
                succeed.
              </p>
              <Button asChild size="lg" variant="secondary">
                <Link href="/contact">
                  Get in Touch <ArrowRight className="ml-2 h-5 w-5" />
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
