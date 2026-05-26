"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

const DISABLED_PREFIXES = ["/admin", "/auth"]
const SECTION_VARIANTS = ["from-left", "from-right", "from-sides", "lift"] as const
const SECTION_CARD_SELECTOR = "[data-slot='card'], .why-choose-grid-tile, .why-choose-tile"
const NS_INTRO_DELAY_BASE_MS = 100
const NS_INTRO_DELAY_STEP_MS = 100
const SECTION_TRIGGER_THRESHOLD = 0.14
const CARD_TRIGGER_THRESHOLD = 0.2

type MotionConfig = {
  animateEntrance: boolean
  animateExit: boolean
}

function parseMotionFlag(value: string | null | undefined, fallback: boolean) {
  if (value === null || value === undefined) return fallback
  return value !== "false"
}

function readSectionMotionConfig(section: HTMLElement): MotionConfig {
  const isCmsSection = section.matches("[data-cms-section='true']")
  if (!isCmsSection) {
    return { animateEntrance: true, animateExit: true }
  }

  const legacyAnimate = parseMotionFlag(
    section.getAttribute("data-cms-section-animate-content"),
    !section.hasAttribute("data-motion-skip"),
  )
  const animateEntrance = parseMotionFlag(section.getAttribute("data-cms-section-animate-entrance"), legacyAnimate)
  const animateExit = parseMotionFlag(section.getAttribute("data-cms-section-animate-exit"), legacyAnimate)
  return { animateEntrance, animateExit }
}

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

    const sections = Array.from(document.querySelectorAll<HTMLElement>("main section")).filter((section) => {
      if (!section.hasAttribute("data-motion-skip")) return true
      if (!section.matches("[data-cms-section='true']")) return false
      const config = readSectionMotionConfig(section)
      return config.animateEntrance || config.animateExit
    })
    const mobileQuery = window.matchMedia("(max-width: 767px)")
    const isMobile = mobileQuery.matches
    const layoutVarsHost = document.getElementById("site-layout-vars") ?? document.documentElement
    const rootStyles = getComputedStyle(layoutVarsHost)
    const desktopPercentRaw = Number.parseFloat(rootStyles.getPropertyValue("--motion-trigger-desktop-pct"))
    const mobilePercentRaw = Number.parseFloat(rootStyles.getPropertyValue("--motion-trigger-mobile-pct"))
    const desktopPercent = Number.isFinite(desktopPercentRaw) ? Math.min(90, Math.max(0, desktopPercentRaw)) : 34
    const mobilePercent = Number.isFinite(mobilePercentRaw) ? Math.min(90, Math.max(0, mobilePercentRaw)) : 50
    const sectionRootMargin = `0px 0px -${isMobile ? mobilePercent : desktopPercent}% 0px`
    const cardRootMargin = `0px 0px -${isMobile ? mobilePercent : desktopPercent}% 0px`
    const allCards = Array.from(document.querySelectorAll<HTMLElement>(`main ${SECTION_CARD_SELECTOR}`)).filter(
      (card) =>
        !card.closest(".home-section-scroll-card") &&
        !card.closest(".scrolling-loop") &&
        !card.closest("section[data-motion-skip]"),
    )

    if (sections.length === 0 && allCards.length === 0) return

    sections.forEach((section, index) => {
      const sectionMotion = readSectionMotionConfig(section)
      const hasSectionAnimation = sectionMotion.animateEntrance || sectionMotion.animateExit

      if (!hasSectionAnimation) {
        section.classList.remove("motion-reveal", "motion-composite", "motion-enter-disabled")
        section.classList.add("is-visible")
        section.setAttribute("data-motion-enter", "false")
        section.setAttribute("data-motion-exit", "false")
        const staleNodes = Array.from(section.querySelectorAll<HTMLElement>(".motion-section-node"))
        staleNodes.forEach((node) => {
          node.classList.remove("motion-section-node")
          node.style.removeProperty("--motion-node-delay")
          node.style.removeProperty("--motion-node-duration")
          node.style.removeProperty("--motion-node-x")
          node.style.removeProperty("--motion-node-y")
        })
        const staleCmsNodes = Array.from(section.querySelectorAll<HTMLElement>(".motion-cms-section-node"))
        staleCmsNodes.forEach((node) => {
          node.classList.remove("motion-cms-section-node", "motion-node-enter-disabled", "is-visible")
          node.style.removeProperty("--motion-node-delay")
          node.style.removeProperty("--motion-node-duration")
          node.style.removeProperty("--motion-node-x")
          node.style.removeProperty("--motion-node-y")
          node.removeAttribute("data-motion-enter")
          node.removeAttribute("data-motion-exit")
        })
        const staticCards = Array.from(section.querySelectorAll<HTMLElement>(SECTION_CARD_SELECTOR)).filter(
          (card) => !card.closest(".scrolling-loop") && !card.closest(".home-section-scroll-card"),
        )
        staticCards.forEach((card) => {
          card.classList.remove("motion-card-reveal", "motion-card-enter-disabled")
          card.classList.add("is-visible")
          card.setAttribute("data-motion-enter", "false")
          card.setAttribute("data-motion-exit", "false")
        })
        return
      }

      section.classList.add("motion-reveal")
      section.setAttribute("data-motion-variant", SECTION_VARIANTS[index % SECTION_VARIANTS.length])
      section.style.setProperty("--motion-delay", `${Math.min(index * 40, 200)}ms`)
      section.setAttribute("data-motion-enter", sectionMotion.animateEntrance ? "true" : "false")
      section.setAttribute("data-motion-exit", sectionMotion.animateExit ? "true" : "false")
      if (!sectionMotion.animateEntrance) {
        section.classList.add("motion-enter-disabled", "is-visible")
      } else {
        section.classList.remove("motion-enter-disabled")
      }

      let hasHelixStyleNodes = false
      const isCmsSection = section.matches("[data-cms-section='true']")
      const shouldAnimateCmsContent = !isCmsSection || hasSectionAnimation

      if (isCmsSection && shouldAnimateCmsContent) {
        const sectionChildren = Array.from(section.children).filter((child): child is HTMLElement => child instanceof HTMLElement)
        sectionChildren.forEach((child, childIndex) => {
          child.classList.remove("motion-section-node")
          child.classList.add("motion-cms-section-node")
          child.setAttribute("data-motion-enter", sectionMotion.animateEntrance ? "true" : "false")
          child.setAttribute("data-motion-exit", sectionMotion.animateExit ? "true" : "false")
          if (!sectionMotion.animateEntrance) {
            child.classList.add("motion-node-enter-disabled", "is-visible")
          } else {
            child.classList.remove("motion-node-enter-disabled")
          }
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
        const intro = section.querySelector<HTMLElement>(".text-center")
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
      }

      const sectionCards = Array.from(section.querySelectorAll<HTMLElement>(SECTION_CARD_SELECTOR)).filter(
        (card) => !card.closest(".scrolling-loop") && !card.closest(".home-section-scroll-card"),
      )
      sectionCards.forEach((card, cardIndex) => {
        const cardAnimateEntrance = sectionMotion.animateEntrance
        const cardAnimateExit = sectionMotion.animateExit
        const hasCardAnimation = cardAnimateEntrance || cardAnimateExit
        card.classList.remove("motion-section-card", "motion-section-node")
        card.setAttribute("data-motion-enter", cardAnimateEntrance ? "true" : "false")
        card.setAttribute("data-motion-exit", cardAnimateExit ? "true" : "false")
        if (!hasCardAnimation) {
          card.classList.remove("motion-card-reveal", "motion-card-enter-disabled")
          card.classList.add("is-visible")
          return
        }
        card.classList.add("motion-card-reveal")
        card.setAttribute("data-motion-card-variant", cardIndex % 2 === 0 ? "from-left" : "from-right")
        card.style.setProperty("--motion-card-delay", `${Math.min((cardIndex % 4) * 60, 180)}ms`)
        if (!cardAnimateEntrance) {
          card.classList.add("motion-card-enter-disabled", "is-visible")
        } else {
          card.classList.remove("motion-card-enter-disabled")
        }
      })

      if (hasHelixStyleNodes) {
        section.classList.add("motion-composite")
      }
    })

    const observedCards = allCards.filter((card) => {
      const animateEntrance = parseMotionFlag(card.getAttribute("data-motion-enter"), true)
      const animateExit = parseMotionFlag(card.getAttribute("data-motion-exit"), true)
      return animateEntrance || animateExit
    })
    const observedCmsNodes = Array.from(
      document.querySelectorAll<HTMLElement>("main section[data-cms-section='true'].motion-reveal .motion-cms-section-node"),
    ).filter((node) => {
      const animateEntrance = parseMotionFlag(node.getAttribute("data-motion-enter"), true)
      const animateExit = parseMotionFlag(node.getAttribute("data-motion-exit"), true)
      return animateEntrance || animateExit
    })

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      sections.forEach((section) => section.classList.add("is-visible"))
      observedCards.forEach((card) => card.classList.add("is-visible"))
      observedCmsNodes.forEach((node) => node.classList.add("is-visible"))
      return
    }

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const target = entry.target as HTMLElement
          const animateEntrance = parseMotionFlag(target.getAttribute("data-motion-enter"), true)
          const animateExit = parseMotionFlag(target.getAttribute("data-motion-exit"), true)
          if (entry.isIntersecting) {
            if (!animateEntrance) {
              target.classList.add("motion-enter-disabled")
            } else {
              target.classList.remove("motion-enter-disabled")
            }
            target.classList.add("is-visible")
          } else {
            if (animateExit) {
              target.classList.remove("is-visible")
            } else {
              target.classList.add("is-visible")
            }
          }
        })
      },
      {
        root: null,
        rootMargin: sectionRootMargin,
        threshold: SECTION_TRIGGER_THRESHOLD,
      },
    )

    const frame = window.requestAnimationFrame(() => {
      sections.forEach((section) => sectionObserver.observe(section))
    })

    let cardObserver: IntersectionObserver | null = null
    let cmsNodeObserver: IntersectionObserver | null = null
    if (observedCards.length > 0) {
      cardObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const target = entry.target as HTMLElement
            const animateEntrance = parseMotionFlag(target.getAttribute("data-motion-enter"), true)
            const animateExit = parseMotionFlag(target.getAttribute("data-motion-exit"), true)
            if (entry.isIntersecting) {
              if (!animateEntrance) {
                target.classList.add("motion-card-enter-disabled")
              } else {
                target.classList.remove("motion-card-enter-disabled")
              }
              target.classList.add("is-visible")
            } else {
              if (animateExit) {
                target.classList.remove("is-visible")
              } else {
                target.classList.add("is-visible")
              }
            }
          })
        },
        {
          root: null,
          rootMargin: cardRootMargin,
          threshold: CARD_TRIGGER_THRESHOLD,
        },
      )
      observedCards.forEach((card) => cardObserver?.observe(card))
    }

    if (observedCmsNodes.length > 0) {
      cmsNodeObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const target = entry.target as HTMLElement
            const animateEntrance = parseMotionFlag(target.getAttribute("data-motion-enter"), true)
            const animateExit = parseMotionFlag(target.getAttribute("data-motion-exit"), true)
            if (entry.isIntersecting) {
              if (!animateEntrance) {
                target.classList.add("motion-node-enter-disabled")
              } else {
                target.classList.remove("motion-node-enter-disabled")
              }
              target.classList.add("is-visible")
            } else {
              if (animateExit) {
                target.classList.remove("is-visible")
              } else {
                target.classList.add("is-visible")
              }
            }
          })
        },
        {
          root: null,
          rootMargin: sectionRootMargin,
          threshold: SECTION_TRIGGER_THRESHOLD,
        },
      )
      observedCmsNodes.forEach((node) => cmsNodeObserver?.observe(node))
    }

    return () => {
      window.cancelAnimationFrame(frame)
      sectionObserver.disconnect()
      cardObserver?.disconnect()
      cmsNodeObserver?.disconnect()
    }
  }, [pathname, shouldEnable])

  return null
}
