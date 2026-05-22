"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

const DISABLED_PREFIXES = ["/admin", "/auth"]
const SECTION_VARIANTS = ["from-left", "from-right", "from-sides", "lift"] as const
const SECTION_CARD_SELECTOR = "[data-slot='card'], .why-choose-grid-tile"
const NS_INTRO_DELAY_BASE_MS = 100
const NS_INTRO_DELAY_STEP_MS = 100
const NS_CARD_DELAY_BASE_MS = 300
const NS_CARD_DELAY_STEP_MS = 200
const NS_CARD_DELAY_MAX_MS = 1300
const SECTION_TRIGGER_ROOT_MARGIN = "0px 0px -34% 0px"
const SECTION_TRIGGER_THRESHOLD = 0.14
const CARD_TRIGGER_ROOT_MARGIN = "0px 0px -50% 0px"
const CARD_TRIGGER_THRESHOLD = 0.2

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
    const isMobile = mobileQuery.matches
    const mobileCards = Array.from(document.querySelectorAll<HTMLElement>(`main ${SECTION_CARD_SELECTOR}`)).filter(
      (card) => !card.closest(".home-section-scroll-card") && !card.closest(".scrolling-loop"),
    )

    if (sections.length === 0 && mobileCards.length === 0) return

    sections.forEach((section, index) => {
      section.classList.add("motion-reveal")
      section.setAttribute("data-motion-variant", SECTION_VARIANTS[index % SECTION_VARIANTS.length])
      section.style.setProperty("--motion-delay", `${Math.min(index * 40, 200)}ms`)

      const intro = section.querySelector<HTMLElement>(".text-center")
      let hasHelixStyleNodes = false
      if (intro) {
        const introChildren = Array.from(intro.children).filter((child): child is HTMLElement => child instanceof HTMLElement)
        introChildren.forEach((child, childIndex) => {
          child.classList.add("motion-section-node")
          child.style.setProperty(
            "--motion-node-delay",
            `${Math.min(NS_INTRO_DELAY_BASE_MS + childIndex * NS_INTRO_DELAY_STEP_MS, 420)}ms`,
          )
          child.style.setProperty("--motion-node-duration", "600ms")
          child.style.setProperty("--motion-node-x", "0px")
          child.style.setProperty("--motion-node-y", "60px")
          hasHelixStyleNodes = true
        })
      } else {
        const fallbackTitle = section.querySelector<HTMLElement>("h1, h2")
        if (fallbackTitle) {
          fallbackTitle.classList.add("motion-section-node")
          fallbackTitle.style.setProperty("--motion-node-delay", `${NS_INTRO_DELAY_BASE_MS}ms`)
          fallbackTitle.style.setProperty("--motion-node-duration", "600ms")
          fallbackTitle.style.setProperty("--motion-node-x", "0px")
          fallbackTitle.style.setProperty("--motion-node-y", "60px")
          hasHelixStyleNodes = true
        }
      }

      const sectionCards = Array.from(section.querySelectorAll<HTMLElement>(SECTION_CARD_SELECTOR)).filter(
        (card) => !card.closest(".scrolling-loop") && !card.closest(".home-section-scroll-card"),
      )
      sectionCards.forEach((card, cardIndex) => {
        if (isMobile) {
          card.classList.remove("motion-section-card", "motion-section-node")
          card.classList.add("motion-card-reveal")
          card.setAttribute("data-motion-card-variant", cardIndex % 2 === 0 ? "from-left" : "from-right")
          card.style.setProperty("--motion-card-delay", `${Math.min((cardIndex % 4) * 60, 180)}ms`)
          return
        }

        card.classList.add("motion-section-card", "motion-section-node")
        const delay = Math.min(NS_CARD_DELAY_BASE_MS + cardIndex * NS_CARD_DELAY_STEP_MS, NS_CARD_DELAY_MAX_MS)
        card.style.setProperty("--motion-node-delay", `${delay}ms`)
        card.style.setProperty("--motion-node-duration", "700ms")
        card.style.setProperty("--motion-node-x", "-80px")
        card.style.setProperty("--motion-node-y", "0px")
        hasHelixStyleNodes = true
      })

      if (hasHelixStyleNodes) {
        section.classList.add("motion-composite")
      }
    })

    if (isMobile) {
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

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const target = entry.target as HTMLElement
          if (entry.isIntersecting) {
            target.classList.add("is-visible")
          } else {
            target.classList.remove("is-visible")
          }
        })
      },
      {
        root: null,
        rootMargin: SECTION_TRIGGER_ROOT_MARGIN,
        threshold: SECTION_TRIGGER_THRESHOLD,
      },
    )

    const frame = window.requestAnimationFrame(() => {
      sections.forEach((section) => sectionObserver.observe(section))
    })

    let cardObserver: IntersectionObserver | null = null
    if (isMobile && mobileCards.length > 0) {
      cardObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const target = entry.target as HTMLElement
            if (entry.isIntersecting) {
              target.classList.add("is-visible")
            } else {
              target.classList.remove("is-visible")
            }
          })
        },
        {
          root: null,
          rootMargin: CARD_TRIGGER_ROOT_MARGIN,
          threshold: CARD_TRIGGER_THRESHOLD,
        },
      )
      mobileCards.forEach((card) => cardObserver?.observe(card))
    }

    return () => {
      window.cancelAnimationFrame(frame)
      sectionObserver.disconnect()
      cardObserver?.disconnect()
    }
  }, [pathname, shouldEnable])

  return null
}
