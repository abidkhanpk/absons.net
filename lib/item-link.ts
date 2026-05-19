const NEW_TAB_PREFIX = "__new_tab__:"

export type ItemLinkTargetMode = "same_tab" | "new_tab"

function hasScheme(value: string) {
  return /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(value)
}

function looksLikeDomain(value: string) {
  return /^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+([/:?#].*)?$/.test(value)
}

function normalizeNavigableHref(raw: string | null | undefined) {
  const value = typeof raw === "string" ? raw.trim() : ""
  if (!value) return null
  if (/^javascript:/i.test(value)) return null
  if (value.startsWith("/") || value.startsWith("#") || value.startsWith("?")) return value
  if (value.startsWith("./") || value.startsWith("../")) return value
  if (hasScheme(value)) return value
  if (looksLikeDomain(value)) return `https://${value}`
  if (/\s/.test(value)) return null
  return `/${value.replace(/^\/+/, "")}`
}

export function decodeStoredItemLink(rawLink: string | null | undefined) {
  const value = typeof rawLink === "string" ? rawLink.trim() : ""
  if (!value) return { href: "", target: "same_tab" as ItemLinkTargetMode }

  if (value.toLowerCase().startsWith(NEW_TAB_PREFIX)) {
    return {
      href: value.slice(NEW_TAB_PREFIX.length).trim(),
      target: "new_tab" as ItemLinkTargetMode,
    }
  }

  return { href: value, target: "same_tab" as ItemLinkTargetMode }
}

export function encodeStoredItemLink(href: string | null | undefined, target: ItemLinkTargetMode) {
  const value = typeof href === "string" ? href.trim() : ""
  if (!value) return target === "new_tab" ? NEW_TAB_PREFIX : ""
  const normalizedValue = value.toLowerCase().startsWith(NEW_TAB_PREFIX)
    ? value.slice(NEW_TAB_PREFIX.length).trim()
    : value
  return target === "new_tab" ? `${NEW_TAB_PREFIX}${normalizedValue}` : normalizedValue
}

export function resolveItemLinkHref(link: string | null | undefined, fallback: string) {
  const parsed = decodeStoredItemLink(link)
  return normalizeNavigableHref(parsed.href) ?? normalizeNavigableHref(fallback) ?? "/"
}

export function getItemLinkTargetMode(link: string | null | undefined): ItemLinkTargetMode {
  return decodeStoredItemLink(link).target
}

export function getItemLinkTargetProps(link: string | null | undefined) {
  if (getItemLinkTargetMode(link) === "new_tab") {
    return {
      target: "_blank" as const,
      rel: "noopener noreferrer",
    }
  }

  return {}
}
