import type { Metadata } from "next"
import type { SiteSettings } from "@/lib/site-settings"

type SeoOverrides = {
  title?: string
  description?: string
  keywords?: string
  ogImage?: string
  canonical?: string
  noIndex?: boolean
  noFollow?: boolean
}

function applyTitleTemplate(title: string, template: string, fallbackSiteTitle: string) {
  const trimmedTemplate = template.trim()
  if (!trimmedTemplate) return title
  if (trimmedTemplate.includes("{title}")) {
    return trimmedTemplate.replace("{title}", title)
  }
  if (trimmedTemplate === fallbackSiteTitle) {
    return `${title} - ${fallbackSiteTitle}`
  }
  return `${title} - ${trimmedTemplate}`
}

export function buildSeoMetadata(settings: SiteSettings, overrides: SeoOverrides): Metadata {
  const baseTitle = (overrides.title || settings.seoDefaultTitle || settings.siteTitle).trim()
  const fallbackSiteTitle = settings.siteTitle || "ABSON Solutions"
  const resolvedTitle = applyTitleTemplate(baseTitle, settings.seoTitleTemplate || "", fallbackSiteTitle)
  const description = (overrides.description ?? settings.seoDefaultDescription)?.trim() || undefined
  const keywords = (overrides.keywords ?? settings.seoDefaultKeywords)?.trim() || undefined
  const ogImage = (overrides.ogImage ?? settings.seoDefaultOgImage)?.trim() || undefined
  const canonical = overrides.canonical?.trim() || undefined

  const noIndex = !settings.allowIndexing || Boolean(overrides.noIndex)
  const noFollow = !settings.allowIndexing || Boolean(overrides.noFollow)

  return {
    title: resolvedTitle,
    description,
    keywords,
    alternates: canonical ? { canonical } : undefined,
    robots: noIndex || noFollow ? { index: !noIndex, follow: !noFollow } : undefined,
    openGraph:
      description || ogImage
        ? {
            title: resolvedTitle,
            description,
            images: ogImage ? [{ url: ogImage }] : undefined,
          }
        : undefined,
  }
}
