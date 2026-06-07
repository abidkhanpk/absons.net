import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { saveAsset } from "@/lib/asset-storage"

const ALLOWED_ROLES = new Set(["editor", "admin", "super_admin"])

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const requester = await prisma.user.findUnique({ where: { id: session.userId }, select: { role: true, isActive: true } })
    if (!requester?.isActive || !ALLOWED_ROLES.has(requester.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get("file")
    const folderRaw = formData.get("folder")
    const folder = typeof folderRaw === "string" && folderRaw.trim() ? folderRaw.trim() : "images"

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }
    const isImage = file.type.startsWith("image/")
    const isVideo = file.type.startsWith("video/")
    if (!isImage && !isVideo) {
      return NextResponse.json({ error: "Only image or video files are allowed" }, { status: 400 })
    }

    const outputName = file.name
    const outputBuffer = Buffer.from(await file.arrayBuffer())
    const outputMime = file.type || "application/octet-stream"
    const stored = await saveAsset({
      buffer: outputBuffer,
      contentType: outputMime,
      assetType: folder,
      fileName: outputName,
    })
    return NextResponse.json({ url: stored.url, key: stored.key, provider: stored.provider })
  } catch (error) {
    console.error("Asset upload error:", error)
    return NextResponse.json({ error: "Failed to upload asset" }, { status: 500 })
  }
}
