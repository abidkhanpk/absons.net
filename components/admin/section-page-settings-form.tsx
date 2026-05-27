"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RichTextEditor } from "@/components/admin/rich-text-editor"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type SectionPageSettingsFormProps = {
  sectionKey: "services" | "training" | "products" | "departments" | "pricing" | "blog"
  sectionLabel: string
  initial: {
    beforeListContent: string
    afterListContent: string
    listLayout: "list" | "grid"
  }
}

export function SectionPageSettingsForm({ sectionKey, sectionLabel, initial }: SectionPageSettingsFormProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    beforeListContent: initial.beforeListContent,
    afterListContent: initial.afterListContent,
    listLayout: initial.listLayout,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(false)
    try {
      const response = await fetch("/api/admin/section-page-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: sectionKey, ...formData }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(result.error || "Failed to save section page settings")
      }
      setSuccess(true)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save section page settings")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-md border border-border/60 bg-muted/20 p-4">
        <p className="text-sm text-muted-foreground">
          SEO fields for {sectionLabel} should be managed from <strong>Settings → SEO → Static Page Overrides</strong>.
        </p>
      </div>

      <div className="space-y-2">
        <Label className="font-semibold">Content Before List</Label>
        <RichTextEditor
          content={formData.beforeListContent}
          onChange={(content) => setFormData((prev) => ({ ...prev, beforeListContent: content }))}
        />
      </div>

      <div className="space-y-2">
        <Label className="font-semibold">Content After List</Label>
        <RichTextEditor
          content={formData.afterListContent}
          onChange={(content) => setFormData((prev) => ({ ...prev, afterListContent: content }))}
        />
      </div>

      {sectionKey === "blog" ? (
        <div className="space-y-2">
          <Label className="font-semibold">Blog List Layout</Label>
          <Select
            value={formData.listLayout}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, listLayout: value === "grid" ? "grid" : "list" }))}
          >
            <SelectTrigger className="max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="list">List (Default)</SelectItem>
              <SelectItem value="grid">Card Grid</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Choose how posts render on the public <code>/blog</code> page.</p>
        </div>
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {success ? <p className="text-sm text-green-600">Saved successfully.</p> : null}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Page Settings"}
        </Button>
      </div>
    </form>
  )
}
