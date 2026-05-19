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

type Product = {
  id: string
  title: string
  description: string
  icon: string | null
  imageUrl?: string | null
  linkUrl?: string | null
  linkLabel?: string | null
  isFeatured?: boolean
  tags?: string[]
  isActive: boolean
  displayOrder: number
}

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const initialLink = decodeStoredItemLink(product?.linkUrl)
  const [formData, setFormData] = useState({
    title: product?.title || "",
    description: product?.description || "",
    icon: product?.icon || "Package",
    image_url: product?.imageUrl || "",
    link_url: initialLink.href,
    link_target: initialLink.target,
    link_label: product?.linkLabel || "Explore product",
    is_featured: product?.isFeatured ?? false,
    tags: Array.isArray(product?.tags) ? product.tags.join(", ") : "",
    is_active: product?.isActive !== undefined ? product.isActive : true,
    display_order: product?.displayOrder ?? 0,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const payload = {
        ...formData,
        link_url: encodeStoredItemLink(formData.link_url, formData.link_target),
      }
      const response = await fetch("/api/admin/products", {
        method: product ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product ? { id: product.id, ...payload } : payload),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || "Failed to save product")
      router.push("/admin/products")
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to save product")
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
              placeholder="Product name"
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
              placeholder="Describe the product"
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
              folder="products"
            />
            <div className="space-y-2">
              <Label htmlFor="link_url">Custom Link URL</Label>
              <Input
                id="link_url"
                value={formData.link_url}
                onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                placeholder="/products/custom-item or https://example.com/page"
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
              placeholder="Explore product"
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

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="Workflow, ERP, Education"
            />
            <p className="text-xs text-muted-foreground">Comma-separated tags used for product labeling and filtering.</p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_featured"
              checked={formData.is_featured}
              onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
            />
            <Label htmlFor="is_featured">Featured (show badge on website)</Label>
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
              {isSubmitting ? "Saving..." : product ? "Update Product" : "Create Product"}
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
