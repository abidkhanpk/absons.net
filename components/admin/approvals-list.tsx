"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

type ApprovalItem = {
  id: string
  title: string
  type: "blog" | "page"
  author: { id: string; fullName: string | null; email: string } | null
}

export function ApprovalsList({ items }: { items: ApprovalItem[] }) {
  const [pendingActionById, setPendingActionById] = useState<Record<string, "approve" | "reject">>({})
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({})
  const [notifyAuthorById, setNotifyAuthorById] = useState<Record<string, boolean>>({})

  const approveItem = async (item: ApprovalItem) => {
    if (pendingActionById[item.id]) return
    setPendingActionById((prev) => ({ ...prev, [item.id]: "approve" }))
    try {
      const response = await fetch("/api/admin/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, type: item.type, action: "approve" }),
      })
      if (!response.ok) {
        const result = await response.json().catch(() => ({}))
        throw new Error(result.error || "Failed to approve item")
      }
      window.location.reload()
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to approve item")
      setPendingActionById((prev) => {
        const next = { ...prev }
        delete next[item.id]
        return next
      })
    }
  }

  const rejectItem = async (item: ApprovalItem) => {
    if (pendingActionById[item.id]) return
    setPendingActionById((prev) => ({ ...prev, [item.id]: "reject" }))
    try {
      const response = await fetch("/api/admin/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          type: item.type,
          action: "reject",
          reason: rejectionReasons[item.id],
          notifyAuthor: notifyAuthorById[item.id] ?? false,
        }),
      })
      if (!response.ok) {
        const result = await response.json().catch(() => ({}))
        throw new Error(result.error || "Failed to reject item")
      }
      setRejectingId(null)
      window.location.reload()
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to reject item")
      setPendingActionById((prev) => {
        const next = { ...prev }
        delete next[item.id]
        return next
      })
    }
  }

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No pending approvals right now.</p>
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const authorLabel = item.author?.fullName || item.author?.email || "Unknown author"
        const pendingAction = pendingActionById[item.id]
        const isPending = Boolean(pendingAction)
        return (
          <div
            key={`${item.type}-${item.id}`}
            className="flex flex-col gap-3 rounded-md border border-border/60 bg-muted/30 px-4 py-3"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-semibold">
                  {item.title}
                  <span className="ml-2 text-xs text-muted-foreground">
                    {item.type === "blog" ? "Blog post" : "Page"}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">Published by {authorLabel}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button type="button" onClick={() => approveItem(item)} disabled={isPending}>
                  {pendingAction === "approve" ? "Approving..." : "Approve"}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setRejectingId((prev) => (prev === item.id ? null : item.id))}
                  disabled={isPending}
                >
                  Reject
                </Button>
              </div>
            </div>
            {rejectingId === item.id && (
              <div className="border-t border-border/60 pt-3 space-y-3">
                <div className="space-y-2">
                  <Label htmlFor={`reject-reason-${item.id}`}>Rejection reason (optional)</Label>
                  <Textarea
                    id={`reject-reason-${item.id}`}
                    value={rejectionReasons[item.id] ?? ""}
                    onChange={(event) =>
                      setRejectionReasons((prev) => ({ ...prev, [item.id]: event.target.value }))
                    }
                    rows={3}
                    placeholder="Share what needs to change before approval."
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id={`notify-author-${item.id}`}
                    checked={notifyAuthorById[item.id] ?? false}
                    onCheckedChange={(checked) =>
                      setNotifyAuthorById((prev) => ({ ...prev, [item.id]: checked }))
                    }
                  />
                  <Label htmlFor={`notify-author-${item.id}`}>Notify author with the rejection reason</Label>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="destructive" onClick={() => rejectItem(item)} disabled={isPending}>
                    {pendingAction === "reject" ? "Rejecting..." : "Confirm Reject"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setRejectingId(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
