"use client"

import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function DeleteServiceButton({ serviceId }: { serviceId: string }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this service?")) return

    setIsDeleting(true)
    const supabase = createClient()

    const { error } = await supabase.from("services").delete().eq("id", serviceId)

    if (error) {
      alert("Failed to delete service")
      setIsDeleting(false)
    } else {
      router.refresh()
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleDelete} disabled={isDeleting}>
      <Trash2 className="h-4 w-4 text-destructive" />
    </Button>
  )
}
