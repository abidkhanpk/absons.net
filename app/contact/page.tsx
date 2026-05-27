import { getSiteSettings } from "@/lib/site-settings"
import { ContactPageClient } from "./contact-page-client"
import { buildSeoMetadata } from "@/lib/seo"
import { toPublicContactSettings, toPublicFooterSettings, toPublicHeaderSettings } from "@/lib/site-public-settings"

export async function generateMetadata() {
  const settings = await getSiteSettings()
  const siteTitle = settings.siteTitle || "Our Company"
  const override = settings.staticSeo.contact
  return buildSeoMetadata(settings, {
    title: override.title || "Contact",
    description: override.description || `Get in touch with ${siteTitle} for software, training, and support.`,
    keywords: override.keywords || undefined,
    ogImage: override.ogImage || undefined,
    canonical: override.canonical || undefined,
    noIndex: override.noIndex,
    noFollow: override.noFollow,
  })
}

export default async function ContactPage() {
  const settings = await getSiteSettings()

  return (
    <ContactPageClient
      headerSettings={toPublicHeaderSettings(settings)}
      footerSettings={toPublicFooterSettings(settings)}
      contactSettings={toPublicContactSettings(settings)}
    />
  )
}
