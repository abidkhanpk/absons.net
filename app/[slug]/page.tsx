import { notFound } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { prisma } from "@/lib/prisma"
import { getSiteSettings } from "@/lib/site-settings"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function ContentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = await prisma.page.findFirst({
    where: { slug, published: true },
  })
  if (!page) return notFound()

  const siteSettings = await getSiteSettings()

  return (
    <div className="flex flex-col min-h-screen">
      <Header settings={siteSettings} />

      <main className="flex-1">
        <section className="border-b border-border bg-muted/20">
          <div className="container mx-auto px-4 lg:px-8 py-12">
            <h1 className="text-3xl md:text-4xl font-bold">{page.title}</h1>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: page.content }} />
          </div>
        </section>
      </main>

      <Footer settings={siteSettings} />
    </div>
  )
}
