const SERVER_BASE = (process.env.ASSET_PUBLIC_BASE_URL || "").replace(/\/+$/g, "")
const CLIENT_BASE =
  typeof process !== "undefined" ? (process.env.NEXT_PUBLIC_ASSET_PUBLIC_BASE_URL || "").replace(/\/+$/g, "") : ""

function hasProtocol(value: string) {
  return /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(value)
}

export function resolveAssetUrl(value: string | null | undefined) {
  if (!value) return value
  const trimmed = value.trim()
  if (!trimmed) return trimmed

  if (hasProtocol(trimmed) || trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
    return trimmed
  }

  // Legacy absolute paths should continue working unchanged.
  if (trimmed.startsWith("/")) {
    return trimmed
  }

  const base = SERVER_BASE || CLIENT_BASE
  if (base) {
    return `${base}/${trimmed.replace(/^\/+/, "")}`
  }

  // Fallback for local/public storage when no base URL is configured.
  return `/${trimmed.replace(/^\/+/, "")}`
}

