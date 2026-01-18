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

type BlogPost = {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  published: boolean
  approved?: boolean
  featured_image?: string
  featuredImage?: string
  publishedAt?: string | null
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
  const [formData, setFormData] = useState({
    title: post?.title || "",
    slug: post?.slug || "",
    excerpt: post?.excerpt || "",
    content: post?.content || "",
    published: post?.published || false,
    approved: post?.approved ?? true,
    featured_image: post?.featured_image || post?.featuredImage || "",
  })

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
              placeholder="Enter post title"
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

          <div className="space-y-2">
            <Label htmlFor="featured_image">Featured Image URL</Label>
            <Input
              id="featured_image"
              value={formData.featured_image}
              onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="published"
              checked={formData.published}
              onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
            />
            <Label htmlFor="published">Publish this post</Label>
          </div>
          {(currentUserRole === "admin" || currentUserRole === "super_admin") && (
            <div className="flex items-center space-x-2">
              <Switch
                id="approved"
                checked={formData.approved}
                onCheckedChange={(checked) => setFormData({ ...formData, approved: checked })}
              />
              <Label htmlFor="approved">Approved for publishing</Label>
            </div>
          )}
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
