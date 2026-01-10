"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ShieldCheck } from "lucide-react"

interface RequestAccountDeletionButtonProps {
  userId: string
  userEmail: string
  fullName?: string
}

export function RequestAccountDeletionButton({ userId, userEmail, fullName }: RequestAccountDeletionButtonProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRequest = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName || "Account deletion request",
          email: userEmail,
          company: "Admin Portal",
          message: `Account deletion requested by ${fullName || "an admin"} (${userEmail}). User ID: ${userId}. Please remove this account.`,
          status: "deletion_requested",
        }),
      })

      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(result.error || "Failed to submit request")
      }

      setSubmitted(true)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit request")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" disabled={submitted}>
          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          <span className="ml-2">{submitted ? "Requested" : "Request Deletion"}</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Request account deletion</AlertDialogTitle>
          <AlertDialogDescription>
            This will send a request to the super admin/admin team to remove your account. You will lose admin access
            once the request is completed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleRequest} disabled={isSubmitting || submitted}>
            {submitted ? "Request sent" : isSubmitting ? "Sending..." : "Send request"}
          </AlertDialogAction>
        </AlertDialogFooter>
        {error && <p className="text-sm text-destructive mt-2">{error}</p>}
      </AlertDialogContent>
    </AlertDialog>
  )
}
