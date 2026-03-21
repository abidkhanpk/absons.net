"use client"

import { useEffect, useState } from "react"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export default function TestimonialSubmittedBanner() {
  const [message, setMessage] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const raw = sessionStorage.getItem("testimonialSubmittedMessage")
      if (raw) {
        setMessage(raw)
        sessionStorage.removeItem("testimonialSubmittedMessage")
      }
    } catch (e) {
      // ignore
    }
    const handler = () => {
      try {
        const raw = sessionStorage.getItem("testimonialSubmittedMessage")
        if (raw) {
          setMessage(raw)
          sessionStorage.removeItem("testimonialSubmittedMessage")
        }
      } catch (e) {
        // ignore
      }
    }

    window.addEventListener("testimonialSubmitted", handler)
    return () => window.removeEventListener("testimonialSubmitted", handler)
  }, [])

  if (!message || !mounted) return null

  return (
    <div className="container mx-auto px-4 lg:px-8 mt-4">
      <Alert>
        <AlertTitle>Thank you — submission received</AlertTitle>
        <AlertDescription>
          <p>{message}</p>
          <div className="mt-3">
            <Button size="sm" variant="outline" onClick={() => setMessage(null)}>
              Dismiss
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}
