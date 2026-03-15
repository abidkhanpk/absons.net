"use client"

import { type ReactNode, useEffect, useRef, useState } from "react"

type ScrollingLoopProps = {
  durationSeconds: number
  pauseOnHover?: boolean
  dragEnabled?: boolean
  className?: string
  trackClassName?: string
  children: ReactNode
}

export function ScrollingLoop({
  durationSeconds,
  pauseOnHover = true,
  dragEnabled = true,
  className = "",
  trackClassName = "",
  children,
}: ScrollingLoopProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const trackRef = useRef<HTMLDivElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const dragStateRef = useRef({ startX: 0, startScrollLeft: 0 })

  const normalizeScrollPosition = () => {
    if (!containerRef.current || !trackRef.current) return
    const container = containerRef.current
    const track = trackRef.current
    const loopWidth = track.scrollWidth / 2
    if (!Number.isFinite(loopWidth) || loopWidth <= 0) return

    const minEdge = 1
    const maxEdge = Math.max(0, track.scrollWidth - container.clientWidth - 1)
    if (container.scrollLeft <= minEdge) {
      container.scrollLeft += loopWidth
      return
    }
    if (container.scrollLeft >= maxEdge) {
      container.scrollLeft -= loopWidth
    }
  }

  useEffect(() => {
    let raf = 0
    let lastTs = 0

    const animate = (ts: number) => {
      if (!containerRef.current || !trackRef.current) {
        raf = requestAnimationFrame(animate)
        return
      }
      if (lastTs === 0) lastTs = ts
      const container = containerRef.current
      const track = trackRef.current
      const loopWidth = track.scrollWidth / 2
      const deltaMs = ts - lastTs
      lastTs = ts

      const shouldAutoScroll = !isDragging && !(pauseOnHover && isHovered)
      if (shouldAutoScroll && Number.isFinite(loopWidth) && loopWidth > 0) {
        const pxPerMs = loopWidth / Math.max(1000, (durationSeconds || 30) * 1000)
        container.scrollLeft += pxPerMs * deltaMs
        normalizeScrollPosition()
      }

      raf = requestAnimationFrame(animate)
    }

    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [durationSeconds, isDragging, isHovered, pauseOnHover])

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragEnabled) return
    if (event.button !== 0) return
    if (!containerRef.current || !trackRef.current) return
    const container = containerRef.current
    const track = trackRef.current
    const loopWidth = track.scrollWidth / 2
    if (Number.isFinite(loopWidth) && loopWidth > 0) {
      if (container.scrollLeft < loopWidth * 0.5) container.scrollLeft += loopWidth
      if (container.scrollLeft > loopWidth * 1.5) container.scrollLeft -= loopWidth
    }
    setIsDragging(true)
    dragStateRef.current = {
      startX: event.clientX,
      startScrollLeft: container.scrollLeft,
    }
    container.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return
    const delta = event.clientX - dragStateRef.current.startX
    containerRef.current.scrollLeft = dragStateRef.current.startScrollLeft - delta
    normalizeScrollPosition()
  }

  const stopDragging = () => setIsDragging(false)

  return (
    <div
      ref={containerRef}
      className={`scrolling-loop ${dragEnabled ? "drag-enabled" : "drag-disabled"} ${pauseOnHover ? "pause-on-hover" : ""} ${
        isDragging ? "is-dragging" : ""
      } ${className}`.trim()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={stopDragging}
      onPointerCancel={stopDragging}
      onPointerLeave={stopDragging}
      onScroll={normalizeScrollPosition}
    >
      <div ref={trackRef} className={`scrolling-loop-track ${trackClassName}`.trim()}>
        {children}
      </div>
    </div>
  )
}
