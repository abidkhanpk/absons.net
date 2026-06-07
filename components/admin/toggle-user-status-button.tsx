"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function ToggleUserStatusButton({
  userId,
  userEmail,
  isActive,
}: {
  userId: string
  userEmail: string
  isActive: boolean
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async () => {
    const nextActive = !isActive
    const confirmed = window.confirm(`${nextActive ? "Enable" : "Disable"} ${userEmail}?`)
    if (!confirmed) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, isActive: nextActive }),
      })

      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(result.error || "Failed to update user status")
      }

      router.refresh()
    } catch (error) {
      console.error("Error updating user status:", error)
      alert(error instanceof Error ? error.message : "Failed to update user status")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button type="button" variant="ghost" size="sm" onClick={handleToggle} disabled={isLoading}>
      {isLoading ? "Saving..." : isActive ? "Disable" : "Enable"}
    </Button>
  )
}
