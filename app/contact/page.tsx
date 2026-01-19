import { getSiteSettings } from "@/lib/site-settings"
import { ContactPageClient } from "./contact-page-client"
import { buildSeoMetadata } from "@/lib/seo"

export async function generateMetadata() {
  const settings = await getSiteSettings()
  const override = settings.staticSeo.contact
  return buildSeoMetadata(settings, {
    title: override.title || "Contact",
    description: override.description || "Get in touch with ABSON Solutions for software, training, and support.",
    keywords: override.keywords || undefined,
    ogImage: override.ogImage || undefined,
    canonical: override.canonical || undefined,
    noIndex: override.noIndex,
    noFollow: override.noFollow,
  })
}

export default async function ContactPage() {
  const settings = await getSiteSettings()

  return <ContactPageClient settings={settings} />
}
