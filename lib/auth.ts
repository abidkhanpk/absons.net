import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"
import { randomBytes, scryptSync, timingSafeEqual } from "crypto"
import { cache } from "react"

const AUTH_COOKIE = "session"
const AUTH_SECRET = process.env.AUTH_SECRET

if (!AUTH_SECRET) {
  console.warn("AUTH_SECRET is not set. Set it in your environment for JWT signing.")
}

export type Session = {
  userId: string
  role: string
  email: string
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex")
  const hash = scryptSync(password, salt, 64).toString("hex")
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string) {
  const [salt, originalHash] = stored.split(":")
  if (!salt || !originalHash) return false
  const hash = scryptSync(password, salt, 64).toString("hex")
  return timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(originalHash, "hex"))
}

export async function signSession(payload: Session) {
  if (!AUTH_SECRET) throw new Error("AUTH_SECRET is not configured")
  const secret = new TextEncoder().encode(AUTH_SECRET)
  const token = await new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setExpirationTime("7d").sign(secret)
  return token
}

export async function verifySession(token: string): Promise<Session | null> {
  if (!AUTH_SECRET) return null
  try {
    const secret = new TextEncoder().encode(AUTH_SECRET)
    const { payload } = await jwtVerify(token, secret)
    return {
      userId: payload.userId as string,
      role: payload.role as string,
      email: payload.email as string,
    }
  } catch {
    return null
  }
}

export async function setSessionCookie(session: Session) {
  const token = await signSession(session)
  const cookieStore = await cookies()
  cookieStore.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

export async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.set(AUTH_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  })
}

export const getSession = cache(async (): Promise<Session | null> => {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE)?.value
  if (!token) return null
  return verifySession(token)
})
