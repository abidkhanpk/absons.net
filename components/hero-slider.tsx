"use client"

import { useEffect, useMemo, useRef, useState } from "react"
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
        // Use a larger deadband to prevent compact/non-compact chattering on borderline slides.
        setCompactMode((prev) => {
          if (!prev) return overflow > -12
          return overflow > -72
        })
      })
    }

    measure()
    const resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(frame)
    window.addEventListener("resize", measure)
    window.visualViewport?.addEventListener("resize", measure)
    window.visualViewport?.addEventListener("scroll", measure)

    return () => {
      cancelAnimationFrame(raf)
      resizeObserver.disconnect()
      window.removeEventListener("resize", measure)
      window.visualViewport?.removeEventListener("resize", measure)
      window.visualViewport?.removeEventListener("scroll", measure)
    }
  }, [active, mode, staticIndex, layout, height, currentSlide?.title, currentSlide?.subtitle, currentSlide?.ctaText])

  return (
    <section className="relative border-b border-border">
      <div ref={frameRef} className="relative overflow-hidden" style={{ ...bgStyle, height: heroFrameHeight }}>
        <div className={layout === "full" && currentSlide?.image ? "bg-black/50" : ""}>
          <div
            className={`container mx-auto px-4 lg:px-8 h-full flex items-start md:items-center pt-[calc((var(--mobile-sticky-header-h,0px)*0.25)+0.0rem)] md:pt-12 lg:pt-20 ${
              compactMode ? "py-2 md:py-10 lg:py-12" : "py-4 lg:py-20"
            }`}
            style={{ height: heroFrameHeight }}
          >
            {layout === "image-left" || layout === "image-right" ? (
              <div ref={contentRef} className={`grid md:grid-cols-2 items-center w-full min-h-0 ${compactMode ? "gap-4 md:gap-6" : "gap-8"}`}>
                {layout === "image-left" && currentSlide?.image && (
                  <div
                    className={`relative w-full overflow-hidden rounded-xl shadow-lg bg-background max-h-full ${
                      compactMode ? "min-h-[110px] md:min-h-[220px]" : "min-h-[180px] md:min-h-[280px]"
                    }`}
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
                  <h1 className={`font-bold leading-tight text-[clamp(2rem,7vw,3rem)] md:text-[clamp(2rem,3.8vw,3.2rem)] ${compactMode ? "tracking-tight" : ""}`}>
                    {currentSlide?.title || "Empowering Organizations with Innovative Software Solutions"}
                  </h1>
                  {(currentSlide?.subtitle || currentSlide?.ctaText || currentSlide?.ctaHref) && (
                    <p className={`text-white/80 leading-relaxed text-[clamp(1rem,3.8vw,1.25rem)] ${compactMode ? "line-clamp-3 md:line-clamp-4" : ""}`}>
                      {currentSlide?.subtitle ||
                        "Specialized software for educational institutions, Quran academies, professional training, and complete order supply solutions."}
                    </p>
                  )}
                  <div className={`flex flex-col sm:flex-row items-start md:items-center ${compactMode ? "gap-2" : "gap-4"}`}>
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
                    className={`relative w-full overflow-hidden rounded-xl shadow-lg bg-background max-h-full ${
                      compactMode ? "min-h-[110px] md:min-h-[220px]" : "min-h-[180px] md:min-h-[280px]"
                    }`}
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
              <div ref={contentRef} className={`max-w-4xl mx-auto text-center text-white w-full ${compactMode ? "space-y-4" : "space-y-8"}`}>
                <h1 className="font-bold text-balance leading-tight text-[clamp(2rem,7.5vw,4rem)]">
                  {currentSlide?.title || "Empowering Organizations with Innovative Software Solutions"}
                </h1>
                {(currentSlide?.subtitle || currentSlide?.ctaText || currentSlide?.ctaHref) && (
                  <p className={`text-white/80 text-pretty max-w-2xl mx-auto leading-relaxed text-[clamp(1rem,3.8vw,1.25rem)] ${compactMode ? "line-clamp-4" : ""}`}>
                    {currentSlide?.subtitle ||
                      "Specialized software for educational institutions, Quran academies, professional training, and complete order supply solutions."}
                  </p>
                )}
                <div className={`flex flex-col sm:flex-row items-center justify-center ${compactMode ? "gap-2" : "gap-4"}`}>
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
