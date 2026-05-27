import type { Metadata } from "next"
import type { SiteSettings } from "@/lib/site-settings"
import { resolveAssetUrl } from "@/lib/asset-url"
import { resolveContentKeywordTokens } from "@/lib/content-keywords"

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
  if (trimmedTemplate.includes("{title}") || trimmedTemplate.includes("{siteTitle}")) {
    return trimmedTemplate
      .replace("{title}", title)
      .replace("{siteTitle}", fallbackSiteTitle)
  }
  if (trimmedTemplate === fallbackSiteTitle) {
    return `${title} - ${fallbackSiteTitle}`
  }
  return `${title} - ${trimmedTemplate}`
}

export function buildSeoMetadata(settings: SiteSettings, overrides: SeoOverrides): Metadata {
  const rawBaseTitle = (overrides.title || settings.seoDefaultTitle || settings.siteTitle).trim()
  const fallbackSiteTitle = settings.siteTitle || "Site"
  const baseTitle = resolveContentKeywordTokens(rawBaseTitle, settings).trim()
  const resolvedTitle = applyTitleTemplate(baseTitle, settings.seoTitleTemplate || "", fallbackSiteTitle)
  const descriptionRaw = (overrides.description ?? settings.seoDefaultDescription)?.trim() || ""
  const keywordsRaw = (overrides.keywords ?? settings.seoDefaultKeywords)?.trim() || ""
  const description = resolveContentKeywordTokens(descriptionRaw, settings).trim() || undefined
  const keywords = resolveContentKeywordTokens(keywordsRaw, settings).trim() || undefined
  const ogImage = resolveAssetUrl((overrides.ogImage ?? settings.seoDefaultOgImage)?.trim() || undefined)
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
