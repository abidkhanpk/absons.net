"use client"

import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function DeleteDepartmentButton({ departmentId }: { departmentId: string }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this department?")) return
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/departments?id=${departmentId}`, { method: "DELETE" })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || "Failed to delete department")
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete department")
      setIsDeleting(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleDelete} disabled={isDeleting}>
      <Trash2 className="h-4 w-4 text-destructive" />
    </Button>
  )
}
