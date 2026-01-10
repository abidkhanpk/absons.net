import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { name, email, phone, company, message, status } = await request.json()
    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 })
    }

    const allowedStatuses = ["new", "deletion_requested"] as const
    const normalizedStatus = allowedStatuses.includes(status) ? status : "new"

    await prisma.contactInquiry.create({
      data: {
        name,
        email,
        phone,
        company,
        message,
        status: normalizedStatus,
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Contact submission error:", err)
    return NextResponse.json({ error: "Failed to submit inquiry" }, { status: 500 })
  }
}
