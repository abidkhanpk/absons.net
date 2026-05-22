"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { resolveAssetUrl } from "@/lib/asset-url"

type PageBusyLoaderProps = {
  logoUrl?: string | null
  siteTitle?: string | null
}

const MAX_WAIT_MS = 4500
const VIEWPORT_PRELOAD_MULTIPLIER = 1.2
const MIN_VISIBLE_MS = 320
const CLICK_FEEDBACK_DELAY_MS = 90
const CLICK_FEEDBACK_MAX_MS = 8000
const NON_CLICK_SHOW_DELAY_MS = 140

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

function hasPendingCriticalMedia(root: ParentNode) {
  const pendingImages = Array.from(root.querySelectorAll("img"))
    .filter(isLikelyCriticalElement)
    .some((img) => !(img.complete && img.naturalWidth > 0))

  if (pendingImages) return true

  return Array.from(root.querySelectorAll("video"))
    .filter(isLikelyCriticalElement)
    .some((video) => video.readyState < 2)
}

export function PageBusyLoader({ logoUrl, siteTitle }: PageBusyLoaderProps) {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)
  const pendingNavigationRef = useRef(false)
  const hasMountedRef = useRef(false)
  const resolvedLogo = useMemo(() => resolveAssetUrl(logoUrl || undefined) || "", [logoUrl])

  useEffect(() => {
    let showTimer = 0
    let resetTimer = 0

    const isInternalNavigationTarget = (href: string) => {
      if (!href || href.startsWith("#")) return false
      if (href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) return false
      try {
        const url = new URL(href, window.location.href)
        if (url.origin !== window.location.origin) return false
        if (url.pathname === window.location.pathname && url.search === window.location.search) return false
        return true
      } catch {
        return false
      }
    }

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return
      if (event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const target = event.target instanceof Element ? event.target.closest("a[href]") : null
      if (!(target instanceof HTMLAnchorElement)) return
      if (target.target && target.target !== "_self") return
      if (target.hasAttribute("download")) return
      if (!isInternalNavigationTarget(target.href)) return

      pendingNavigationRef.current = true
      window.clearTimeout(showTimer)
      window.clearTimeout(resetTimer)
      showTimer = window.setTimeout(() => {
        setVisible(true)
      }, CLICK_FEEDBACK_DELAY_MS)
      resetTimer = window.setTimeout(() => {
        pendingNavigationRef.current = false
        setVisible(false)
      }, CLICK_FEEDBACK_MAX_MS)
    }

    document.addEventListener("click", onClick, true)
    return () => {
      document.removeEventListener("click", onClick, true)
      window.clearTimeout(showTimer)
      window.clearTimeout(resetTimer)
    }
  }, [])

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true
      return
    }

    let cancelled = false
    let shownAt = 0
    const shouldHandleThisNavigation = pendingNavigationRef.current || visible
    if (!shouldHandleThisNavigation) return

    const sleep = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms))

    const run = async () => {
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
      const timeoutPromise = sleep(MAX_WAIT_MS)
      const readyPromise = Promise.race([
        Promise.all([domReadyPromise, loadPromise, fontsPromise]).then(() => "ready" as const),
        timeoutPromise.then(() => "timeout" as const),
      ])
      shownAt = Date.now()

      await readyPromise

      if (cancelled) return

      if (visible) {
        const elapsed = Date.now() - shownAt
        if (elapsed < MIN_VISIBLE_MS) {
          await sleep(MIN_VISIBLE_MS - elapsed)
        }
      }

      if (!cancelled) {
        pendingNavigationRef.current = false
        setVisible(false)
      }
    }

    void run()

    return () => {
      cancelled = true
      setVisible(false)
    }
  }, [pathname])

  useEffect(() => {
    if (!hasMountedRef.current) return
    if (pendingNavigationRef.current || visible) return

    let cancelled = false
    let shownAt = 0
    const sleep = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms))

    const run = async () => {
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))

      const root = document.getElementById("site-layout-vars") || document.body
      if (!hasPendingCriticalMedia(root)) return

      await sleep(NON_CLICK_SHOW_DELAY_MS)
      if (cancelled) return
      if (!hasPendingCriticalMedia(root)) return

      shownAt = Date.now()
      setVisible(true)

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
      const timeoutPromise = sleep(MAX_WAIT_MS)
      await Promise.race([Promise.all([domReadyPromise, loadPromise, fontsPromise]).then(() => undefined), timeoutPromise])

      if (cancelled) return
      const elapsed = Date.now() - shownAt
      if (elapsed < MIN_VISIBLE_MS) {
        await sleep(MIN_VISIBLE_MS - elapsed)
      }
      if (!cancelled) setVisible(false)
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [pathname, visible])

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
          <img src={resolvedLogo} alt={siteTitle || "Site logo"} className="h-24 w-auto object-contain" />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-primary text-primary-foreground text-3xl font-bold">
            {(siteTitle || "AS").slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>
    </div>
  )
}
