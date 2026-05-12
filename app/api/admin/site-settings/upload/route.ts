import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import sharp from "sharp"
import { saveAsset } from "@/lib/asset-storage"

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const requester = await prisma.user.findUnique({ where: { id: session.userId } })
    if (requester?.role !== "super_admin") {
      return NextResponse.json({ error: "Only super admins can upload the logo" }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get("file")
    const kind = formData.get("kind") === "favicon" ? "favicon" : "logo"

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    // Allow broader image types for logos; restrict favicon to png/ico and rescale to 32x32 PNG
    const allowedFaviconTypes = ["image/png", "image/x-icon", "image/vnd.microsoft.icon"]
    if (kind === "favicon" && !allowedFaviconTypes.includes(file.type)) {
      return NextResponse.json({ error: "Favicon must be a PNG or ICO file" }, { status: 400 })
    }

    let outputBuffer = buffer
    let outputMime = file.type || "application/octet-stream"
    let outputName = file.name

    if (kind === "favicon") {
      // Normalize favicon to 32x32 PNG
      outputBuffer = await sharp(buffer).resize(32, 32, { fit: "cover" }).png().toBuffer()
      outputMime = "image/png"
      const base = file.name.replace(/\.[^.]+$/, "")
      outputName = `${base || "favicon"}-32x32.png`
    }

    const stored = await saveAsset({
      buffer: outputBuffer,
      contentType: outputMime,
      assetType: kind === "favicon" ? "favicons" : "logos",
      fileName: outputName,
    })
    return NextResponse.json({ url: stored.url, key: stored.key, provider: stored.provider })
  } catch (error) {
    console.error("Logo upload error:", error)
    return NextResponse.json({ error: "Failed to upload logo" }, { status: 500 })
  }
}
