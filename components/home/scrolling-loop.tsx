"use client"

import { type ReactNode, useRef, useState } from "react"

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
  const [isDragging, setIsDragging] = useState(false)
  const dragStateRef = useRef({ startX: 0, startScrollLeft: 0 })

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragEnabled) return
    if (event.button !== 0) return
    if (!containerRef.current) return
    setIsDragging(true)
    dragStateRef.current = {
      startX: event.clientX,
      startScrollLeft: containerRef.current.scrollLeft,
    }
    containerRef.current.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return
    const delta = event.clientX - dragStateRef.current.startX
    containerRef.current.scrollLeft = dragStateRef.current.startScrollLeft - delta
  }

  const stopDragging = () => setIsDragging(false)

  return (
    <div
      ref={containerRef}
      className={`scrolling-loop ${dragEnabled ? "drag-enabled" : "drag-disabled"} ${pauseOnHover ? "pause-on-hover" : ""} ${
        isDragging ? "is-dragging" : ""
      } ${className}`.trim()}
      style={{ ["--scroll-duration" as string]: `${durationSeconds || 30}s` }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={stopDragging}
      onPointerCancel={stopDragging}
      onPointerLeave={stopDragging}
    >
      <div className={`scrolling-loop-track ${trackClassName}`.trim()}>{children}</div>
    </div>
  )
}
