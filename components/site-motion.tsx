"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

const DISABLED_PREFIXES = ["/admin", "/auth"]

export function SiteMotion() {
  const pathname = usePathname()
  const shouldEnable = !DISABLED_PREFIXES.some((prefix) => pathname.startsWith(prefix))

  useEffect(() => {
    const body = document.body
    if (!shouldEnable) {
      body.classList.remove("site-motion-enabled")
      return
    }

    body.classList.add("site-motion-enabled")

    const sections = Array.from(document.querySelectorAll<HTMLElement>("main section:not([data-motion-skip])"))
    if (sections.length === 0) return

    sections.forEach((section, index) => {
      section.classList.add("motion-reveal")
      section.style.setProperty("--motion-delay", `${Math.min(index * 70, 420)}ms`)
    })

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      sections.forEach((section) => section.classList.add("is-visible"))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const target = entry.target as HTMLElement
          target.classList.add("is-visible")
          observer.unobserve(target)
        })
      },
      {
        root: null,
        rootMargin: "0px 0px -12% 0px",
        threshold: 0.12,
      },
    )

    sections.forEach((section) => observer.observe(section))

    return () => {
      observer.disconnect()
    }
  }, [pathname, shouldEnable])

  return null
}

