import { promises as fs } from "fs"
import path from "path"
import { put } from "@vercel/blob"

type SaveAssetParams = {
  buffer: Buffer
  contentType: string
  assetType: string
  fileName: string
}

function getStorageConfig() {
  const storageType = (process.env.ASSET_STORAGE_TYPE || "auto").toLowerCase()
  const keyPrefix = (process.env.ASSET_STORAGE_PREFIX || "absons/uploads").replace(/^\/+|\/+$/g, "")
  const publicBaseUrl = (process.env.ASSET_PUBLIC_BASE_URL || "").replace(/\/+$/g, "")
  return { storageType, keyPrefix, publicBaseUrl }
}

function sanitizeSegment(value: string, fallback: string) {
  const cleaned = value.trim().replace(/[^a-zA-Z0-9/_-]/g, "").replace(/^\/+|\/+$/g, "")
  return cleaned || fallback
}

function sanitizeFileName(fileName: string) {
  const safe = fileName.trim().replace(/[^a-zA-Z0-9._-]/g, "-")
  return safe || "asset.bin"
}

function toPublicUrl(key: string, publicBaseUrl: string, fallbackAbsoluteUrl?: string) {
  if (publicBaseUrl) {
    return `${publicBaseUrl}/${key}`
  }
  if (fallbackAbsoluteUrl) {
    return fallbackAbsoluteUrl
  }
  return `/${key}`
}

export function buildAssetKey(assetType: string, fileName: string, keyPrefix = "absons/uploads") {
  const safeType = sanitizeSegment(assetType, "images")
  const safeName = sanitizeFileName(fileName)
  return `${keyPrefix}/${safeType}/${Date.now()}-${safeName}`
}

export async function saveAsset({ buffer, contentType, assetType, fileName }: SaveAssetParams) {
  const { storageType, keyPrefix, publicBaseUrl } = getStorageConfig()
  const key = buildAssetKey(assetType, fileName, keyPrefix)
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN
  const useBlob = storageType === "vercel_blob" || (storageType === "auto" && Boolean(blobToken))

  if (useBlob) {
    if (!blobToken) {
      throw new Error("BLOB_READ_WRITE_TOKEN is required when ASSET_STORAGE_TYPE is vercel_blob")
    }
    if (!publicBaseUrl) {
      throw new Error("ASSET_PUBLIC_BASE_URL is required when using key-based storage with vercel_blob")
    }
    const blob = await put(key, buffer, {
      access: "public",
      token: blobToken,
      contentType,
      addRandomSuffix: false,
      allowOverwrite: true,
    })
    return { key, url: toPublicUrl(key, publicBaseUrl, blob.url), provider: "vercel_blob" as const }
  }

  const localPath = path.join(process.cwd(), "public", ...key.split("/"))
  await fs.mkdir(path.dirname(localPath), { recursive: true })
  await fs.writeFile(localPath, buffer)
  return { key, url: toPublicUrl(key, publicBaseUrl), provider: "local" as const }
}
