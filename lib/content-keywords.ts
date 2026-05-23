import type { SiteSettings } from "./site-settings"

export type ContentKeywordOption = {
  label: string
  token: string
}

type ContentKeywordKey = "siteTitle" | "companyTagline" | "contactEmail" | "contactPhone" | "contactAddress"

const CONTENT_KEYWORD_DEFINITIONS: Array<{
  key: ContentKeywordKey
  label: string
  token: string
  aliases: string[]
}> = [
  {
    key: "siteTitle",
    label: "Site Title",
    token: "{sitetitle}",
    aliases: ["sitetitle", "site_title", "site-title", "sitetile"],
  },
  {
    key: "companyTagline",
    label: "Company Tagline",
    token: "{companytagline}",
    aliases: ["companytagline", "company_tagline", "company-tagline"],
  },
  {
    key: "contactEmail",
    label: "Contact Email",
    token: "{contactemail}",
    aliases: ["contactemail", "contact_email", "contact-email"],
  },
  {
    key: "contactPhone",
    label: "Contact Phone",
    token: "{contactphone}",
    aliases: ["contactphone", "contact_phone", "contact-phone"],
  },
  {
    key: "contactAddress",
    label: "Contact Address",
    token: "{contactaddress}",
    aliases: ["contactaddress", "contact_address", "contact-address"],
  },
]

export const CONTENT_KEYWORD_OPTIONS: ContentKeywordOption[] = CONTENT_KEYWORD_DEFINITIONS.map((definition) => ({
  label: definition.label,
  token: definition.token,
}))

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function normalizeValue(value: string | null | undefined) {
  return typeof value === "string" ? value.trim() : ""
}

const CONTENT_KEYWORD_PATTERNS: Array<{
  key: ContentKeywordKey
  regex: RegExp
}> = CONTENT_KEYWORD_DEFINITIONS.map((definition) => {
  const aliasesPattern = definition.aliases.map(escapeRegex).join("|")
  return {
    key: definition.key,
    regex: new RegExp(`\\{\\s*(?:${aliasesPattern})\\s*[}\\]]`, "gi"),
  }
})

function getKeywordValue(settings: SiteSettings, key: ContentKeywordKey) {
  if (key === "siteTitle") return normalizeValue(settings.siteTitle)
  if (key === "companyTagline") return normalizeValue(settings.companyTagline)
  if (key === "contactEmail") return normalizeValue(settings.contactEmail)
  if (key === "contactPhone") return normalizeValue(settings.contactPhone)
  return normalizeValue(settings.contactAddress)
}

export function resolveContentKeywordTokens(content: string, settings: SiteSettings) {
  if (!content) return ""
  let resolved = content
  for (const pattern of CONTENT_KEYWORD_PATTERNS) {
    resolved = resolved.replace(pattern.regex, getKeywordValue(settings, pattern.key))
  }
  return resolved
}
