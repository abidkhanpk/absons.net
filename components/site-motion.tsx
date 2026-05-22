"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

const DISABLED_PREFIXES = ["/admin", "/auth"]
const SECTION_VARIANTS = ["from-left", "from-right", "from-sides", "lift"] as const

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
    const mobileQuery = window.matchMedia("(max-width: 767px)")
    const mobileCards = Array.from(document.querySelectorAll<HTMLElement>("main [data-slot='card']")).filter(
      (card) => !card.closest(".home-section-scroll-card") && !card.closest(".scrolling-loop"),
    )

    if (sections.length === 0 && mobileCards.length === 0) return

    sections.forEach((section, index) => {
      section.classList.add("motion-reveal")
      section.setAttribute("data-motion-variant", SECTION_VARIANTS[index % SECTION_VARIANTS.length])
      section.style.setProperty("--motion-delay", `${Math.min(index * 40, 200)}ms`)
    })

    if (mobileQuery.matches) {
      mobileCards.forEach((card, index) => {
        card.classList.add("motion-card-reveal")
        card.setAttribute("data-motion-card-variant", index % 2 === 0 ? "from-left" : "from-right")
        card.style.setProperty("--motion-card-delay", `${Math.min((index % 4) * 60, 180)}ms`)
      })
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      sections.forEach((section) => section.classList.add("is-visible"))
      mobileCards.forEach((card) => card.classList.add("is-visible"))
      return
    }

    const revealNow = (element: HTMLElement, viewportRatio: number) => {
      const rect = element.getBoundingClientRect()
      return rect.top <= window.innerHeight * viewportRatio
    }

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const target = entry.target as HTMLElement
          target.classList.add("is-visible")
          sectionObserver.unobserve(target)
        })
      },
      {
        root: null,
        rootMargin: "0px 0px 24% 0px",
        threshold: 0.04,
      },
    )

    const frame = window.requestAnimationFrame(() => {
      sections.forEach((section) => {
        if (section.classList.contains("is-visible") || revealNow(section, 0.9)) {
          section.classList.add("is-visible")
          return
        }
        sectionObserver.observe(section)
      })
    })

    let cardObserver: IntersectionObserver | null = null
    if (mobileQuery.matches && mobileCards.length > 0) {
      cardObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return
            const target = entry.target as HTMLElement
            target.classList.add("is-visible")
            cardObserver?.unobserve(target)
          })
        },
        {
          root: null,
          rootMargin: "0px 0px 18% 0px",
          threshold: 0.1,
        },
      )
      mobileCards.forEach((card) => {
        if (card.classList.contains("is-visible") || revealNow(card, 0.93)) {
          card.classList.add("is-visible")
          return
        }
        cardObserver?.observe(card)
      })
    }

    return () => {
      window.cancelAnimationFrame(frame)
      sectionObserver.disconnect()
      cardObserver?.disconnect()
    }
  }, [pathname, shouldEnable])

  return null
}
