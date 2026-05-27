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

const TITLE_TOKEN_REGEX = /\{\s*title\s*[}\]]/gi
const SITE_TITLE_TOKEN_REGEX = /\{\s*(?:siteTitle|sitetitle|site_title|site-title|sitetile)\s*[}\]]/gi
const TITLE_TOKEN_DETECT_REGEX = /\{\s*title\s*[}\]]/i
const SITE_TITLE_TOKEN_DETECT_REGEX = /\{\s*(?:siteTitle|sitetitle|site_title|site-title|sitetile)\s*[}\]]/i

function resolveSeoText(value: string, settings: SiteSettings, pageTitle: string, fallbackSiteTitle: string) {
  if (!value) return ""
  return resolveContentKeywordTokens(value, settings)
    .replace(TITLE_TOKEN_REGEX, pageTitle)
    .replace(SITE_TITLE_TOKEN_REGEX, fallbackSiteTitle)
    .trim()
}

function applyTitleTemplate(title: string, template: string, fallbackSiteTitle: string, settings: SiteSettings) {
  const trimmedTemplate = template.trim()
  if (!trimmedTemplate) return title

  const hasTemplateTokens =
    TITLE_TOKEN_DETECT_REGEX.test(trimmedTemplate) || SITE_TITLE_TOKEN_DETECT_REGEX.test(trimmedTemplate)
  const resolvedKeywordTemplate = resolveContentKeywordTokens(trimmedTemplate, settings).trim()

  if (hasTemplateTokens) {
    return resolvedKeywordTemplate
      .replace(TITLE_TOKEN_REGEX, title)
      .replace(SITE_TITLE_TOKEN_REGEX, fallbackSiteTitle)
  }

  if (resolvedKeywordTemplate === fallbackSiteTitle) {
    return `${title} - ${fallbackSiteTitle}`
  }
  return `${title} - ${resolvedKeywordTemplate}`
}

export function buildSeoMetadata(settings: SiteSettings, overrides: SeoOverrides): Metadata {
  const fallbackSiteTitle = settings.siteTitle || "Site"
  const rawBaseTitle = (overrides.title || settings.seoDefaultTitle || settings.siteTitle).trim()
  const baseTitleResolved = resolveSeoText(rawBaseTitle, settings, fallbackSiteTitle, fallbackSiteTitle)
  const baseTitle = (baseTitleResolved.replace(TITLE_TOKEN_REGEX, fallbackSiteTitle).trim() || fallbackSiteTitle)
  const resolvedTitle = applyTitleTemplate(baseTitle, settings.seoTitleTemplate || "", fallbackSiteTitle, settings)
  const descriptionRaw = (overrides.description ?? settings.seoDefaultDescription)?.trim() || ""
  const keywordsRaw = (overrides.keywords ?? settings.seoDefaultKeywords)?.trim() || ""
  const description = resolveSeoText(descriptionRaw, settings, baseTitle, fallbackSiteTitle) || undefined
  const keywords = resolveSeoText(keywordsRaw, settings, baseTitle, fallbackSiteTitle) || undefined
  const ogImage = resolveAssetUrl((overrides.ogImage ?? settings.seoDefaultOgImage)?.trim() || undefined)
  const canonicalRaw = overrides.canonical?.trim() || ""
  const canonical = resolveSeoText(canonicalRaw, settings, baseTitle, fallbackSiteTitle) || undefined

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
