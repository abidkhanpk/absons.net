import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { client_name, client_company, client_position, content, rating, avatar_url, submitter_email } = body

    if (!client_name || !content || !submitter_email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create testimonial but mark it unpublished so admin can verify before making it visible
    await prisma.testimonial.create({
      data: {
        clientName: client_name,
        clientCompany: client_company || null,
        clientPosition: client_position || null,
        content,
        rating: Number(rating) || 5,
        avatarUrl: avatar_url || null,
        submitterEmail: submitter_email,
        isPublished: false,
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Public submit testimonial error:", err)
    return NextResponse.json({ error: "Failed to submit testimonial" }, { status: 500 })
  }
}
