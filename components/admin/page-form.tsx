"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { RichTextEditor } from "@/components/admin/rich-text-editor"
import { Textarea } from "@/components/ui/textarea"

type PageRecord = {
  id: string
  title: string
  slug: string
  content: string
  published: boolean
  approved?: boolean
  seoTitle?: string | null
  seoDescription?: string | null
  seoKeywords?: string | null
  seoOgImage?: string | null
  seoCanonicalUrl?: string | null
  seoNoIndex?: boolean
  seoNoFollow?: boolean
}

export function PageForm({
  page,
  currentUserRole,
  editorApprovalRequired,
}: {
  page?: PageRecord
  currentUserRole: string
  editorApprovalRequired: boolean
}) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: page?.title || "",
    slug: page?.slug || "",
    content: page?.content || "",
    published: page?.published || false,
    approved: page?.approved ?? true,
    seoTitle: page?.seoTitle || "",
    seoDescription: page?.seoDescription || "",
    seoKeywords: page?.seoKeywords || "",
    seoOgImage: page?.seoOgImage || "",
    seoCanonicalUrl: page?.seoCanonicalUrl || "",
    seoNoIndex: page?.seoNoIndex ?? false,
    seoNoFollow: page?.seoNoFollow ?? false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/admin/pages", {
        method: page ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(page ? { id: page.id, ...formData } : formData),
      })

      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(result.error || "Failed to save page")
      }

      router.push("/admin/pages")
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to save page")
      setIsSubmitting(false)
    }
  }

  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
    setFormData({ ...formData, slug })
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="border-border">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter page title"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="slug">
                Slug <span className="text-destructive">*</span>
              </Label>
              <Button type="button" variant="outline" size="sm" onClick={generateSlug}>
                Generate from Title
              </Button>
            </div>
            <Input
              id="slug"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="page-url-slug"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">
              Content <span className="text-destructive">*</span>
            </Label>
            <RichTextEditor content={formData.content} onChange={(content) => setFormData({ ...formData, content })} />
          </div>

          <div className="space-y-4">
            <div>
              <Label className="font-semibold">SEO</Label>
              <p className="text-xs text-muted-foreground">Optional overrides for search engines and social sharing.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="seoTitle">SEO Title</Label>
              <Input
                id="seoTitle"
                value={formData.seoTitle}
                onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                placeholder="Custom title for search engines"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seoDescription">SEO Description</Label>
              <Textarea
                id="seoDescription"
                value={formData.seoDescription}
                onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seoKeywords">SEO Keywords</Label>
              <Textarea
                id="seoKeywords"
                value={formData.seoKeywords}
                onChange={(e) => setFormData({ ...formData, seoKeywords: e.target.value })}
                rows={2}
                placeholder="keyword1, keyword2"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="seoOgImage">SEO OG Image URL</Label>
                <Input
                  id="seoOgImage"
                  value={formData.seoOgImage}
                  onChange={(e) => setFormData({ ...formData, seoOgImage: e.target.value })}
                  placeholder="https://example.com/og-image.jpg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seoCanonicalUrl">Canonical URL</Label>
                <Input
                  id="seoCanonicalUrl"
                  value={formData.seoCanonicalUrl}
                  onChange={(e) => setFormData({ ...formData, seoCanonicalUrl: e.target.value })}
                  placeholder="https://example.com/page"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="seoNoIndex"
                  checked={formData.seoNoIndex}
                  onCheckedChange={(checked) => setFormData({ ...formData, seoNoIndex: checked })}
                />
                <Label htmlFor="seoNoIndex">No index</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="seoNoFollow"
                  checked={formData.seoNoFollow}
                  onCheckedChange={(checked) => setFormData({ ...formData, seoNoFollow: checked })}
                />
                <Label htmlFor="seoNoFollow">No follow</Label>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="published"
              checked={formData.published}
              onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
            />
            <Label htmlFor="published">Publish this page</Label>
          </div>
          {currentUserRole === "editor" && editorApprovalRequired && (
            <p className="text-xs text-muted-foreground">
              Editor submissions require admin approval before they appear on the site.
            </p>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : page ? "Update Page" : "Create Page"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
