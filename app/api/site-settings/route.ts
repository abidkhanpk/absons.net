import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const data = await prisma.siteSettings.findUnique({ where: { id: "site" } })

    return NextResponse.json({ settings: data })
  } catch (error) {
    console.error("Error fetching site settings:", error)
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 })
  }
}
