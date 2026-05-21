const SLUG_SEGMENT_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function normalizeSlugToken(raw: string) {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function normalizeSlugSegment(raw: string) {
  return normalizeSlugToken(raw || "")
}

export function normalizeSlugPrefix(raw: string) {
  if (!raw) return ""
  const normalized = raw
    .replace(/\\+/g, "/")
    .split("/")
    .map((part) => normalizeSlugToken(part))
    .filter(Boolean)
  return normalized.join("/")
}

export function isValidSlugSegment(value: string) {
  return SLUG_SEGMENT_PATTERN.test(value)
}

export function buildPageSlug(prefixRaw: string, segmentRaw: string) {
  const prefix = normalizeSlugPrefix(prefixRaw)
  const segment = normalizeSlugSegment(segmentRaw)
  if (!segment || !isValidSlugSegment(segment)) return ""
  return prefix ? `${prefix}/${segment}` : segment
}

export function splitPageSlug(raw: string) {
  const parts = (raw || "")
    .replace(/\\+/g, "/")
    .split("/")
    .map((part) => normalizeSlugToken(part))
    .filter(Boolean)

  if (parts.length === 0) {
    return { prefix: "", segment: "" }
  }

  const segment = parts[parts.length - 1] || ""
  const prefix = parts.slice(0, -1).join("/")
  return { prefix, segment }
}

export function derivePageSlugPrefixOptions(slugs: string[]) {
  const values = new Set<string>()
  slugs.forEach((slug) => {
    const { prefix } = splitPageSlug(slug)
    if (prefix) values.add(prefix)
  })
  return Array.from(values).sort((a, b) => a.localeCompare(b))
}
