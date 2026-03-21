"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

type Testimonial = {
  id: string
  client_name: string
  client_company?: string
  client_position?: string
  content: string
  rating: number
  avatar_url?: string
  is_featured: boolean
  display_order: number
  submitter_email?: string
  is_published?: boolean
}

export function TestimonialForm({ testimonial }: { testimonial?: Testimonial }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    client_name: testimonial?.client_name || (testimonial as any)?.clientName || "",
    client_company: testimonial?.client_company || (testimonial as any)?.clientCompany || "",
    client_position: testimonial?.client_position || (testimonial as any)?.clientPosition || "",
    content: testimonial?.content || "",
    rating: testimonial?.rating || (testimonial as any)?.rating || 5,
    avatar_url: testimonial?.avatar_url || (testimonial as any)?.avatarUrl || "",
    is_featured: testimonial?.is_featured || (testimonial as any)?.isFeatured || false,
    display_order: testimonial?.display_order || (testimonial as any)?.displayOrder || 0,
    submitter_email: (testimonial as any)?.submitter_email || (testimonial as any)?.submitterEmail || "",
    is_published: (testimonial as any)?.is_published || (testimonial as any)?.isPublished || true,
  })

  useEffect(() => {
    setFormData({
      client_name: testimonial?.client_name || (testimonial as any)?.clientName || "",
      client_company: testimonial?.client_company || (testimonial as any)?.clientCompany || "",
      client_position: testimonial?.client_position || (testimonial as any)?.clientPosition || "",
      content: testimonial?.content || "",
      rating: testimonial?.rating || (testimonial as any)?.rating || 5,
      avatar_url: testimonial?.avatar_url || (testimonial as any)?.avatarUrl || "",
      is_featured: testimonial?.is_featured || (testimonial as any)?.isFeatured || false,
      display_order: testimonial?.display_order || (testimonial as any)?.displayOrder || 0,
      submitter_email: (testimonial as any)?.submitter_email || (testimonial as any)?.submitterEmail || "",
      is_published: (testimonial as any)?.is_published || (testimonial as any)?.isPublished || true,
    })
  }, [testimonial])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/admin/testimonials", {
        method: testimonial ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testimonial ? { id: testimonial.id, ...formData } : formData),
      })

      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(result.error || "Failed to save testimonial")
      }

      router.push("/admin/testimonials")
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to save testimonial")
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="border-border">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="client_name">
              Client Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="client_name"
              required
              value={formData.client_name}
              onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
              placeholder="John Doe"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client_position">Position</Label>
              <Input
                id="client_position"
                value={formData.client_position}
                onChange={(e) => setFormData({ ...formData, client_position: e.target.value })}
                placeholder="CEO"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_company">Company</Label>
              <Input
                id="client_company"
                value={formData.client_company}
                onChange={(e) => setFormData({ ...formData, client_company: e.target.value })}
                placeholder="Company Name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">
              Testimonial <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="content"
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write the testimonial content..."
              rows={5}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rating">Rating</Label>
              <Select
                value={formData.rating.toString()}
                onValueChange={(value) => setFormData({ ...formData, rating: Number.parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>
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

          <div className="space-y-2">
            <Label htmlFor="avatar_url">Avatar URL</Label>
            <Input
              id="avatar_url"
              value={formData.avatar_url}
              onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
              placeholder="https://example.com/avatar.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="submitter_email">Submitter Email</Label>
            <Input
              id="submitter_email"
              value={formData.submitter_email}
              onChange={(e) => setFormData({ ...formData, submitter_email: e.target.value })}
              placeholder="user@example.com"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_featured"
              checked={formData.is_featured}
              onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
            />
            <Label htmlFor="is_featured">Feature on homepage</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_published"
              checked={formData.is_published}
              onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
            />
            <Label htmlFor="is_published">Published (visible to public)</Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : testimonial ? "Update Testimonial" : "Create Testimonial"}
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
