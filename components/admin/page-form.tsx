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
import { ImageUrlUploadField } from "@/components/admin/image-url-upload-field"
import { buildPageSlug, normalizeSlugPrefix, normalizeSlugSegment, splitPageSlug } from "@/lib/page-slug"

type PageRecord = {
  id: string
  title: string
  slug: string
  content: string
  published: boolean
  approved?: boolean
  rejectedAt?: string | null
  rejectedReason?: string | null
  rejectionNotifiedAt?: string | null
  resubmissionNote?: string | null
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
  slugPrefixOptions = [],
}: {
  page?: PageRecord
  currentUserRole: string
  editorApprovalRequired: boolean
  slugPrefixOptions?: string[]
}) {
  const router = useRouter()
  const normalizedPrefixOptions = Array.from(
    new Set(slugPrefixOptions.map((value) => normalizeSlugPrefix(value)).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b))
  const initialSlugParts = splitPageSlug(page?.slug || "")
  const initialPrefixSelection = !initialSlugParts.prefix
    ? "__none__"
    : normalizedPrefixOptions.includes(initialSlugParts.prefix)
      ? initialSlugParts.prefix
      : "__custom__"
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
    resubmissionNote: page?.resubmissionNote || "",
  })
  const [slugPrefixSelection, setSlugPrefixSelection] = useState(initialPrefixSelection)
  const [customSlugPrefix, setCustomSlugPrefix] = useState(initialPrefixSelection === "__custom__" ? initialSlugParts.prefix : "")
  const [slugSegment, setSlugSegment] = useState(initialSlugParts.segment || "")
  const showRejectionNotice = Boolean(page?.rejectedAt)
  const showRejectionReason =
    showRejectionNotice && (currentUserRole !== "editor" || Boolean(page?.rejectionNotifiedAt))
  const rejectionReason = showRejectionReason ? page?.rejectedReason : null

  const selectedPrefixRaw =
    slugPrefixSelection === "__none__"
      ? ""
      : slugPrefixSelection === "__custom__"
        ? customSlugPrefix
        : slugPrefixSelection
  const normalizedSlugPrefix = normalizeSlugPrefix(selectedPrefixRaw)
  const normalizedSlugSegment = normalizeSlugSegment(slugSegment)
  const finalSlug = buildPageSlug(normalizedSlugPrefix, normalizedSlugSegment)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!finalSlug) {
      alert("Slug segment is required and can only contain letters, numbers, and hyphens.")
      return
    }
    setIsSubmitting(true)

    try {
      const payload = {
        ...formData,
        slug: finalSlug,
        slugPrefix: normalizedSlugPrefix,
        slugSegment: normalizedSlugSegment,
      }
      const response = await fetch("/api/admin/pages", {
        method: page ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(page ? { id: page.id, ...payload } : payload),
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
    setSlugSegment(normalizeSlugSegment(formData.title))
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="border-border">
        <CardContent className="p-6 space-y-6">
          {showRejectionNotice && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm">
              <p className="font-semibold text-destructive">Rejected</p>
              <p className="text-muted-foreground">
                This page was rejected. Update the content to reapply for approval.
              </p>
              {rejectionReason && <p className="mt-2">{rejectionReason}</p>}
            </div>
          )}
          {currentUserRole === "editor" && showRejectionNotice && (
            <div className="space-y-2">
              <Label htmlFor="resubmissionNote">Note for admin (optional)</Label>
              <Textarea
                id="resubmissionNote"
                value={formData.resubmissionNote}
                onChange={(e) => setFormData({ ...formData, resubmissionNote: e.target.value })}
                rows={3}
                placeholder="Describe what you changed after the rejection."
              />
            </div>
          )}
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
              <Label htmlFor="slugSegment">
                Page URL <span className="text-destructive">*</span>
              </Label>
              <Button type="button" variant="outline" size="sm" onClick={generateSlug}>
                Generate from Title
              </Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="slugPrefixSelection">Prefix</Label>
                <select
                  id="slugPrefixSelection"
                  value={slugPrefixSelection}
                  onChange={(e) => setSlugPrefixSelection(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="__none__">No Prefix</option>
                  {normalizedPrefixOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                  <option value="__custom__">Add New Prefix</option>
                </select>
                {slugPrefixSelection === "__custom__" ? (
                  <Input
                    value={customSlugPrefix}
                    onChange={(e) => setCustomSlugPrefix(normalizeSlugPrefix(e.target.value))}
                    placeholder="trainings or services/condition-monitoring"
                  />
                ) : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="slugSegment">Slug Segment</Label>
                <Input
                  id="slugSegment"
                  required
                  value={slugSegment}
                  onChange={(e) => setSlugSegment(normalizeSlugSegment(e.target.value))}
                  placeholder="rotor-balancing"
                />
                <p className="text-xs text-muted-foreground">Segment cannot contain `/`.</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="slugPreview">Final URL Slug</Label>
              <Input id="slugPreview" readOnly value={finalSlug ? `/${finalSlug}` : ""} placeholder="/trainings/rotor-balancing" />
            </div>
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
                <ImageUrlUploadField
                  id="seoOgImage"
                  label="SEO OG Image URL"
                  value={formData.seoOgImage}
                  onChange={(value) => setFormData({ ...formData, seoOgImage: value })}
                  placeholder="https://example.com/og-image.jpg"
                  folder="seo"
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
