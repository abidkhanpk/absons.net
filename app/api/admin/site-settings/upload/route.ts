import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import { put } from "@vercel/blob"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    const blobToken = process.env.BLOB_READ_WRITE_TOKEN
    const fileName = `logos/${Date.now()}-${file.name}`

    // If a Vercel Blob token exists, use Blob storage (production-safe)
    if (blobToken) {
      const blob = await put(fileName, file, { access: "public", token: blobToken })
      return NextResponse.json({ url: blob.url })
    }

    // Fallback for local/dev: write to public/uploads (not persistent in serverless)
    const uploadsDir = path.join(process.cwd(), "public", "uploads")
    await fs.mkdir(uploadsDir, { recursive: true })
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const localFileName = `${Date.now()}-${file.name}`
    const localPath = path.join(uploadsDir, localFileName)
    await fs.writeFile(localPath, buffer)
    const url = `/uploads/${localFileName}`
    return NextResponse.json({ url })
  } catch (error) {
    console.error("Logo upload error:", error)
    return NextResponse.json({ error: "Failed to upload logo" }, { status: 500 })
  }
}
