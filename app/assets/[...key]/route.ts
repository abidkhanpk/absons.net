import { NextResponse } from "next/server"

function deriveBlobBaseFromToken(token: string | undefined) {
  if (!token) return ""
  const match = token.match(/^vercel_blob_rw_([^_]+)_/)
  if (!match?.[1]) return ""
  return `https://${match[1].toLowerCase()}.public.blob.vercel-storage.com`
}

function getBaseUrl() {
  const explicit = (process.env.ASSET_PUBLIC_BASE_URL || "").trim().replace(/\/+$/g, "")
  if (explicit) return explicit
  return deriveBlobBaseFromToken(process.env.BLOB_READ_WRITE_TOKEN)
}

function normalizeSegment(value: string) {
  return value.replace(/^\/+|\/+$/g, "")
}

function buildAssetRedirectUrl(base: string, key: string) {
  const prefix = normalizeSegment(process.env.ASSET_STORAGE_PREFIX || "")
  let finalKey = normalizeSegment(key)
  const normalizedBase = base.replace(/\/+$/g, "")

  // If key already includes the storage prefix and base URL ends with the same prefix path,
  // avoid duplicating it in the final URL.
  if (prefix) {
    const basePath = (() => {
      try {
        return normalizeSegment(new URL(normalizedBase).pathname)
      } catch {
        return ""
      }
    })()
    const keyWithSlash = `${prefix}/`
    if (basePath.endsWith(prefix) && (finalKey === prefix || finalKey.startsWith(keyWithSlash))) {
      finalKey = finalKey.slice(prefix.length).replace(/^\/+/, "")
    }
  }

  return `${normalizedBase}/${finalKey}`
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ key: string[] }> },
) {
  const params = await context.params
  const rawKey = Array.isArray(params.key) ? params.key.join("/") : ""
  const cleanKey = rawKey.replace(/^\/+/, "")
  if (!cleanKey) {
    return NextResponse.json({ error: "Missing asset key" }, { status: 400 })
  }

  const base = getBaseUrl()
  if (base) {
    return NextResponse.redirect(buildAssetRedirectUrl(base, cleanKey))
  }

  return NextResponse.redirect(`/${cleanKey}`)
}
