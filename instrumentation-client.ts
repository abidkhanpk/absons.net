function sanitizeName(value: unknown) {
  if (typeof value !== "string") return value
  return value.replace(/\u200B|\u200C|\u200D|\uFEFF/g, "")
}

function clampTimingOptions(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value
  const next = { ...(value as Record<string, unknown>) }

  const startTime = next.startTime
  if (typeof startTime === "number" && (!Number.isFinite(startTime) || startTime < 0)) {
    next.startTime = 0
  }

  const start = next.start
  if (typeof start === "number" && start < 0) {
    next.start = 0
  }

  const end = next.end
  if (typeof end === "number" && end < 0) {
    next.end = 0
  }

  const duration = next.duration
  if (typeof duration === "number" && duration < 0) {
    next.duration = 0
  }

  return next
}

function isNegativeTimestampError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || "")
  return /negative time stamp/i.test(message)
}

function patchPerformanceMethod<K extends "measure" | "mark">(
  target: Performance | Performance["constructor"]["prototype"] | null | undefined,
  key: K,
  wrap: (original: Performance[K]) => Performance[K],
) {
  if (!target) return false
  const original = target[key]
  if (typeof original !== "function") return false
  const wrapped = wrap(original)

  try {
    Object.defineProperty(target, key, {
      value: wrapped,
      configurable: true,
      writable: true,
    })
    return true
  } catch {
    try {
      // @ts-expect-error runtime fallback assignment for non-configurable environments
      target[key] = wrapped
      return true
    } catch {
      return false
    }
  }
}

function patchPerformanceApis() {
  if (typeof window === "undefined" || typeof Performance === "undefined") return

  const perf = window.performance
  if (!perf) return

  const flag = "__absonsSafeMeasurePatched"
  const proto = Object.getPrototypeOf(perf) as Performance | null
  if ((perf as Record<string, unknown>)[flag] || (proto as Record<string, unknown> | null)?.[flag]) {
    return
  }

  const measureWrapped =
    patchPerformanceMethod(perf, "measure", (original) =>
      function patchedMeasure(this: Performance, name: string, startOrOptions?: string | PerformanceMeasureOptions, endMark?: string) {
        const safeName = sanitizeName(name) as string
        const safeEndMark = typeof endMark === "string" ? (sanitizeName(endMark) as string) : endMark

        try {
          return original.call(this, safeName, startOrOptions as string | PerformanceMeasureOptions, safeEndMark)
        } catch (error) {
          if (!isNegativeTimestampError(error)) throw error

          try {
            const safeStart = clampTimingOptions(startOrOptions)
            if (typeof safeStart === "string") {
              return original.call(this, safeName)
            }
            return original.call(this, safeName, safeStart as PerformanceMeasureOptions, safeEndMark)
          } catch {
            return original.call(this, safeName)
          }
        }
      }) ||
    patchPerformanceMethod(proto, "measure", (original) =>
      function patchedMeasure(this: Performance, name: string, startOrOptions?: string | PerformanceMeasureOptions, endMark?: string) {
        const safeName = sanitizeName(name) as string
        const safeEndMark = typeof endMark === "string" ? (sanitizeName(endMark) as string) : endMark

        try {
          return original.call(this, safeName, startOrOptions as string | PerformanceMeasureOptions, safeEndMark)
        } catch (error) {
          if (!isNegativeTimestampError(error)) throw error

          try {
            const safeStart = clampTimingOptions(startOrOptions)
            if (typeof safeStart === "string") {
              return original.call(this, safeName)
            }
            return original.call(this, safeName, safeStart as PerformanceMeasureOptions, safeEndMark)
          } catch {
            return original.call(this, safeName)
          }
        }
      }) ||
    patchPerformanceMethod(Performance.prototype, "measure", (original) =>
      function patchedMeasure(this: Performance, name: string, startOrOptions?: string | PerformanceMeasureOptions, endMark?: string) {
        const safeName = sanitizeName(name) as string
        const safeEndMark = typeof endMark === "string" ? (sanitizeName(endMark) as string) : endMark

        try {
          return original.call(this, safeName, startOrOptions as string | PerformanceMeasureOptions, safeEndMark)
        } catch (error) {
          if (!isNegativeTimestampError(error)) throw error

          try {
            const safeStart = clampTimingOptions(startOrOptions)
            if (typeof safeStart === "string") {
              return original.call(this, safeName)
            }
            return original.call(this, safeName, safeStart as PerformanceMeasureOptions, safeEndMark)
          } catch {
            return original.call(this, safeName)
          }
        }
      })

  patchPerformanceMethod(perf, "mark", (original) =>
    function patchedMark(this: Performance, name: string, options?: PerformanceMarkOptions) {
      const safeName = sanitizeName(name) as string
      try {
        return original.call(this, safeName, options)
      } catch (error) {
        if (!isNegativeTimestampError(error)) throw error
        return original.call(this, safeName, clampTimingOptions(options) as PerformanceMarkOptions)
      }
    },
  )
  patchPerformanceMethod(proto, "mark", (original) =>
    function patchedMark(this: Performance, name: string, options?: PerformanceMarkOptions) {
      const safeName = sanitizeName(name) as string
      try {
        return original.call(this, safeName, options)
      } catch (error) {
        if (!isNegativeTimestampError(error)) throw error
        return original.call(this, safeName, clampTimingOptions(options) as PerformanceMarkOptions)
      }
    },
  )
  patchPerformanceMethod(Performance.prototype, "mark", (original) =>
    function patchedMark(this: Performance, name: string, options?: PerformanceMarkOptions) {
      const safeName = sanitizeName(name) as string
      try {
        return original.call(this, safeName, options)
      } catch (error) {
        if (!isNegativeTimestampError(error)) throw error
        return original.call(this, safeName, clampTimingOptions(options) as PerformanceMarkOptions)
      }
    },
  )

  if (measureWrapped) {
    try {
      Object.defineProperty(perf, flag, {
        value: true,
        configurable: true,
        enumerable: false,
      })
    } catch {}

    if (proto) {
      try {
        Object.defineProperty(proto, flag, {
          value: true,
          configurable: true,
          enumerable: false,
        })
      } catch {}
    }
  }
}

function registerRuntimeFallbackHandlers() {
  window.addEventListener(
    "error",
    (event) => {
      if (!isNegativeTimestampError(event.error || event.message)) return
      event.preventDefault()
      event.stopImmediatePropagation()
    },
    true,
  )
}

try {
  patchPerformanceApis()
  registerRuntimeFallbackHandlers()
} catch {
  // no-op
}

export function onRouterTransitionStart() {
  try {
    patchPerformanceApis()
  } catch {
    // no-op
  }
}
