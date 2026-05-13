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

  if (trimmed.startsWith("/")) {
    return trimmed
  }
  const key = trimmed.replace(/^\/+/, "")
  return `/assets/${key}`
}
