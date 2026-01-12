import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import Link from "next/link"
import { GraduationCap, BookOpen, School, Award, Activity, Package, ArrowRight, CheckCircle2, Star } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { getSiteSettings } from "@/lib/site-settings"

// Ensure the homepage is served dynamically so it can gracefully handle missing data in production
export const dynamic = "force-dynamic"
export const revalidate = 0

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
  const siteSettings = await getSiteSettings()
  const slides =
    siteSettings.heroSlides && siteSettings.heroSlides.length > 0 ? siteSettings.heroSlides : siteSettings.heroSlides
  const heroMode = siteSettings.heroMode || "static"
  const fallbackSlide = slides && slides.length > 0 ? slides[0] : null
  const staticSlide =
    heroMode === "static" && slides
      ? slides[Math.min(Math.max(siteSettings.heroStaticIndex || 0, 0), slides.length - 1)]
      : null

  return (
    <div className="flex flex-col min-h-screen">
      <Header settings={siteSettings} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative border-b border-border">
          {slides && heroMode === "parallax" ? (
            <Carousel opts={{ loop: true }} className="w-full">
              <CarouselContent>
                {slides.map((slide, idx) => (
                  <CarouselItem key={idx}>
                    <div
                      className="relative overflow-hidden"
                      style={{
                        backgroundImage: slide.image ? `url(${slide.image})` : undefined,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundAttachment: "fixed",
                      }}
                    >
                      <div className="bg-black/50">
                        <div className="container mx-auto px-4 lg:px-8 py-20 lg:py-32">
                          <div className="max-w-4xl mx-auto text-center space-y-8 text-white">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-balance leading-tight">
                              {slide.title}
                            </h1>
                            {slide.subtitle && (
                              <p className="text-lg md:text-xl text-white/80 text-pretty max-w-2xl mx-auto leading-relaxed">
                                {slide.subtitle}
                              </p>
                            )}
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                              {slide.ctaText && slide.ctaHref && (
                                <Button asChild size="lg" className="text-base">
                                  <Link href={slide.ctaHref}>
                                    {slide.ctaText}
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                  </Link>
                                </Button>
                              )}
                              <Button asChild variant="outline" size="lg" className="text-base bg-transparent">
                                <Link href="/services">Explore Services</Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          ) : (
            <div
              className="relative bg-gradient-to-br from-primary/10 via-background to-accent/10"
              style={
                staticSlide?.image
                  ? {
                      backgroundImage: `url(${staticSlide.image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : undefined
              }
            >
              <div className="container mx-auto px-4 lg:px-8 py-20 lg:py-32">
                <div className="max-w-4xl mx-auto text-center space-y-8">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-balance leading-tight">
                    {staticSlide?.title || fallbackSlide?.title || "Empowering Organizations with Innovative Software Solutions"}
                  </h1>
                  <p className="text-lg md:text-xl text-muted-foreground text-pretty max-w-2xl mx-auto leading-relaxed">
                    {staticSlide?.subtitle ||
                      fallbackSlide?.subtitle ||
                      "Specialized software for educational institutions, Quran academies, professional training, and complete order supply solutions."}
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button asChild size="lg" className="text-base">
                      <Link href={staticSlide?.ctaHref || fallbackSlide?.ctaHref || "/contact"}>
                        {staticSlide?.ctaText || fallbackSlide?.ctaText || "Get Started"}
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="text-base bg-transparent">
                      <Link href="/services">Explore Services</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Services Section */}
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

        {/* Why Choose Us Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose ABSON Solutions</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
                Trusted by educational institutions and organizations across Pakistan
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center space-y-3">
                <div className="flex justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold">Proven Expertise</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Years of experience delivering quality solutions
                </p>
              </div>

              <div className="text-center space-y-3">
                <div className="flex justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Award className="h-7 w-7" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold">Certified Training</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Mobius Institute certified vibration analysis programs
                </p>
              </div>

              <div className="text-center space-y-3">
                <div className="flex justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <BookOpen className="h-7 w-7" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold">Tailored Solutions</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Custom software designed for your specific requirements
                </p>
              </div>

              <div className="text-center space-y-3">
                <div className="flex justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Star className="h-7 w-7" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold">Ongoing Support</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Dedicated support and maintenance for all solutions
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        {testimonials && testimonials.length > 0 && (
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
        )}

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
