import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Target, Eye, Heart } from "lucide-react"
import { getSiteSettings } from "@/lib/site-settings"

export const metadata = {
  title: "About Us - ABSON Solutions",
  description: "Learn about ABSON Solutions and our mission to empower organizations with innovative software.",
}

export default async function AboutPage() {
  const siteSettings = await getSiteSettings()
  return (
    <div className="flex flex-col min-h-screen">
      <Header settings={siteSettings} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 border-b border-border">
          <div className="container mx-auto px-4 lg:px-8 py-16">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-balance">About ABSON Solutions</h1>
              <p className="text-lg text-muted-foreground text-pretty leading-relaxed">
                Your trusted partner in educational technology and professional training
              </p>
            </div>
          </div>
        </section>

        {/* Company Overview */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-6">
              <h2 className="text-3xl font-bold">Who We Are</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                ABSON Solutions is a leading provider of specialized software solutions and professional training
                services. We focus on empowering educational institutions, Quran academies, madaris, and Hifz institutes
                with cutting-edge technology that streamlines operations and enhances learning experiences.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                In addition to our educational software solutions, we are proud partners of the Mobius Institute of
                Australia, offering comprehensive vibration analysis training and certification programs. We also
                provide full-service general order supply solutions to meet the diverse needs of organizations.
              </p>
            </div>
          </div>
        </section>

        {/* Mission, Vision, Values */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-border">
                <CardContent className="p-6 space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Target className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold">Our Mission</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    To deliver innovative, reliable, and user-friendly software solutions that enable educational
                    institutions and organizations to operate efficiently and achieve their goals.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardContent className="p-6 space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Eye className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold">Our Vision</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    To become the most trusted technology partner for educational institutions across the region,
                    recognized for excellence in service delivery and customer satisfaction.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardContent className="p-6 space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Heart className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold">Our Values</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Integrity, innovation, customer focus, and excellence drive everything we do. We believe in building
                    long-term relationships based on trust and mutual success.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* What We Do */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8">What We Do</h2>
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold mb-3">Educational Software Solutions</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We develop comprehensive management systems for schools, online Quran academies, madaris, and Hifz
                    institutes. Our solutions cover student enrollment, attendance tracking, grade management, progress
                    monitoring, and administrative workflows.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Professional Training</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    As partners with the Mobius Institute of Australia, we provide world-class vibration analysis
                    training programs. Our courses prepare professionals for internationally recognized certifications
                    in predictive maintenance and machinery diagnostics.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">General Order Supply</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We offer complete order supply solutions for organizations, including procurement assistance,
                    inventory management, and supply chain optimization. Our services ensure that your organization has
                    the resources it needs to operate smoothly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer settings={siteSettings} />
    </div>
  )
}
