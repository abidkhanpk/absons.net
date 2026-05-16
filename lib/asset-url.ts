import { isExternalAssetReference, normalizeAssetDbValue } from "./asset-key"

export function resolveAssetUrl(value: string | null | undefined) {
  if (!value) return value
  const normalized = normalizeAssetDbValue(value)
  if (!normalized) return normalized
  const trimmed = normalized.trim()
  if (!trimmed) return trimmed

  if (isExternalAssetReference(trimmed)) {
    return trimmed
  }

  if (trimmed.startsWith("/")) {
    return trimmed
  }
  const key = trimmed.replace(/^\/+/, "")
  return `/assets/${key}`
}
