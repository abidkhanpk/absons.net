import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSiteSettings } from "@/lib/site-settings"
import nodemailer from "nodemailer"

type ContactStatus = "new" | "deletion_requested"

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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
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
  return parts.join(" | ") || "Unknown SMTP error."
}

async function sendContactEmail({
  name,
  email,
  phone,
  company,
  purpose,
  message,
}: {
  name: string
  email: string
  phone: string
  company: string
  purpose: string
  message: string
}) {
  const settings = await getSiteSettings({ includeSensitiveEmailSettings: true })
  const to = sanitizeField(settings.emailSettings.inquiryReceiverEmail) || sanitizeField(settings.contactEmail)
  const smtpHost = normalizeSmtpHost(sanitizeField(settings.emailSettings.smtpHost))
  const smtpPort = Number(settings.emailSettings.smtpPort)
  const smtpEncryption = settings.emailSettings.smtpEncryption || "tls"
  const smtpUser = sanitizeField(settings.emailSettings.smtpUser)
  const smtpPass = settings.emailSettings.smtpPass || ""
  const smtpSenderEmail = sanitizeField(settings.emailSettings.smtpSenderEmail)

  if (!smtpHost || !Number.isFinite(smtpPort) || smtpPort <= 0) {
    throw new Error("Email delivery is not configured. Please update SMTP settings in admin panel.")
  }
  if (!to) {
    throw new Error("Email delivery is not configured. Missing recipient email address.")
  }
  if ((smtpUser && !smtpPass) || (!smtpUser && smtpPass)) {
    throw new Error("Invalid SMTP credentials configuration.")
  }
  const envelopeFrom = resolveEnvelopeFromAddress(smtpSenderEmail, smtpUser, to)
  if (!envelopeFrom) {
    throw new Error("Email delivery is not configured. SMTP sender address must be a valid email.")
  }
  if (!isValidEmailAddress(email)) {
    throw new Error("Please provide a valid email address.")
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: Math.round(smtpPort),
    ...buildSmtpSecurityOptions(smtpEncryption),
    auth: smtpUser ? { user: smtpUser, pass: smtpPass } : undefined,
    connectionTimeout: 45000,
    greetingTimeout: 30000,
    socketTimeout: 45000,
    dnsTimeout: 30000,
  })

  const html = `
    <h2>New Contact Form Inquiry</h2>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(phone || "-")}</p>
    <p><strong>Company:</strong> ${escapeHtml(company || "-")}</p>
    <p><strong>Purpose:</strong> ${escapeHtml(purpose)}</p>
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>
  `.trim()

  const text = [
    "New Contact Form Inquiry",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone || "-"}`,
    `Company: ${company || "-"}`,
    `Purpose: ${purpose}`,
    "",
    "Message:",
    message,
  ].join("\n")

  await transporter.sendMail({
    from: {
      name: name || "Website Visitor",
      address: envelopeFrom,
    },
    to,
    envelope: {
      from: envelopeFrom,
      to: [to],
    },
    subject: purpose,
    html,
    text,
    replyTo: {
      name: name || "Website Visitor",
      address: email,
    },
  })
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>
    const name = sanitizeField(body.name)
    const email = sanitizeField(body.email)
    const phone = sanitizeField(body.phone)
    const company = sanitizeField(body.company)
    const purpose = sanitizeField(body.purpose)
    const message = sanitizeField(body.message)
    const status = sanitizeField(body.status)

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 })
    }

    const allowedStatuses = ["new", "deletion_requested"] as const
    const normalizedStatus: ContactStatus = allowedStatuses.includes(status as ContactStatus)
      ? (status as ContactStatus)
      : "new"
    if (normalizedStatus !== "deletion_requested" && !purpose) {
      return NextResponse.json({ error: "Purpose is required" }, { status: 400 })
    }

    if (normalizedStatus === "deletion_requested") {
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
    } else {
      await sendContactEmail({
        name,
        email,
        phone,
        company,
        purpose,
        message,
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Contact submission error:", err)
    if (
      err instanceof Error &&
      (/^Email delivery is not configured\./.test(err.message) ||
        /^Invalid SMTP credentials configuration\./.test(err.message) ||
        /^Please provide a valid email address\./.test(err.message))
    ) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    const reason = getSmtpFailureReason(err)
    return NextResponse.json({ error: `Failed to submit inquiry. (${reason})` }, { status: 500 })
  }
}
