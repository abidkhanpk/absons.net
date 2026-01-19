"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Award, BookOpen, CheckCircle2, Globe, Heart, Shield, Sparkles, Star, Users, Zap } from "lucide-react"

type WhyChooseItem = {
  title: string
  description: string
  icon: "check" | "award" | "book" | "star" | "shield" | "bolt" | "heart" | "users" | "globe" | "sparkles"
}

type WhyChooseSectionProps = {
  title: string
  subtitle: string
  items: WhyChooseItem[]
  layout: "grid" | "scroll"
  mobileLayout: "match" | "grid" | "scroll"
  scrollSpeed: number
}

const iconMap = {
  check: CheckCircle2,
  award: Award,
  book: BookOpen,
  star: Star,
  shield: Shield,
  bolt: Zap,
  heart: Heart,
  users: Users,
  globe: Globe,
  sparkles: Sparkles,
}

export function WhyChooseSection({
  title,
  subtitle,
  items,
  layout,
  mobileLayout,
  scrollSpeed,
}: WhyChooseSectionProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [visibleCount, setVisibleCount] = useState<number>(Number.POSITIVE_INFINITY)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)")
    const update = () => setIsMobile(media.matches)
    update()
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", update)
      return () => media.removeEventListener("change", update)
    }
    media.addListener(update)
    return () => media.removeListener(update)
  }, [])

  useEffect(() => {
    if (!containerRef.current) return
    const element = containerRef.current
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0
      if (!width) return
      const styles = getComputedStyle(element)
      const tileWidth = Number.parseFloat(styles.getPropertyValue("--why-choose-tile-width")) || 260
      const tileGap = Number.parseFloat(styles.getPropertyValue("--why-choose-tile-gap")) || 24
      const count = Math.max(1, Math.floor((width + tileGap) / (tileWidth + tileGap)))
      setVisibleCount(count)
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const effectiveLayout = useMemo(() => {
    if (mobileLayout === "match") return layout
    return isMobile ? mobileLayout : layout
  }, [isMobile, layout, mobileLayout])
  const shouldScroll = effectiveLayout === "scroll" && items.length > visibleCount
  const layoutToRender: "grid" | "scroll" = shouldScroll ? "scroll" : "grid"

  const renderGrid = () => (
    <div className="flex flex-wrap justify-center gap-6">
      {items.map((item, index) => {
        const Icon = iconMap[item.icon] || CheckCircle2
        return (
          <div key={`${item.title}-${index}`} className="why-choose-tile text-center space-y-3">
            <div className="flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-7 w-7" />
              </div>
            </div>
            <h3 className="text-lg font-semibold">{item.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
          </div>
        )
      })}
    </div>
  )

  const renderScroll = () => (
    <div className="why-choose-scroll">
      <div className="why-choose-track" style={{ ["--why-choose-duration" as string]: `${scrollSpeed || 30}s` }}>
        {[...items, ...items].map((item, index) => {
          const Icon = iconMap[item.icon] || CheckCircle2
          return (
            <div key={`${item.title}-${index}`} className="why-choose-tile text-center space-y-3">
              <div className="flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-7 w-7" />
                </div>
              </div>
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">{subtitle}</p>
        </div>

        <div ref={containerRef} className="why-choose-section">
          {layoutToRender === "scroll" ? renderScroll() : renderGrid()}
        </div>
      </div>
    </section>
  )
}
