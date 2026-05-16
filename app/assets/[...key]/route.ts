import { NextResponse } from "next/server"
import { ensureAssetStoragePrefix, getAssetStoragePrefix, stripAssetStoragePrefix } from "@/lib/asset-key"

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
  const prefix = getAssetStoragePrefix()
  const storageKey = ensureAssetStoragePrefix(key, prefix)
  const normalizedBase = base.replace(/\/+$/g, "")
  const basePath = (() => {
    try {
      return normalizeSegment(new URL(normalizedBase).pathname)
    } catch {
      return ""
    }
  })()
  const finalKey =
    prefix && basePath.endsWith(prefix) ? stripAssetStoragePrefix(storageKey, prefix) : storageKey
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

  const storageKey = ensureAssetStoragePrefix(cleanKey, getAssetStoragePrefix())
  return NextResponse.redirect(`/${storageKey}`)
}
