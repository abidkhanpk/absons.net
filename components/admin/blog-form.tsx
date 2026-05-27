"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { RichTextEditor } from "@/components/admin/rich-text-editor"
import { ImageUrlUploadField } from "@/components/admin/image-url-upload-field"

type BlogPost = {
  id: string
  title: string
  category?: string
  slug: string
  excerpt: string
  content: string
  published: boolean
  approved?: boolean
  featured_image?: string
  featuredImage?: string
  publishedAt?: string | null
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

export function BlogForm({
  post,
  currentUserRole,
  editorApprovalRequired,
}: {
  post?: BlogPost
  currentUserRole: string
  editorApprovalRequired: boolean
}) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGeneratingSeo, setIsGeneratingSeo] = useState(false)
  const [formData, setFormData] = useState({
    title: post?.title || "",
    category: post?.category || "News",
    slug: post?.slug || "",
    excerpt: post?.excerpt || "",
    content: post?.content || "",
    published: post?.published || false,
    approved: post?.approved ?? true,
    featured_image: post?.featured_image || post?.featuredImage || "",
    seoTitle: post?.seoTitle || "",
    seoDescription: post?.seoDescription || "",
    seoKeywords: post?.seoKeywords || "",
    seoOgImage: post?.seoOgImage || "",
    seoCanonicalUrl: post?.seoCanonicalUrl || "",
    seoNoIndex: post?.seoNoIndex ?? false,
    seoNoFollow: post?.seoNoFollow ?? false,
    resubmissionNote: post?.resubmissionNote || "",
  })
  const showRejectionNotice = Boolean(post?.rejectedAt)
  const showRejectionReason =
    showRejectionNotice && (currentUserRole !== "editor" || Boolean(post?.rejectionNotifiedAt))
  const rejectionReason = showRejectionReason ? post?.rejectedReason : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/admin/blog", {
        method: post ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          post
            ? { id: post.id, ...formData }
            : {
                ...formData,
              },
        ),
      })

      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(result.error || "Failed to save post")
      }

      router.push("/admin/blog")
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to save post")
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

  const generateSeoMetadata = async () => {
    if (!formData.title.trim() && !formData.content.trim() && !formData.excerpt.trim()) {
      alert("Add post title, excerpt, or content first.")
      return
    }
    setIsGeneratingSeo(true)
    try {
      const response = await fetch("/api/admin/seo/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "blog",
          title: formData.title,
          slug: formData.slug,
          excerpt: formData.excerpt,
          content: formData.content,
        }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(result.error || "Failed to generate SEO metadata")
      }
      setFormData((prev) => ({
        ...prev,
        seoTitle: typeof result.seoTitle === "string" ? result.seoTitle : prev.seoTitle,
        seoDescription: typeof result.seoDescription === "string" ? result.seoDescription : prev.seoDescription,
        seoKeywords: typeof result.seoKeywords === "string" ? result.seoKeywords : prev.seoKeywords,
      }))
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to generate SEO metadata")
    } finally {
      setIsGeneratingSeo(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="border-border">
        <CardContent className="p-6 space-y-6">
          {showRejectionNotice && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm">
              <p className="font-semibold text-destructive">Rejected</p>
              <p className="text-muted-foreground">
                This post was rejected. Update the content to reapply for approval.
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
              placeholder="Enter post title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">
              Category <span className="text-destructive">*</span>
            </Label>
            <Input
              id="category"
              required
              list="blog-category-options"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="News"
            />
            <datalist id="blog-category-options">
              <option value="News" />
              <option value="Announcements" />
              <option value="Insights" />
              <option value="Updates" />
            </datalist>
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
              placeholder="post-url-slug"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">
              Excerpt <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="excerpt"
              required
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              placeholder="Brief description of the post"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">
              Content <span className="text-destructive">*</span>
            </Label>
            <RichTextEditor content={formData.content} onChange={(content) => setFormData({ ...formData, content })} />
          </div>

          <ImageUrlUploadField
            id="featured_image"
            label="Featured Image URL"
            value={formData.featured_image}
            onChange={(value) => setFormData({ ...formData, featured_image: value })}
            folder="blog"
          />

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <Label className="font-semibold">SEO</Label>
                <p className="text-xs text-muted-foreground">Optional overrides for search engines and social sharing.</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={generateSeoMetadata} disabled={isGeneratingSeo}>
                {isGeneratingSeo ? "Generating..." : "Generate SEO (AI)"}
              </Button>
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
                  placeholder="https://example.com/blog/post"
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
            <Label htmlFor="published">Publish this post</Label>
          </div>
          {currentUserRole === "editor" && editorApprovalRequired && (
            <p className="text-xs text-muted-foreground">
              Editor submissions require admin approval before they appear on the site.
            </p>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : post ? "Update Post" : "Create Post"}
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
