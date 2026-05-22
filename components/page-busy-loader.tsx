"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname } from "next/navigation"
import { resolveAssetUrl } from "@/lib/asset-url"

type PageBusyLoaderProps = {
  logoUrl?: string | null
  siteTitle?: string | null
}

const MAX_WAIT_MS = 4500
const VIEWPORT_PRELOAD_MULTIPLIER = 1.2

function isLikelyCriticalElement(el: Element) {
  if (!(el instanceof HTMLElement)) return false
  if (el.closest("[data-page-busy-loader='true']")) return false
  if (el.getAttribute("loading") === "lazy") return false
  if (el.getAttribute("aria-hidden") === "true") return false
  if (el.offsetParent === null && getComputedStyle(el).position !== "fixed") return false
  const rect = el.getBoundingClientRect()
  return rect.top <= window.innerHeight * VIEWPORT_PRELOAD_MULTIPLIER
}

function waitForCriticalMedia(root: ParentNode): Promise<void> {
  const imagePromises = Array.from(root.querySelectorAll("img"))
    .filter(isLikelyCriticalElement)
    .map((img) => {
    if (img.complete && img.naturalWidth > 0) return Promise.resolve()
    return new Promise<void>((resolve) => {
      const done = () => {
        img.removeEventListener("load", done)
        img.removeEventListener("error", done)
        resolve()
      }
      img.addEventListener("load", done, { once: true })
      img.addEventListener("error", done, { once: true })
    })
  })

  const videoPromises = Array.from(root.querySelectorAll("video"))
    .filter(isLikelyCriticalElement)
    .map((video) => {
    if (video.readyState >= 2) return Promise.resolve()
    return new Promise<void>((resolve) => {
      const done = () => {
        video.removeEventListener("loadeddata", done)
        video.removeEventListener("canplay", done)
        video.removeEventListener("error", done)
        resolve()
      }
      video.addEventListener("loadeddata", done, { once: true })
      video.addEventListener("canplay", done, { once: true })
      video.addEventListener("error", done, { once: true })
    })
  })

  return Promise.all([...imagePromises, ...videoPromises]).then(() => undefined)
}

export function PageBusyLoader({ logoUrl, siteTitle }: PageBusyLoaderProps) {
  const pathname = usePathname()
  const [visible, setVisible] = useState(true)
  const resolvedLogo = useMemo(() => resolveAssetUrl(logoUrl || undefined) || "", [logoUrl])

  useEffect(() => {
    let cancelled = false

    const hideLoaderWhenReady = async () => {
      setVisible(true)

      // Let route content mount before scanning media elements.
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))

      const root = document.getElementById("site-layout-vars") || document.body
      const loadPromise = waitForCriticalMedia(root)
      const fontsPromise = document.fonts?.ready ?? Promise.resolve()
      const domReadyPromise =
        document.readyState === "complete"
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              const done = () => {
                window.removeEventListener("load", done)
                resolve()
              }
              window.addEventListener("load", done, { once: true })
            })
      const timeoutPromise = new Promise<void>((resolve) => {
        window.setTimeout(resolve, MAX_WAIT_MS)
      })

      await Promise.race([Promise.all([domReadyPromise, loadPromise, fontsPromise]).then(() => undefined), timeoutPromise])

      if (!cancelled) {
        setVisible(false)
      }
    }

    void hideLoaderWhenReady()

    return () => {
      cancelled = true
    }
  }, [pathname])

  if (!visible) return null

  return (
    <div
      aria-live="polite"
      aria-busy="true"
      data-page-busy-loader="true"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
    >
      <div className="page-busy-loader-logo">
        {resolvedLogo ? (
          <img src={resolvedLogo} alt={siteTitle || "Site logo"} className="h-16 w-auto object-contain" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xl font-bold">
            {(siteTitle || "AS").slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>
    </div>
  )
}
