import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Package, CheckCircle2, GraduationCap, BookOpen, School, Award, Activity } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { getSiteSettings } from "@/lib/site-settings"
import { buildSeoMetadata } from "@/lib/seo"

const iconMap = {
  GraduationCap,
  BookOpen,
  School,
  Award,
  Activity,
  Package,
}

export async function generateMetadata() {
  const settings = await getSiteSettings()
  return buildSeoMetadata(settings, {
    title: "Products",
    description: "Explore our software products and operational tools built for organizations and institutions.",
  })
}

export default async function ProductsPage() {
  const [products, siteSettings] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
    }),
    getSiteSettings(),
  ])

  return (
    <div className="flex flex-col min-h-screen">
      <Header settings={siteSettings} />

      <main className="flex-1">
        <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 border-b border-border">
          <div className="container mx-auto px-4 lg:px-8 py-16">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-balance">Our Products</h1>
              <p className="text-lg text-muted-foreground text-pretty leading-relaxed">
                Ready-to-deploy products that improve delivery speed, visibility, and control.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 lg:px-8">
            {products.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => {
                  const IconComponent = iconMap[product.icon as keyof typeof iconMap] || Package
                  return (
                    <Card key={product.id} className="border-border hover:shadow-lg transition-shadow">
                      <CardContent className="p-6 space-y-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-semibold">{product.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">{product.description}</p>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                            <span className="text-muted-foreground">Scalable architecture</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                            <span className="text-muted-foreground">Operational reporting</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                            <span className="text-muted-foreground">Role-based access support</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <Card className="border-border">
                <CardContent className="p-12 text-center">
                  <p className="text-lg font-medium mb-2">No products yet</p>
                  <p className="text-muted-foreground">Add products from admin to display them here.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-balance">Need a Product Walkthrough?</h2>
              <p className="text-lg text-primary-foreground/90 text-pretty leading-relaxed">
                Contact us for a live demo and implementation discussion.
              </p>
              <Button asChild size="lg" variant="secondary">
                <Link href="/contact">
                  Contact Us <ArrowRight className="ml-2 h-5 w-5" />
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
