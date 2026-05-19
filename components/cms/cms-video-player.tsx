"use client"

import { type CSSProperties } from "react"
import { MediaPlayer, MediaProvider, Poster, Track } from "@vidstack/react"
import { DefaultAudioLayout, DefaultVideoLayout, defaultLayoutIcons } from "@vidstack/react/player/layouts/default"
import { resolveAssetUrl } from "@/lib/asset-url"

export type CmsVideoConfig = {
  src: string
  poster?: string
  title?: string
  caption?: string
  controls: boolean
  autoplay: boolean
  muted: boolean
  loop: boolean
  playsInline: boolean
  preload: "none" | "metadata" | "auto"
  aspectRatio: string
  width?: string
  height?: string
  viewType: "video" | "audio"
  streamType: "unknown" | "on-demand" | "live" | "live:dvr" | "ll-live" | "ll-live:dvr"
  logLevel: "silent" | "error" | "warn" | "info" | "debug"
  crossOrigin: boolean
  thumbnails?: string
  tracks: Array<{
    src: string
    kind: string
    label?: string
    language?: string
    default?: boolean
    type?: string
  }>
}

function parseAspectRatio(value: string) {
  const raw = value.trim()
  if (!raw) return "16/9"

  if (raw.includes("/")) {
    const [w, h] = raw.split("/")
    const width = Number.parseFloat(w || "")
    const height = Number.parseFloat(h || "")
    if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
      return `${width}/${height}`
    }
  }

  const numeric = Number.parseFloat(raw)
  return Number.isFinite(numeric) && numeric > 0 ? String(numeric) : "16/9"
}

function parseSize(value: string | undefined) {
  if (!value) return undefined
  const raw = value.trim()
  if (!raw) return undefined
  if (/^\d+(\.\d+)?$/.test(raw)) return `${raw}px`
  return raw
}

function normalizeTrackKind(value: string) {
  const normalized = value.trim().toLowerCase()
  if (normalized === "captions") return "captions"
  if (normalized === "chapters") return "chapters"
  if (normalized === "descriptions") return "descriptions"
  if (normalized === "metadata") return "metadata"
  return "subtitles"
}

export function CmsVideoPlayer({ config }: { config: CmsVideoConfig }) {
  const source = resolveAssetUrl(config.src) || config.src
  if (!source) return null

  const poster = resolveAssetUrl(config.poster || "") || undefined
  const thumbnails = resolveAssetUrl(config.thumbnails || "") || undefined
  const title = config.title?.trim() || "Video"
  const caption = config.caption?.trim() || ""
  const width = parseSize(config.width)
  const height = parseSize(config.height)
  const playerStyle: CSSProperties = {
    width: "100%",
    height: "100%",
  }
  const wrapperStyle: CSSProperties = {
    width: width || "100%",
    maxWidth: "100%",
  }
  if (height) {
    wrapperStyle.height = height
  }

  return (
    <figure className="not-prose my-6" style={wrapperStyle}>
      <MediaPlayer
        src={source}
        title={title}
        className="block bg-black text-white"
        style={playerStyle}
        aspectRatio={height ? undefined : parseAspectRatio(config.aspectRatio)}
        controls={config.controls}
        autoPlay={config.autoplay}
        muted={config.muted || config.autoplay}
        loop={config.loop}
        playsInline={config.playsInline}
        preload={config.preload}
        poster={poster}
        viewType={config.viewType}
        streamType={config.streamType}
        logLevel={config.logLevel}
        crossOrigin={config.crossOrigin ? "anonymous" : undefined}
      >
        <MediaProvider>
          {config.tracks.map((track, index) => (
            <Track
              key={`${track.src}-${index}`}
              src={resolveAssetUrl(track.src) || track.src}
              kind={normalizeTrackKind(track.kind)}
              label={track.label || undefined}
              language={track.language || undefined}
              default={Boolean(track.default)}
              type={(track.type as "vtt" | "srt" | "ssa" | "ass" | "json" | undefined) || undefined}
            />
          ))}
        </MediaProvider>
        <Poster alt={title} />
        <DefaultAudioLayout icons={defaultLayoutIcons} />
        <DefaultVideoLayout thumbnails={thumbnails} icons={defaultLayoutIcons} />
      </MediaPlayer>
      {caption ? <figcaption className="mt-2 text-sm text-muted-foreground">{caption}</figcaption> : null}
    </figure>
  )
}
