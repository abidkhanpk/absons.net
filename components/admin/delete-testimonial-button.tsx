"use client"

import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function DeleteTestimonialButton({ testimonialId }: { testimonialId: string }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/testimonials?id=${testimonialId}`, { method: "DELETE" })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(result.error || "Failed to delete testimonial")
      }
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete testimonial")
      setIsDeleting(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleDelete} disabled={isDeleting}>
      <Trash2 className="h-4 w-4 text-destructive" />
    </Button>
  )
}
