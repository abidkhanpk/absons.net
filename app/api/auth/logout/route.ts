import { NextResponse } from "next/server"

export async function POST() {
  const response = NextResponse.json({ success: true })
  const secure = process.env.VERCEL === "1" || process.env.NEXT_PUBLIC_SITE_URL?.startsWith("https")
  response.cookies.set("session", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: Boolean(secure),
    path: "/",
    maxAge: 0,
  })
  return response
}
