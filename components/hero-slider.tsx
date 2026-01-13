"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import type { HeroSlide } from "@/lib/site-settings"

type HeroSliderProps = {
  slides: HeroSlide[]
  mode: "static" | "parallax"
  staticIndex: number
  autoplaySeconds: number
  imageFit: "cover" | "contain" | "none"
}

export function HeroSlider({ slides, mode, staticIndex, autoplaySeconds, imageFit }: HeroSliderProps) {
  const safeSlides = useMemo(() => (slides && slides.length > 0 ? slides : []), [slides])
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (mode !== "parallax" || safeSlides.length <= 1) return
    const ms = Math.max(2000, (autoplaySeconds || 6) * 1000)
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % safeSlides.length)
    }, ms)
    return () => clearInterval(id)
  }, [autoplaySeconds, mode, safeSlides.length])

  useEffect(() => {
    if (mode === "static" && safeSlides.length > 0) {
      const idx = Math.min(Math.max(staticIndex || 0, 0), safeSlides.length - 1)
      setActive(idx)
    }
  }, [mode, safeSlides.length, staticIndex])

  const currentSlide =
    mode === "static" ? safeSlides[Math.min(Math.max(staticIndex || 0, 0), safeSlides.length - 1)] : safeSlides[active]

  const layout = currentSlide?.layout || "full"
  const slideImageMode = currentSlide?.imageMode ?? imageFit
  const bgStyle =
    layout === "full" && slideImageMode !== "none" && currentSlide?.image
      ? {
          backgroundImage: `url(${currentSlide.image})`,
          backgroundSize: slideImageMode === "contain" ? "contain" : "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundAttachment: mode === "parallax" ? "fixed" : undefined,
        }
      : currentSlide?.bgColor
        ? { backgroundColor: currentSlide.bgColor }
        : { backgroundColor: "#0f172a" }

  return (
    <section className="relative border-b border-border">
      <div className="relative" style={bgStyle}>
        <div className={layout === "full" && slideImageMode !== "none" && currentSlide?.image ? "bg-black/50" : ""}>
          <div className="container mx-auto px-4 lg:px-8 py-20 lg:py-32">
            {layout === "image-left" || layout === "image-right" ? (
              <div className="grid md:grid-cols-2 gap-8 items-center">
                {layout === "image-left" && currentSlide?.image && slideImageMode !== "none" && (
                  <div className="relative h-80 w-full overflow-hidden rounded-xl shadow-lg bg-background">
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage: `url(${currentSlide.image})`,
                        backgroundSize: slideImageMode === "contain" ? "contain" : "cover",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                      }}
                    />
                  </div>
                )}
                <div className="space-y-6 text-white text-left md:text-left">
                  <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                    {currentSlide?.title || "Empowering Organizations with Innovative Software Solutions"}
                  </h1>
                  {(currentSlide?.subtitle || currentSlide?.ctaText || currentSlide?.ctaHref) && (
                    <p className="text-lg text-white/80 leading-relaxed">
                      {currentSlide?.subtitle ||
                        "Specialized software for educational institutions, Quran academies, professional training, and complete order supply solutions."}
                    </p>
                  )}
                  <div className="flex flex-col sm:flex-row items-start md:items-center gap-4">
                    <Button asChild size="lg" className="text-base">
                      <Link href={currentSlide?.ctaHref || "/contact"}>
                        {currentSlide?.ctaText || "Get Started"}
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                  </div>
                </div>
                {layout === "image-right" && currentSlide?.image && slideImageMode !== "none" && (
                  <div className="relative h-80 w-full overflow-hidden rounded-xl shadow-lg bg-background">
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage: `url(${currentSlide.image})`,
                        backgroundSize: slideImageMode === "contain" ? "contain" : "cover",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                      }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="max-w-4xl mx-auto text-center space-y-8 text-white">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-balance leading-tight">
                  {currentSlide?.title || "Empowering Organizations with Innovative Software Solutions"}
                </h1>
                {(currentSlide?.subtitle || currentSlide?.ctaText || currentSlide?.ctaHref) && (
                  <p className="text-lg md:text-xl text-white/80 text-pretty max-w-2xl mx-auto leading-relaxed">
                    {currentSlide?.subtitle ||
                      "Specialized software for educational institutions, Quran academies, professional training, and complete order supply solutions."}
                  </p>
                )}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button asChild size="lg" className="text-base">
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
      )}
    </section>
  )
}
