"use client"

import { useEffect } from "react"
import { RotateCw } from "lucide-react"
import "./globals.css"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const handleRetry = () => {
    if (typeof window !== "undefined") {
      window.location.reload()
      return
    }
    reset()
  }

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="en">
      <body>
        <main className="db-error-page">
          <div className="db-error-card">
            <h1 className="db-error-title">Database connection problem</h1>
            <p className="db-error-subtitle">
              We are unable to load the latest data right now. Please retry after some time.
            </p>
            <button onClick={handleRetry} className="retry-button" type="button">
              <RotateCw className="h-4 w-4" />
              Retry Now
            </button>
          </div>
        </main>
      </body>
    </html>
  )
}
