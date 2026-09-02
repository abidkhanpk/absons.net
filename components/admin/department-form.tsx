"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { CONTENT_ICON_OPTIONS } from "@/lib/content-icons"
import { ImageUrlUploadField } from "@/components/admin/image-url-upload-field"
import { decodeStoredItemLink, encodeStoredItemLink, type ItemLinkTargetMode } from "@/lib/item-link"
import { useRouter } from "next/navigation"
import { useState } from "react"

type Department = {
  id: string
  title: string
  description: string
  icon: string | null
  imageUrl?: string | null
  imageFitMode?: string | null
  linkUrl?: string | null
  linkLabel?: string | null
  isFeatured?: boolean
  isActive: boolean
  displayOrder: number
}

export function DepartmentForm({ department }: { department?: Department }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const initialLink = decodeStoredItemLink(department?.linkUrl)
  const [formData, setFormData] = useState({
    title: department?.title || "",
    description: department?.description || "",
    icon: department?.icon || "Building2",
    image_url: department?.imageUrl || "",
    image_fit_mode: department?.imageFitMode || "cover",
    link_url: initialLink.href,
    link_target: initialLink.target,
    link_label: department?.linkLabel || "Learn more",
    is_featured: department?.isFeatured ?? false,
    is_active: department?.isActive !== undefined ? department.isActive : true,
    display_order: department?.displayOrder ?? 0,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const payload = {
        ...formData,
        link_url: encodeStoredItemLink(formData.link_url, formData.link_target),
      }
      const response = await fetch("/api/admin/departments", {
        method: department ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(department ? { id: department.id, ...payload } : payload),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || "Failed to save department")
      router.push("/admin/departments")
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to save department")
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
              placeholder="Department name"
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
              placeholder="Describe the department"
              rows={4}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="icon">Icon</Label>
              <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_ICON_OPTIONS.map((iconName) => (
                    <SelectItem key={iconName} value={iconName}>
                      {iconName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="display_order">Display Order</Label>
              <Input
                id="display_order"
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: Number.parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <ImageUrlUploadField
              id="image_url"
              label="Custom Image URL"
              value={formData.image_url}
              onChange={(value) => setFormData({ ...formData, image_url: value })}
              folder="departments"
              fitMode={formData.image_fit_mode}
              onFitModeChange={(value) => setFormData({ ...formData, image_fit_mode: value })}
            />
            <div className="space-y-2">
              <Label htmlFor="link_url">Custom Link URL</Label>
              <Input
                id="link_url"
                value={formData.link_url}
                onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                placeholder="/departments/custom-item or https://example.com/page"
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
              id="is_featured"
              checked={formData.is_featured}
              onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
            />
            <Label htmlFor="is_featured">Featured (show on homepage)</Label>
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
              {isSubmitting ? "Saving..." : department ? "Update Department" : "Create Department"}
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
