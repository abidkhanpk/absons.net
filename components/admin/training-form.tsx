"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ImageUrlUploadField } from "@/components/admin/image-url-upload-field"
import { decodeStoredItemLink, encodeStoredItemLink, type ItemLinkTargetMode } from "@/lib/item-link"
import { useRouter } from "next/navigation"
import { useState } from "react"

type TrainingCourse = {
  id: string
  title: string
  description: string
  duration: string | null
  level: string | null
  provider: string | null
  isActive: boolean
  displayOrder: number
  featuredImage?: string | null
  imageFitMode?: string | null
  linkUrl?: string | null
  linkLabel?: string | null
}

export function TrainingForm({ course }: { course?: TrainingCourse }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const initialLink = decodeStoredItemLink(course?.linkUrl)
  const [formData, setFormData] = useState({
    title: course?.title || "",
    description: course?.description || "",
    duration: course?.duration || "",
    level: course?.level || "Beginner",
    provider: course?.provider || "{sitetitle}",
    is_active: course?.isActive !== undefined ? course.isActive : true,
    display_order: course?.displayOrder ?? 0,
    featured_image: course?.featuredImage || "",
    image_fit_mode: course?.imageFitMode || "cover",
    link_url: initialLink.href,
    link_target: initialLink.target,
    link_label: course?.linkLabel || "Learn more",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const payload = {
        ...formData,
        link_url: encodeStoredItemLink(formData.link_url, formData.link_target),
      }
      const response = await fetch("/api/admin/training", {
        method: course ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(course ? { id: course.id, ...payload } : payload),
      })

      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(result.error || "Failed to save course")
      }

      router.push("/admin/training")
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to save course")
      setIsSubmitting(false)
    }
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
              placeholder="Course name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the course"
              rows={4}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g., 5 Days"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">Level</Label>
              <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="provider">Provider</Label>
              <Input
                id="provider"
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                placeholder="Training provider"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="display_order">Display Order</Label>
              <Input
                id="display_order"
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: Number.parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <ImageUrlUploadField
              id="featured_image"
              label="Custom Image URL"
              value={formData.featured_image}
              onChange={(value) => setFormData({ ...formData, featured_image: value })}
              folder="training"
              fitMode={formData.image_fit_mode}
              onFitModeChange={(value) => setFormData({ ...formData, image_fit_mode: value })}
            />
            <div className="space-y-2">
              <Label htmlFor="link_url">Custom Link URL</Label>
              <Input
                id="link_url"
                value={formData.link_url}
                onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                placeholder="/training/custom-course or https://example.com/page"
              />
              <p className="text-xs text-muted-foreground">Relative (`/path`) or absolute (`https://...`) URL.</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="link_label">Card Link Text</Label>
            <Input
              id="link_label"
              value={formData.link_label}
              onChange={(e) => setFormData({ ...formData, link_label: e.target.value })}
              placeholder="Learn more"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="link_target">Link Open Mode</Label>
            <Select
              value={formData.link_target}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  link_target: (value === "new_tab" ? "new_tab" : "same_tab") as ItemLinkTargetMode,
                })
              }
            >
              <SelectTrigger id="link_target">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="same_tab">Open in same tab</SelectItem>
                <SelectItem value="new_tab">Open in new tab</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active">Active (visible on website)</Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : course ? "Update Course" : "Create Course"}
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
