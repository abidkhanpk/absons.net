"use client"

import { useEffect, useState } from "react"
import { WhyChooseSection } from "@/components/home/why-choose-section"

type WhyChooseItem = {
  title: string
  description: string
  icon: "check" | "award" | "book" | "star" | "shield" | "bolt" | "heart" | "users" | "globe" | "sparkles"
}

type WhyChooseSectionClientProps = {
  title: string
  subtitle: string
  items: WhyChooseItem[]
  layout: "grid" | "scroll"
  mobileLayout: "match" | "grid" | "scroll"
  scrollSpeed: number
  pauseOnHover?: boolean
  dragEnabled?: boolean
}

export function WhyChooseSectionClient(props: WhyChooseSectionClientProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return <WhyChooseSection {...props} />
}
