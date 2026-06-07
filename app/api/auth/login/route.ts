import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyPassword, signSession } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const user = await prisma.user.findFirst({ where: { email } })
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }
    if (!user.isActive) {
      return NextResponse.json({ error: "This account has been disabled" }, { status: 403 })
    }

    const token = await signSession({ userId: user.id, role: user.role, email: user.email })
    const response = NextResponse.json({ success: true })
    const secure = process.env.VERCEL === "1" || process.env.NEXT_PUBLIC_SITE_URL?.startsWith("https")
    response.cookies.set("session", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: Boolean(secure),
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Failed to login" }, { status: 500 })
  }
}
