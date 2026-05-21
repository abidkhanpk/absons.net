"use client"

import { useMemo } from "react"
import { CmsVideoPlayer, type CmsVideoConfig } from "@/components/cms/cms-video-player"
import { resolveAssetUrl } from "@/lib/asset-url"

type RenderPart =
  | {
      type: "html"
      html: string
      key: string
    }
  | {
      type: "video"
      config: CmsVideoConfig
      key: string
    }

const VIDEO_BLOCK_PATTERN = /<figure\b[^>]*data-cms-video(?:=(['"])true\1)?[^>]*>[\s\S]*?<\/figure>/gi
const LEADING_PARAGRAPH_PATTERN = /^\s*<p(?:\s+[^>]*)?>([\s\S]*?)<\/p>/i
const IMG_TAG_PATTERN = /<img\b[^>]*>/gi
const IMG_SRC_ATTR_PATTERN = /\bsrc=(["'])([\s\S]*?)\1/i

function isVisuallyEmptyParagraph(innerHtml: string) {
  const withoutLineBreaks = innerHtml.replace(/<br\s*\/?>/gi, "")
  const withoutInlineWrappers = withoutLineBreaks.replace(/<\/?(span|strong|em|u|b|i|small|mark|sup|sub)[^>]*>/gi, "")
  const withoutEntities = withoutInlineWrappers
    .replace(/&nbsp;|&#160;|&#xa0;|&#xA0;/gi, "")
    .replace(/&ZeroWidthSpace;|&#8203;|&#x200B;/gi, "")
  const withoutInvisibleChars = withoutEntities.replace(/[\u00A0\u200B\u200C\u200D\uFEFF]/g, "")
  const withoutWhitespace = withoutInvisibleChars.replace(/\s+/g, "")
  return withoutWhitespace.length === 0
}

function stripLeadingEmptyParagraphs(html: string) {
  let output = html
  while (true) {
    const match = output.match(LEADING_PARAGRAPH_PATTERN)
    if (!match) return output
    const full = match[0]
    const inner = match[1] || ""
    if (!isVisuallyEmptyParagraph(inner)) return output
    output = output.slice(full.length)
  }
}

function resolveInlineImageSources(html: string) {
  return html.replace(IMG_TAG_PATTERN, (tag) => {
    const match = tag.match(IMG_SRC_ATTR_PATTERN)
    let nextTag = tag
    if (match) {
      const quote = match[1]
      const source = decodeHtmlEntities(match[2] || "").trim()
      if (source) {
        const resolved = resolveAssetUrl(source) || source
        if (resolved !== source) {
          nextTag = tag.replace(IMG_SRC_ATTR_PATTERN, `src=${quote}${resolved}${quote}`)
        }
      }
    }

    const imageLink = getAttr(nextTag, "data-image-link").trim()
    if (!imageLink) return nextTag
    const href = escapeHtmlAttribute(imageLink)
    return `<a href="${href}">${nextTag}</a>`
  })
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
}

function escapeHtmlAttribute(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

function getAttr(tag: string, attrName: string) {
  const escaped = attrName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const match = tag.match(new RegExp(`${escaped}=(["'])([\\s\\S]*?)\\1`, "i"))
  return match?.[2] ? decodeHtmlEntities(match[2]) : ""
}

function parseBoolean(value: string, fallback: boolean) {
  if (!value) return fallback
  return value.trim().toLowerCase() === "true"
}

function normalizePreload(value: string): "none" | "metadata" | "auto" {
  const normalized = value.trim().toLowerCase()
  if (normalized === "none" || normalized === "auto") return normalized
  return "metadata"
}

function normalizeViewType(value: string): "video" | "audio" {
  return value.trim().toLowerCase() === "audio" ? "audio" : "video"
}

function normalizeStreamType(value: string): "unknown" | "on-demand" | "live" | "live:dvr" | "ll-live" | "ll-live:dvr" {
  const normalized = value.trim().toLowerCase()
  if (normalized === "unknown") return "unknown"
  if (normalized === "live") return "live"
  if (normalized === "live:dvr") return "live:dvr"
  if (normalized === "ll-live") return "ll-live"
  if (normalized === "ll-live:dvr") return "ll-live:dvr"
  return "on-demand"
}

function normalizeLogLevel(value: string): "silent" | "error" | "warn" | "info" | "debug" {
  const normalized = value.trim().toLowerCase()
  if (normalized === "silent" || normalized === "error" || normalized === "info" || normalized === "debug") {
    return normalized
  }
  return "warn"
}

function normalizeMenuGroup(value: string): "top" | "bottom" {
  return value.trim().toLowerCase() === "bottom" ? "bottom" : "top"
}

function normalizeAlign(value: string): "left" | "center" | "right" {
  const normalized = value.trim().toLowerCase()
  if (normalized === "center") return "center"
  if (normalized === "right") return "right"
  return "left"
}

function parseTracks(value: string) {
  const raw = value.trim()
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((item) => item && typeof item === "object")
      .map((item) => {
        const track = item as Record<string, unknown>
        return {
          src: typeof track.src === "string" ? track.src.trim() : "",
          kind: typeof track.kind === "string" ? track.kind.trim() : "subtitles",
          label: typeof track.label === "string" ? track.label.trim() : "",
          language:
            typeof track.language === "string"
              ? track.language.trim()
              : typeof track.lang === "string"
                ? track.lang.trim()
                : "",
          default: Boolean(track.default),
          type: typeof track.type === "string" ? track.type.trim() : "vtt",
        }
      })
      .filter((track) => track.src.length > 0)
  } catch {
    return []
  }
}

function parseVideoBlock(blockHtml: string): CmsVideoConfig | null {
  const openingTagMatch = blockHtml.match(/<figure\b([^>]*)>/i)
  if (!openingTagMatch) return null

  const tag = openingTagMatch[1] || ""
  const src = getAttr(tag, "data-video-src").trim()
  if (!src) return null

  const captionMatch = blockHtml.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i)
  const captionRaw = captionMatch ? captionMatch[1] || "" : ""
  const caption = decodeHtmlEntities(captionRaw.replace(/<[^>]+>/g, "").trim())

  return {
    src,
    poster: getAttr(tag, "data-video-poster").trim() || undefined,
    title: getAttr(tag, "data-video-title").trim() || "Video",
    caption: caption || undefined,
    align: normalizeAlign(getAttr(tag, "data-video-align")),
    controls: parseBoolean(getAttr(tag, "data-video-controls"), true),
    autoplay: parseBoolean(getAttr(tag, "data-video-autoplay"), false),
    muted: parseBoolean(getAttr(tag, "data-video-muted"), false),
    loop: parseBoolean(getAttr(tag, "data-video-loop"), false),
    playsInline: parseBoolean(getAttr(tag, "data-video-playsinline"), true),
    preload: normalizePreload(getAttr(tag, "data-video-preload")),
    aspectRatio: getAttr(tag, "data-video-aspect").trim() || "16/9",
    width: getAttr(tag, "data-video-width").trim() || undefined,
    height: getAttr(tag, "data-video-height").trim() || undefined,
    viewType: normalizeViewType(getAttr(tag, "data-video-view-type")),
    streamType: normalizeStreamType(getAttr(tag, "data-video-stream-type")),
    logLevel: normalizeLogLevel(getAttr(tag, "data-video-log-level")),
    menuGroup: normalizeMenuGroup(getAttr(tag, "data-video-menu-group")),
    crossOrigin: parseBoolean(getAttr(tag, "data-video-crossorigin"), true),
    thumbnails: getAttr(tag, "data-video-thumbnails").trim() || undefined,
    tracks: parseTracks(getAttr(tag, "data-video-tracks")),
  }
}

function splitContent(content: string): RenderPart[] {
  const html = resolveInlineImageSources(stripLeadingEmptyParagraphs(content || ""))
  const pattern = new RegExp(VIDEO_BLOCK_PATTERN.source, "gi")
  const parts: RenderPart[] = []
  let cursor = 0
  let index = 0

  for (const match of html.matchAll(pattern)) {
    const block = match[0]
    const blockIndex = match.index ?? -1
    if (!block || blockIndex < 0) continue

    const before = html.slice(cursor, blockIndex)
    if (before) {
      parts.push({ type: "html", html: before, key: `html-${index}` })
      index += 1
    }

    const config = parseVideoBlock(block)
    if (config) {
      parts.push({ type: "video", config, key: `video-${index}` })
    } else {
      parts.push({ type: "html", html: block, key: `html-${index}` })
    }
    index += 1
    cursor = blockIndex + block.length
  }

  const tail = html.slice(cursor)
  if (tail || parts.length === 0) {
    parts.push({ type: "html", html: tail, key: `html-${index}` })
  }

  return parts
}

export function RichContentRenderer({ content, className }: { content: string; className?: string }) {
  const parts = useMemo(() => splitContent(content), [content])

  return (
    <div className={className}>
      {parts.map((part) =>
        part.type === "html" ? (
          part.html ? <div key={part.key} dangerouslySetInnerHTML={{ __html: part.html }} /> : null
        ) : (
          <CmsVideoPlayer key={part.key} config={part.config} />
        ),
      )}
    </div>
  )
}
