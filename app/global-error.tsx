"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { RotateCw } from "lucide-react"

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
        <main className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-xl w-full rounded-lg border border-border bg-card p-8 text-center space-y-4">
            <h1 className="text-2xl font-bold">Database connection problem</h1>
            <p className="text-muted-foreground">
              We are unable to load the latest data right now. Please retry after some time.
            </p>
            <Button
              onClick={handleRetry}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md hover:opacity-95"
            >
              <RotateCw className="h-4 w-4" />
              Retry Now
            </Button>
          </div>
        </main>
      </body>
    </html>
  )
}
