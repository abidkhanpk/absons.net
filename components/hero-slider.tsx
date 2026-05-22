"use client"

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, ArrowLeft, ArrowRight as ArrowRightIcon } from "lucide-react"
import Link from "next/link"
import type { HeroSlide } from "@/lib/site-settings"

type HeroSliderProps = {
  slides: HeroSlide[]
  mode: "static" | "parallax"
  staticIndex: number
  autoplaySeconds: number
  height?: number
}

const DEFAULT_HERO_TITLE = "Empowering Organizations with Innovative Software Solutions"
const DEFAULT_HERO_SUBTITLE =
  "Specialized software for educational institutions, Quran academies, professional training, and complete order supply solutions."
const HERO_WORD_STAGGER_SECONDS = 0.055
const HERO_TITLE_DELAY_SECONDS = 0.08
const HERO_CONTENT_BUFFER_SECONDS = 0.18

function splitHeroWords(text: string) {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean)
}

function toMs(seconds: number) {
  return `${Math.max(0, seconds * 1000)}ms`
}

export function HeroSlider({ slides, mode, staticIndex, autoplaySeconds, height }: HeroSliderProps) {
  const safeSlides = useMemo(() => (slides && slides.length > 0 ? slides : []), [slides])
  const [active, setActive] = useState(0)
  const [compactMode, setCompactMode] = useState(false)
  const [mobileParallaxFallback, setMobileParallaxFallback] = useState(false)
  const frameRef = useRef<HTMLDivElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px), (hover: none) and (pointer: coarse)")
    const apply = () => setMobileParallaxFallback(query.matches)
    apply()
    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", apply)
      return () => query.removeEventListener("change", apply)
    }
    query.addListener(apply)
    return () => query.removeListener(apply)
  }, [])

  useEffect(() => {
    if (mode !== "parallax" || safeSlides.length <= 1) return
    const ms = Math.max(2000, (autoplaySeconds || 6) * 1000)
    const id = setTimeout(() => {
      setActive((prev) => (prev + 1) % safeSlides.length)
    }, ms)
    return () => clearTimeout(id)
  }, [autoplaySeconds, mode, safeSlides.length, active])

  useEffect(() => {
    if (mode === "static" && safeSlides.length > 0) {
      const idx = Math.min(Math.max(staticIndex || 0, 0), safeSlides.length - 1)
      setActive(idx)
    }
  }, [mode, safeSlides.length, staticIndex])

  const currentSlide =
    mode === "static" ? safeSlides[Math.min(Math.max(staticIndex || 0, 0), safeSlides.length - 1)] : safeSlides[active]
  const slideTitle = currentSlide?.title || DEFAULT_HERO_TITLE
  const slideSubtitle = currentSlide?.subtitle || DEFAULT_HERO_SUBTITLE
  const shouldShowSubtitle = Boolean(currentSlide?.subtitle || currentSlide?.ctaText || currentSlide?.ctaHref)
  const titleWords = useMemo(() => splitHeroWords(slideTitle), [slideTitle])
  const subtitleWords = useMemo(() => splitHeroWords(slideSubtitle), [slideSubtitle])
  const subtitleStartDelay = HERO_TITLE_DELAY_SECONDS + titleWords.length * HERO_WORD_STAGGER_SECONDS + 0.12
  const contentEndDelay = shouldShowSubtitle
    ? subtitleStartDelay + subtitleWords.length * HERO_WORD_STAGGER_SECONDS
    : HERO_TITLE_DELAY_SECONDS + titleWords.length * HERO_WORD_STAGGER_SECONDS
  const ctaDelayMs = toMs(contentEndDelay + HERO_CONTENT_BUFFER_SECONDS)
  const mediaDelayMs = toMs(HERO_TITLE_DELAY_SECONDS + Math.min(titleWords.length * HERO_WORD_STAGGER_SECONDS * 0.5, 0.6))
  const animationKey = `${mode}-${active}-${staticIndex}-${slideTitle}-${currentSlide?.image || ""}-${currentSlide?.layout || ""}`

  const heightValue = `${Math.max(360, height || 560)}px`
  const heroFrameHeight = `calc(${heightValue} + var(--mobile-sticky-header-h, 0px))`
  const layout = currentSlide?.layout || "full"
  const bgStyle =
    layout === "full" && currentSlide?.image
      ? {
          backgroundImage: `url(${currentSlide.image})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundAttachment: mode === "parallax" && !mobileParallaxFallback ? "fixed" : "scroll",
        }
      : currentSlide?.bgColor
        ? { backgroundColor: currentSlide.bgColor }
        : { backgroundColor: "#0f172a" }

  useEffect(() => {
    const frame = frameRef.current
    const content = contentRef.current
    if (!frame || !content) return

    let raf = 0
    const measure = () => {
      cancelAnimationFrame(raf)
      raf = window.requestAnimationFrame(() => {
        const frameH = frame.clientHeight
        const contentH = content.scrollHeight
        const overflow = contentH - frameH
        // Use conservative thresholds on mobile to avoid over-shrinking while still preventing overflow.
        setCompactMode((prev) => {
          const enterThreshold = mobileParallaxFallback ? 56 : 0
          const exitThreshold = mobileParallaxFallback ? 24 : -32
          return prev ? overflow > exitThreshold : overflow > enterThreshold
        })
      })
    }

    measure()
    let resizeObserver: ResizeObserver | null = null

    if (mobileParallaxFallback) {
      window.addEventListener("orientationchange", measure)
    } else {
      resizeObserver = new ResizeObserver(measure)
      resizeObserver.observe(frame)
      window.addEventListener("resize", measure)
    }

    return () => {
      cancelAnimationFrame(raf)
      resizeObserver?.disconnect()
      window.removeEventListener("resize", measure)
      window.removeEventListener("orientationchange", measure)
    }
  }, [active, mode, staticIndex, layout, height, currentSlide?.title, currentSlide?.subtitle, currentSlide?.ctaText, mobileParallaxFallback])

  const renderAnimatedWords = (words: string[], baseDelaySeconds: number, scope: string) => {
    return words.map((word, index) => {
      const wordStyle = {
        "--hero-word-delay": toMs(baseDelaySeconds + index * HERO_WORD_STAGGER_SECONDS),
      } as CSSProperties

      return (
        <span key={`${scope}-${index}-${word}`} className="hero-word-mask" aria-hidden="true">
          <span className="hero-word" style={wordStyle}>
            {word}
          </span>
        </span>
      )
    })
  }

  return (
    <section className="relative border-b border-border" data-motion-skip>
      <div ref={frameRef} className="relative overflow-hidden" style={{ ...bgStyle, height: heroFrameHeight }}>
        <div className={layout === "full" && currentSlide?.image ? "bg-black/50" : ""}>
          <div
            className={`container mx-auto px-4 lg:px-8 h-full flex items-start md:items-center pt-[calc((var(--mobile-sticky-header-h,0px)*0.25)+0.0rem)] md:pt-12 lg:pt-20 ${
              compactMode ? "py-4 md:py-10 lg:py-12" : "py-4 lg:py-20"
            }`}
            style={{ height: heroFrameHeight }}
          >
            {layout === "image-left" || layout === "image-right" ? (
              <div
                ref={contentRef}
                key={`${animationKey}-split`}
                className={`grid md:grid-cols-2 items-center w-full min-h-0 ${compactMode ? "gap-4 md:gap-6" : "gap-8"}`}
              >
                {layout === "image-left" && currentSlide?.image && (
                  <div
                    className={`hero-media-reveal relative w-full overflow-hidden rounded-xl shadow-lg bg-background max-h-full ${
                      compactMode ? "min-h-[160px] md:min-h-[220px]" : "min-h-[180px] md:min-h-[280px]"
                    }`}
                    style={{ "--hero-item-delay": mediaDelayMs } as CSSProperties}
                  >
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage: `url(${currentSlide.image})`,
                        backgroundSize: "cover",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                      }}
                    />
                  </div>
                )}
                <div className={`text-white text-left md:text-left min-h-0 max-w-3xl ${compactMode ? "space-y-3 md:space-y-4" : "space-y-6"}`}>
                  <h1
                    className={`hero-text-reveal hero-title-reveal font-bold leading-tight text-[clamp(2rem,7vw,3rem)] md:text-[clamp(2rem,3.8vw,3.2rem)] ${compactMode ? "tracking-tight" : ""}`}
                    data-animate-type="words"
                    data-animate-delay={String(HERO_TITLE_DELAY_SECONDS)}
                    data-animate-stagger={String(HERO_WORD_STAGGER_SECONDS)}
                    data-animate-duration="1.05"
                    data-animate-ease="power4.out"
                    aria-label={slideTitle}
                  >
                    {renderAnimatedWords(titleWords, HERO_TITLE_DELAY_SECONDS, "title")}
                  </h1>
                  {shouldShowSubtitle && (
                    <p
                      className="hero-text-reveal hero-text-reveal-subtitle text-white/80 leading-relaxed text-[clamp(1rem,3.8vw,1.25rem)]"
                      data-animate-type="words"
                      data-animate-delay={String(subtitleStartDelay)}
                      data-animate-stagger={String(HERO_WORD_STAGGER_SECONDS)}
                      data-animate-duration="0.95"
                      data-animate-ease="power4.out"
                      aria-label={slideSubtitle}
                    >
                      {renderAnimatedWords(subtitleWords, subtitleStartDelay, "subtitle")}
                    </p>
                  )}
                  <div
                    className={`hero-item-reveal flex flex-col sm:flex-row items-start md:items-center ${compactMode ? "gap-2" : "gap-4"}`}
                    style={{ "--hero-item-delay": ctaDelayMs } as CSSProperties}
                  >
                    <Button asChild size={compactMode ? "default" : "lg"} className={compactMode ? "text-sm" : "text-base"}>
                      <Link href={currentSlide?.ctaHref || "/contact"}>
                        {currentSlide?.ctaText || "Get Started"}
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                  </div>
                </div>
                {layout === "image-right" && currentSlide?.image && (
                  <div
                    className={`hero-media-reveal relative w-full overflow-hidden rounded-xl shadow-lg bg-background max-h-full ${
                      compactMode ? "min-h-[160px] md:min-h-[220px]" : "min-h-[180px] md:min-h-[280px]"
                    }`}
                    style={{ "--hero-item-delay": mediaDelayMs } as CSSProperties}
                  >
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage: `url(${currentSlide.image})`,
                        backgroundSize: "cover",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                      }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div
                ref={contentRef}
                key={`${animationKey}-full`}
                className={`max-w-4xl mx-auto text-center text-white w-full ${compactMode ? "space-y-4" : "space-y-8"}`}
              >
                <h1
                  className="hero-text-reveal hero-title-reveal font-bold text-balance leading-tight text-[clamp(2rem,7.5vw,4rem)]"
                  data-animate-type="words"
                  data-animate-delay={String(HERO_TITLE_DELAY_SECONDS)}
                  data-animate-stagger={String(HERO_WORD_STAGGER_SECONDS)}
                  data-animate-duration="1.05"
                  data-animate-ease="power4.out"
                  aria-label={slideTitle}
                >
                  {renderAnimatedWords(titleWords, HERO_TITLE_DELAY_SECONDS, "title")}
                </h1>
                {shouldShowSubtitle && (
                  <p
                    className="hero-text-reveal hero-text-reveal-subtitle text-white/80 text-pretty max-w-2xl mx-auto leading-relaxed text-[clamp(1rem,3.8vw,1.25rem)]"
                    data-animate-type="words"
                    data-animate-delay={String(subtitleStartDelay)}
                    data-animate-stagger={String(HERO_WORD_STAGGER_SECONDS)}
                    data-animate-duration="0.95"
                    data-animate-ease="power4.out"
                    aria-label={slideSubtitle}
                  >
                    {renderAnimatedWords(subtitleWords, subtitleStartDelay, "subtitle")}
                  </p>
                )}
                <div
                  className={`hero-item-reveal flex flex-col sm:flex-row items-center justify-center ${compactMode ? "gap-2" : "gap-4"}`}
                  style={{ "--hero-item-delay": ctaDelayMs } as CSSProperties}
                >
                  <Button asChild size={compactMode ? "default" : "lg"} className={compactMode ? "text-sm" : "text-base"}>
                    <Link href={currentSlide?.ctaHref || "/contact"}>
                      {currentSlide?.ctaText || "Get Started"}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {mode === "parallax" && safeSlides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => setActive((active - 1 + safeSlides.length) % safeSlides.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/40 text-white p-2 hover:bg-black/60 transition"
            aria-label="Previous slide"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setActive((active + 1) % safeSlides.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/40 text-white p-2 hover:bg-black/60 transition"
            aria-label="Next slide"
          >
            <ArrowRightIcon className="h-4 w-4" />
          </button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {safeSlides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActive(idx)}
                className={`h-2.5 w-2.5 rounded-full border border-white/60 transition ${
                  active === idx ? "bg-white" : "bg-white/30"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
