import { NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

function sanitizeField(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function normalizeSmtpHost(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ""
  const withoutProtocol = trimmed.replace(/^smtps?:\/\//i, "")
  const withoutPath = withoutProtocol.replace(/\/.*$/, "")
  const hostPortMatch = withoutPath.match(/^([^:]+):(\d+)$/)
  if (hostPortMatch) return hostPortMatch[1].trim()
  return withoutPath.trim()
}

function extractAddressCandidate(value: string) {
  const match = value.match(/<([^>]+)>/)
  return (match?.[1] || value).trim()
}

function isValidEmailAddress(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function resolveEnvelopeFromAddress(smtpSenderEmail: string, smtpUser: string, inquiryReceiverEmail: string) {
  const senderCandidate = extractAddressCandidate(smtpSenderEmail)
  if (senderCandidate && isValidEmailAddress(senderCandidate)) return senderCandidate
  const smtpCandidate = extractAddressCandidate(smtpUser)
  if (smtpCandidate && isValidEmailAddress(smtpCandidate)) return smtpCandidate
  const receiverCandidate = extractAddressCandidate(inquiryReceiverEmail)
  if (receiverCandidate && isValidEmailAddress(receiverCandidate)) return receiverCandidate
  return ""
}

function buildSmtpSecurityOptions(mode: string) {
  if (mode === "ssl") {
    return { secure: true as const, requireTLS: false, ignoreTLS: false }
  }
  if (mode === "none") {
    return { secure: false as const, requireTLS: false, ignoreTLS: true }
  }
  return { secure: false as const, requireTLS: true, ignoreTLS: false }
}

function getSmtpFailureReason(error: unknown) {
  if (!error || typeof error !== "object") return "Unknown SMTP error."
  const err = error as {
    code?: string
    command?: string
    responseCode?: number
    response?: string
    message?: string
  }
  const parts = [
    typeof err.code === "string" && err.code.trim() ? err.code.trim() : null,
    typeof err.command === "string" && err.command.trim() ? `command=${err.command.trim()}` : null,
    typeof err.responseCode === "number" ? `responseCode=${err.responseCode}` : null,
    typeof err.response === "string" && err.response.trim() ? err.response.trim() : null,
    typeof err.message === "string" && err.message.trim() ? err.message.trim() : null,
  ].filter((part): part is string => Boolean(part))
  if (err.code === "ETIMEDOUT" && err.command === "CONN") {
    parts.push("Connection to SMTP host/port timed out.")
    parts.push("Check host/port reachability from server and encryption-port match (SSL=465, TLS/STARTTLS=587).")
  }
  return parts.join(" | ") || "Unknown SMTP error."
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const requester = await prisma.user.findUnique({ where: { id: session.userId } })
    if (requester?.role !== "super_admin") {
      return NextResponse.json({ error: "Only super admins can test SMTP settings" }, { status: 403 })
    }

    const body = (await request.json()) as Record<string, unknown>
    const inquiryReceiverEmail = sanitizeField(body.inquiryReceiverEmail)
    const smtpHost = normalizeSmtpHost(sanitizeField(body.smtpHost))
    const smtpPortCandidate = Number(body.smtpPort)
    const smtpPort = Number.isFinite(smtpPortCandidate) && smtpPortCandidate > 0 ? Math.round(smtpPortCandidate) : 0
    const smtpEncryption =
      body.smtpEncryption === "none" || body.smtpEncryption === "tls" || body.smtpEncryption === "ssl"
        ? body.smtpEncryption
        : body.smtpSecure === true
          ? "ssl"
          : "tls"
    const smtpUser = sanitizeField(body.smtpUser)
    const smtpPass = typeof body.smtpPass === "string" ? body.smtpPass : ""
    const smtpSenderEmail = sanitizeField(body.smtpSenderEmail)

    if (!inquiryReceiverEmail) {
      return NextResponse.json({ error: "Inquiry receiver email is required for SMTP testing." }, { status: 400 })
    }
    if (!smtpHost || smtpPort <= 0) {
      return NextResponse.json({ error: "SMTP host and port are required." }, { status: 400 })
    }
    if ((smtpUser && !smtpPass) || (!smtpUser && smtpPass)) {
      return NextResponse.json({ error: "Invalid SMTP credentials configuration." }, { status: 400 })
    }
    const envelopeFrom = resolveEnvelopeFromAddress(smtpSenderEmail, smtpUser, inquiryReceiverEmail)
    if (!envelopeFrom) {
      return NextResponse.json(
        {
          error: "A valid sender email is required.",
          reason:
            "SMTP sender email is missing/invalid, and SMTP username/inquiry receiver email could not be used as fallback.",
        },
        { status: 400 },
      )
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      ...buildSmtpSecurityOptions(smtpEncryption),
      auth: smtpUser ? { user: smtpUser, pass: smtpPass } : undefined,
      connectionTimeout: 45000,
      greetingTimeout: 30000,
      socketTimeout: 45000,
      dnsTimeout: 30000,
    })

    await transporter.verify()
    await transporter.sendMail({
      from: {
        name: "Site Settings SMTP Test",
        address: envelopeFrom,
      },
      to: inquiryReceiverEmail,
      envelope: {
        from: envelopeFrom,
        to: [inquiryReceiverEmail],
      },
      subject: "SMTP Test Email",
      text: [
        "SMTP settings test completed successfully.",
        `Triggered by: ${session.email}`,
        `Triggered at: ${new Date().toISOString()}`,
        `Logged in user: Yes`,
      ].join("\n"),
    })

    return NextResponse.json({ success: true, message: "SMTP test email sent successfully." })
  } catch (error) {
    const reason = getSmtpFailureReason(error)
    console.error("SMTP test failed:", error)
    return NextResponse.json({ error: "Failed to send SMTP test email.", reason }, { status: 500 })
  }
}
