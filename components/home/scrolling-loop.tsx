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
  const [canHover, setCanHover] = useState(false)
  const dragStateRef = useRef({
    startX: 0,
    startY: 0,
    startScrollLeft: 0,
    pointerId: -1,
    pointerType: "",
    isPointerDown: false,
    dragStarted: false,
    startedOnTextTarget: false,
  })

  const isTextLikeTarget = (target: HTMLElement | null) => {
    if (!target) return false
    return Boolean(target.closest("p, h1, h2, h3, h4, h5, h6, li, span, strong, em, small, blockquote, dd, dt"))
  }

  const hasSelectionInside = (container: HTMLDivElement) => {
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) return false
    const range = selection.getRangeAt(0)
    const getHost = (node: Node | null) => {
      if (!node) return null
      if (node.nodeType === Node.ELEMENT_NODE) return node as Element
      return node.parentElement
    }
    const startHost = getHost(range.startContainer)
    const endHost = getHost(range.endContainer)
    return Boolean(startHost && endHost && container.contains(startHost) && container.contains(endHost))
  }

  const isToggleFocusedInside = () => {
    const container = containerRef.current
    if (!container) return false
    const activeEl = document.activeElement as HTMLElement | null
    if (!activeEl || !container.contains(activeEl)) return false
    return Boolean(activeEl.closest('[data-scroll-toggle="true"]'))
  }

  useEffect(() => {
    const media = window.matchMedia("(hover: hover)")
    const apply = () => setCanHover(media.matches)
    apply()
    media.addEventListener("change", apply)
    return () => media.removeEventListener("change", apply)
  }, [])

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

      const shouldAutoScroll = !isDragging && !(pauseOnHover && canHover && isHovered) && !isToggleFocusedInside()
      if (shouldAutoScroll && Number.isFinite(loopWidth) && loopWidth > 0) {
        const pxPerMs = loopWidth / Math.max(1000, (durationSeconds || 30) * 1000)
        container.scrollLeft += pxPerMs * deltaMs
        normalizeScrollPosition()
      }

      raf = requestAnimationFrame(animate)
    }

    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [canHover, durationSeconds, isDragging, isHovered, pauseOnHover])

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement
    const toggleCard = target.closest('[data-scroll-toggle="true"]') as HTMLElement | null
    if (toggleCard && document.activeElement === toggleCard) {
      toggleCard.blur()
      event.preventDefault()
      return
    }
    if (target.closest("a, button, input, textarea, select, label")) {
      return
    }

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
    dragStateRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      startScrollLeft: container.scrollLeft,
      pointerId: event.pointerId,
      pointerType: event.pointerType,
      isPointerDown: true,
      dragStarted: false,
      startedOnTextTarget: isTextLikeTarget(target),
    }
  }

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStateRef.current.isPointerDown || !containerRef.current) return
    const deltaX = event.clientX - dragStateRef.current.startX
    const deltaY = event.clientY - dragStateRef.current.startY
    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)

    if (!dragStateRef.current.dragStarted) {
      const moveThreshold = dragStateRef.current.startedOnTextTarget && dragStateRef.current.pointerType === "mouse" ? 12 : 6
      if (absX < moveThreshold) return
      if (absX <= absY) return
      if (
        dragStateRef.current.pointerType === "mouse" &&
        dragStateRef.current.startedOnTextTarget &&
        hasSelectionInside(containerRef.current)
      ) {
        stopDragging()
        return
      }
      dragStateRef.current.dragStarted = true
      setIsDragging(true)
      containerRef.current.setPointerCapture(dragStateRef.current.pointerId)
    }

    event.preventDefault()
    containerRef.current.scrollLeft = dragStateRef.current.startScrollLeft - deltaX
    normalizeScrollPosition()
  }

  const stopDragging = () => {
    const container = containerRef.current
    const { pointerId, isPointerDown } = dragStateRef.current
    if (container && isPointerDown && pointerId >= 0 && container.hasPointerCapture(pointerId)) {
      container.releasePointerCapture(pointerId)
    }
    dragStateRef.current.isPointerDown = false
    dragStateRef.current.dragStarted = false
    dragStateRef.current.pointerId = -1
    dragStateRef.current.pointerType = ""
    dragStateRef.current.startedOnTextTarget = false
    setIsDragging(false)
  }

  return (
    <div
      ref={containerRef}
      className={`scrolling-loop ${dragEnabled ? "drag-enabled" : "drag-disabled"} ${pauseOnHover ? "pause-on-hover" : ""} ${
        isDragging ? "is-dragging" : ""
      } ${className}`.trim()}
      onMouseEnter={() => {
        if (canHover) setIsHovered(true)
      }}
      onMouseLeave={() => {
        if (canHover) setIsHovered(false)
      }}
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
