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
import { useRouter } from "next/navigation"
import { useState } from "react"

type Service = {
  id: string
  title: string
  description: string
  icon: string | null
  imageUrl?: string | null
  linkUrl?: string | null
  linkLabel?: string | null
  category: string
  isFeatured: boolean
  displayOrder: number
}

export function ServiceForm({ service }: { service?: Service }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: service?.title || "",
    description: service?.description || "",
    icon: service?.icon || "Package",
    image_url: service?.imageUrl || "",
    link_url: service?.linkUrl || "",
    link_label: service?.linkLabel || "Learn more",
    category: service?.category || "education",
    is_featured: service?.isFeatured || false,
    display_order: service?.displayOrder || 0,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/admin/services", {
        method: service ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(service ? { id: service.id, ...formData } : formData),
      })

      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(result.error || "Failed to save service")
      }

      router.push("/admin/services")
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to save service")
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
              placeholder="Service name"
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
              placeholder="Describe the service"
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
              <Label htmlFor="category">
                Category <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="supply">Supply</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <ImageUrlUploadField
              id="image_url"
              label="Custom Image URL"
              value={formData.image_url}
              onChange={(value) => setFormData({ ...formData, image_url: value })}
              folder="services"
            />
            <div className="space-y-2">
              <Label htmlFor="link_url">Custom Link URL</Label>
              <Input
                id="link_url"
                value={formData.link_url}
                onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                placeholder="/services/custom-service or https://example.com/page"
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
            <Label htmlFor="display_order">Display Order</Label>
            <Input
              id="display_order"
              type="number"
              value={formData.display_order}
              onChange={(e) => setFormData({ ...formData, display_order: Number.parseInt(e.target.value) })}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_featured"
              checked={formData.is_featured}
              onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
            />
            <Label htmlFor="is_featured">Feature this service on homepage</Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : service ? "Update Service" : "Create Service"}
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
