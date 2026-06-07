import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type SeoPayload = {
  seoTitle: string
  seoDescription: string
  seoKeywords: string[]
}

const SEO_SYSTEM_PROMPT =
  "You are a senior SEO and AI discoverability strategist. Produce metadata that improves search engine ranking potential, click-through relevance, and AI answer-engine retrieval relevance. Use only supplied content, avoid unsupported claims, avoid keyword stuffing, prefer clear intent-matching language, and return JSON only."

const SEO_USER_TASK_PROMPT =
  "Generate: (1) seoTitle: concise, specific, high-intent title (ideally ~50-65 chars) with the primary topic and brand when natural. (2) seoDescription: clear value-focused description (ideally ~140-160 chars) aligned to user intent. (3) seoKeywords: 8-12 unique keyword phrases mixing primary, secondary, long-tail, and entity-focused terms useful for both web search and AI retrieval. No markdown, no numbering, no duplicate keywords."

function sanitizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function stripHtml(raw: string) {
  return raw
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;|&#xa0;|&#xA0;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim()
}

function tryParseJsonObject(raw: string): Record<string, unknown> | null {
  const text = raw.trim()
  if (!text) return null

  try {
    const parsed = JSON.parse(text)
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : null
  } catch {
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)?.[1]
    if (!fenced) return null
    try {
      const parsed = JSON.parse(fenced)
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : null
    } catch {
      return null
    }
  }
}

function normalizeSeoPayload(raw: Record<string, unknown>): SeoPayload {
  const seoTitle = sanitizeText(raw.seoTitle).slice(0, 72)
  const seoDescription = sanitizeText(raw.seoDescription).slice(0, 180)
  const rawKeywords = raw.seoKeywords
  const list =
    Array.isArray(rawKeywords)
      ? rawKeywords
      : typeof rawKeywords === "string"
        ? rawKeywords.split(",")
        : []
  const seoKeywords = list
    .map((entry) => sanitizeText(entry))
    .filter(Boolean)
    .slice(0, 12)

  return { seoTitle, seoDescription, seoKeywords }
}

function buildPrompt(input: { siteTitle: string; title: string; slug: string; excerpt: string; content: string; kind: string }) {
  return [
    `Site title: ${input.siteTitle || "Site"}`,
    `Content type: ${input.kind}`,
    `Record title: ${input.title || "(none)"}`,
    `Slug: ${input.slug || "(none)"}`,
    `Excerpt: ${input.excerpt || "(none)"}`,
    "",
    "Main content:",
    input.content || "(none)",
  ].join("\n")
}

async function generateWithOpenAi(apiKey: string, prompt: string): Promise<SeoPayload> {
  const schema = {
    type: "object",
    properties: {
      seoTitle: { type: "string" },
      seoDescription: { type: "string" },
      seoKeywords: {
        type: "array",
        items: { type: "string" },
      },
    },
    required: ["seoTitle", "seoDescription", "seoKeywords"],
    additionalProperties: false,
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.2,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "seo_metadata",
          strict: true,
          schema,
        },
      },
      messages: [
        {
          role: "system",
          content: SEO_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: `${prompt}\n\n${SEO_USER_TASK_PROMPT}`,
        },
      ],
    }),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message = typeof data?.error?.message === "string" ? data.error.message : "OpenAI request failed"
    throw new Error(message)
  }

  const content = data?.choices?.[0]?.message?.content
  if (typeof content !== "string") {
    throw new Error("OpenAI returned an invalid response format")
  }
  const parsed = tryParseJsonObject(content)
  if (!parsed) throw new Error("OpenAI response could not be parsed as JSON")
  return normalizeSeoPayload(parsed)
}

async function generateWithGemini(apiKey: string, prompt: string): Promise<SeoPayload> {
  const responseSchema = {
    type: "object",
    properties: {
      seoTitle: { type: "string" },
      seoDescription: { type: "string" },
      seoKeywords: {
        type: "array",
        items: { type: "string" },
      },
    },
    required: ["seoTitle", "seoDescription", "seoKeywords"],
  }

  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: SEO_SYSTEM_PROMPT }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: `${prompt}\n\n${SEO_USER_TASK_PROMPT}` }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema,
        responseJsonSchema: responseSchema,
      },
    }),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message = typeof data?.error?.message === "string" ? data.error.message : "Gemini request failed"
    throw new Error(message)
  }

  const contentParts = data?.candidates?.[0]?.content?.parts
  const rawText = Array.isArray(contentParts)
    ? contentParts
        .map((part) => (typeof part?.text === "string" ? part.text : ""))
        .join("")
        .trim()
    : ""
  if (!rawText) {
    throw new Error("Gemini returned an empty response")
  }

  const parsed = tryParseJsonObject(rawText)
  if (!parsed) throw new Error("Gemini response could not be parsed as JSON")
  return normalizeSeoPayload(parsed)
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { role: true, isActive: true } })
    if (!user?.isActive || (user.role !== "admin" && user.role !== "super_admin" && user.role !== "editor")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const title = sanitizeText(body?.title)
    const slug = sanitizeText(body?.slug)
    const excerpt = sanitizeText(body?.excerpt)
    const kind = sanitizeText(body?.kind) || "page"
    const contentHtml = sanitizeText(body?.content)
    const contentText = stripHtml(contentHtml).slice(0, 10000)

    if (!title && !contentText) {
      return NextResponse.json({ error: "Title or content is required to generate SEO." }, { status: 400 })
    }

    const settings = await prisma.siteSettings.findUnique({
      where: { id: "site" },
      select: {
        siteTitle: true,
        seoAiProvider: true,
        openaiApiKey: true,
        geminiApiKey: true,
      },
    })

    if (!settings) {
      return NextResponse.json({ error: "Site settings not found." }, { status: 404 })
    }

    const openaiApiKey = sanitizeText(settings.openaiApiKey)
    const geminiApiKey = sanitizeText(settings.geminiApiKey)
    const preferredProvider = settings.seoAiProvider === "gemini" ? "gemini" : "openai"
    const provider =
      preferredProvider === "gemini"
        ? geminiApiKey
          ? "gemini"
          : openaiApiKey
            ? "openai"
            : null
        : openaiApiKey
          ? "openai"
          : geminiApiKey
            ? "gemini"
            : null

    if (!provider) {
      return NextResponse.json(
        { error: "Configure OpenAI or Gemini API key first in Settings → SEO → AI SEO Generator." },
        { status: 400 },
      )
    }

    const prompt = buildPrompt({
      siteTitle: settings.siteTitle || "Site",
      title,
      slug,
      excerpt,
      content: contentText,
      kind,
    })

    const generated =
      provider === "gemini"
        ? await generateWithGemini(geminiApiKey, prompt)
        : await generateWithOpenAi(openaiApiKey, prompt)

    return NextResponse.json({
      seoTitle: generated.seoTitle,
      seoDescription: generated.seoDescription,
      seoKeywords: generated.seoKeywords.join(", "),
      provider,
    })
  } catch (error) {
    console.error("SEO generation failed:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate SEO metadata" },
      { status: 500 },
    )
  }
}
