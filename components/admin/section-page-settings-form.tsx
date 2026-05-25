"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { RichTextEditor } from "@/components/admin/rich-text-editor"
import { ImageUrlUploadField } from "@/components/admin/image-url-upload-field"

type SectionPageSettingsFormProps = {
  sectionKey: "services" | "training" | "products" | "departments" | "pricing"
  sectionLabel: string
  initial: {
    title: string
    description: string
    keywords: string
    ogImage: string
    canonical: string
    noIndex: boolean
    noFollow: boolean
    beforeListContent: string
    afterListContent: string
  }
}

export function SectionPageSettingsForm({ sectionKey, sectionLabel, initial }: SectionPageSettingsFormProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState(initial)

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
      <div className="space-y-4 rounded-md border border-border/60 bg-muted/20 p-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="font-semibold">SEO</Label>
            <p className="text-xs text-muted-foreground">Overrides for the {sectionLabel} listing page.</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="seo-title">SEO Title</Label>
            <Input
              id="seo-title"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seo-canonical">Canonical URL</Label>
            <Input
              id="seo-canonical"
              value={formData.canonical}
              onChange={(e) => setFormData((prev) => ({ ...prev, canonical: e.target.value }))}
              placeholder="https://example.com/page"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="seo-description">SEO Description</Label>
          <Textarea
            id="seo-description"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="seo-keywords">SEO Keywords</Label>
          <Textarea
            id="seo-keywords"
            rows={2}
            value={formData.keywords}
            onChange={(e) => setFormData((prev) => ({ ...prev, keywords: e.target.value }))}
            placeholder="keyword1, keyword2"
          />
        </div>
        <ImageUrlUploadField
          id="seo-og-image"
          label="SEO OG Image URL"
          value={formData.ogImage}
          onChange={(value) => setFormData((prev) => ({ ...prev, ogImage: value }))}
          folder="seo"
          placeholder="https://example.com/og-image.jpg"
        />
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="seo-noindex"
              checked={formData.noIndex}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, noIndex: checked }))}
            />
            <Label htmlFor="seo-noindex">No index</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="seo-nofollow"
              checked={formData.noFollow}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, noFollow: checked }))}
            />
            <Label htmlFor="seo-nofollow">No follow</Label>
          </div>
        </div>
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
