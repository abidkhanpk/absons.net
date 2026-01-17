"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function DeletePageButton({ pageId }: { pageId: string }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this page?")) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/pages?id=${pageId}`, { method: "DELETE" })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(result.error || "Failed to delete page")
      }
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete page")
      setIsDeleting(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleDelete} disabled={isDeleting}>
      <Trash2 className="h-4 w-4 text-destructive" />
    </Button>
  )
}
