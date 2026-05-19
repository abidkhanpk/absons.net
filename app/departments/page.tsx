import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Building2 } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { getSiteSettings } from "@/lib/site-settings"
import { buildSeoMetadata } from "@/lib/seo"
import { contentIconMap } from "@/lib/content-icons"
import { resolveAssetUrl } from "@/lib/asset-url"
import { findManyDepartmentsCompat } from "@/lib/department-compat"
import { getItemLinkTargetProps, resolveItemLinkHref } from "@/lib/item-link"

export async function generateMetadata() {
  const settings = await getSiteSettings()
  return buildSeoMetadata(settings, {
    title: "Departments",
    description: "Explore our core departments and their capabilities.",
  })
}

export default async function DepartmentsPage() {
  const resolveItemLink = (link: string | null | undefined, fallback: string) =>
    resolveItemLinkHref(link, fallback)

  const [departments, siteSettings] = await Promise.all([
    findManyDepartmentsCompat(prisma, {
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
              <h1 className="text-4xl md:text-5xl font-bold text-balance">Our Departments</h1>
              <p className="text-lg text-muted-foreground text-pretty leading-relaxed">
                Key teams and departments driving our services and delivery quality.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 lg:px-8">
            {departments.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {departments.map((department) => {
                  const IconComponent = contentIconMap[department.icon as keyof typeof contentIconMap] || Building2
                  return (
                    <Card key={department.id} className="border-border hover:shadow-lg transition-shadow h-full">
                      <CardContent className="p-6 h-full flex flex-col gap-4">
                        {department.imageUrl ? (
                          <img
                            src={resolveAssetUrl(department.imageUrl)}
                            alt={department.title}
                            className="w-full h-44 object-cover rounded-md border border-border/60"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <IconComponent className="h-6 w-6" />
                          </div>
                        )}
                        <h3 className="text-xl font-semibold">{department.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">{department.description}</p>
                        <Button asChild variant="outline" className="w-full bg-transparent mt-auto">
                          <Link
                            href={resolveItemLink(department.linkUrl, "/departments")}
                            {...getItemLinkTargetProps(department.linkUrl)}
                          >
                            {department.linkLabel || "Learn more"} <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <Card className="border-border">
                <CardContent className="p-12 text-center">
                  <p className="text-lg font-medium mb-2">No departments yet</p>
                  <p className="text-muted-foreground">Add departments from admin to display them here.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </main>

      <Footer settings={siteSettings} />
    </div>
  )
}
