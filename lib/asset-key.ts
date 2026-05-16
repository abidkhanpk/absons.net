const DEFAULT_ASSET_STORAGE_PREFIX = "absons/uploads"

function hasProtocol(value: string) {
  return /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(value)
}

function normalizeSegment(value: string) {
  return value.replace(/^\/+|\/+$/g, "")
}

export function getAssetStoragePrefix() {
  return normalizeSegment(process.env.ASSET_STORAGE_PREFIX || DEFAULT_ASSET_STORAGE_PREFIX)
}

export function isExternalAssetReference(value: string) {
  return hasProtocol(value) || value.startsWith("data:") || value.startsWith("blob:")
}

export function stripAssetStoragePrefix(key: string, prefix = getAssetStoragePrefix()) {
  const cleanKey = normalizeSegment(key)
  const cleanPrefix = normalizeSegment(prefix)
  if (!cleanKey || !cleanPrefix) return cleanKey
  if (cleanKey === cleanPrefix) return ""
  const prefixed = `${cleanPrefix}/`
  return cleanKey.startsWith(prefixed) ? cleanKey.slice(prefixed.length) : cleanKey
}

export function ensureAssetStoragePrefix(key: string, prefix = getAssetStoragePrefix()) {
  const cleanKey = normalizeSegment(key)
  const cleanPrefix = normalizeSegment(prefix)
  if (!cleanKey || !cleanPrefix) return cleanKey
  if (cleanKey === cleanPrefix) return cleanKey
  return cleanKey.startsWith(`${cleanPrefix}/`) ? cleanKey : `${cleanPrefix}/${cleanKey}`
}

export function normalizeAssetDbValue(value: string | null | undefined): string | null | undefined {
  if (typeof value === "undefined" || value === null) return value

  const trimmed = value.trim()
  if (!trimmed) return trimmed
  if (isExternalAssetReference(trimmed)) return trimmed

  if (trimmed.startsWith("/assets/")) {
    return stripAssetStoragePrefix(trimmed.replace(/^\/assets\//, ""))
  }

  if (trimmed.startsWith("/")) {
    const maybeKey = normalizeSegment(trimmed)
    const prefix = getAssetStoragePrefix()
    if (prefix && (maybeKey === prefix || maybeKey.startsWith(`${prefix}/`))) {
      return stripAssetStoragePrefix(maybeKey, prefix)
    }
    return trimmed
  }

  return stripAssetStoragePrefix(trimmed)
}
