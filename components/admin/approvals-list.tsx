"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

type ApprovalItem = {
  id: string
  title: string
  type: "blog" | "page"
  author: { id: string; fullName: string | null; email: string } | null
}

export function ApprovalsList({ items }: { items: ApprovalItem[] }) {
  const [pendingIds, setPendingIds] = useState<string[]>([])

  const approveItem = async (item: ApprovalItem) => {
    if (pendingIds.includes(item.id)) return
    setPendingIds((prev) => [...prev, item.id])
    try {
      const response = await fetch("/api/admin/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, type: item.type }),
      })
      if (!response.ok) {
        const result = await response.json().catch(() => ({}))
        throw new Error(result.error || "Failed to approve item")
      }
      window.location.reload()
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to approve item")
      setPendingIds((prev) => prev.filter((id) => id !== item.id))
    }
  }

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No pending approvals right now.</p>
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const authorLabel = item.author?.fullName || item.author?.email || "Unknown author"
        return (
          <div
            key={`${item.type}-${item.id}`}
            className="flex flex-col gap-3 rounded-md border border-border/60 bg-muted/30 px-4 py-3 md:flex-row md:items-center md:justify-between"
          >
            <div className="space-y-1">
              <p className="text-sm font-semibold">
                {item.title}
                <span className="ml-2 text-xs text-muted-foreground">
                  {item.type === "blog" ? "Blog post" : "Page"}
                </span>
              </p>
              <p className="text-xs text-muted-foreground">Published by {authorLabel}</p>
            </div>
            <Button type="button" onClick={() => approveItem(item)} disabled={pendingIds.includes(item.id)}>
              {pendingIds.includes(item.id) ? "Approving..." : "Approve"}
            </Button>
          </div>
        )
      })}
    </div>
  )
}
