"use client"

import { useEffect } from "react"

// Unregister any existing service workers (e.g., from the previous WordPress/PWA build)
export function ServiceWorkerReset() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return

    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister().catch(() => {
            // ignore unregister failures
          })
        })
      })
      .catch(() => {
        // ignore lookup failures
      })
  }, [])

  return null
}
