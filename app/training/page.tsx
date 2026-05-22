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
  const siteTitle = siteSettings.siteTitle || "Our Company"

  return (
    <div className="flex flex-col min-h-screen">
      <Header settings={siteSettings} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 border-b border-border">
          <div className="container mx-auto px-4 lg:px-8 py-16">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-balance">Training</h1>
              <p className="text-lg text-muted-foreground text-pretty leading-relaxed">
                Elevate your skills with our expert-led vibration analysis training programs and certifications.
              </p>
            </div>
          </div>
        </section>

        {/* About Training */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-6">
              <h2 className="text-3xl font-bold">World-Class Certification Programs</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {siteTitle} offers comprehensive training programs designed to equip professionals with the knowledge and skills needed to excel in reliability and condition monitoring. Our courses cover a wide range of topics, from fundamental principles to advanced techniques, ensuring that participants gain a deep understanding of the subject matter.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Whether you're a new professional or looking to advance your expertise, our structured programs
                provide the knowledge and hands-on experience needed to excel in the field.
              </p>
            </div>
          </div>
        </section>

        {/* Training Courses */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="mb-10">
              <h2 className="text-3xl font-bold mb-3">Available Courses</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Explore our range of training courses designed to meet the needs of professionals at all levels. Each course is crafted to provide in-depth knowledge and practical skills, ensuring you can apply what you learn directly to your work.
              </p>
            </div>

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
          </div>
        </section>

        {/* Why Train With Us */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8">Why Train With {siteTitle}</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">Expert Instructors</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Learn from certified professionals with extensive industry experience
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">Hands-On Training</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Practical exercises and real-world case studies for comprehensive learning
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">Flexible Training Delivery Options</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Training can be conducted at client site, our hosted venue, or online
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">Exam Preparation</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Comprehensive preparation materials and practice tests
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">Flexible Scheduling</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Course schedules designed to accommodate working professionals
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">Post-Training Support</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Ongoing guidance and resources after course completion
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-balance">Ready to Advance Your Career?</h2>
              <p className="text-lg text-primary-foreground/90 text-pretty leading-relaxed">
                Contact us today to learn more about our training programs and upcoming course schedules.
              </p>
              <Button asChild size="lg" variant="secondary">
                <Link href="/contact">Inquire About Training</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer settings={siteSettings} />
    </div>
  )
}
