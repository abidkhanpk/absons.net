"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"

export default function TestimonialSubmitForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    client_name: "",
    client_company: "",
    client_position: "",
    content: "",
    rating: 5,
    avatar_url: "",
    email: "",
  })
  const [result, setResult] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setResult(null)

    if (!formData.email || !formData.client_name || !formData.content) {
      setResult("Please fill required fields (name, email, testimonial).")
      return
    }

    setIsSubmitting(true)
    try {
      const resp = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_name: formData.client_name,
          client_company: formData.client_company,
          client_position: formData.client_position,
          content: formData.content,
          rating: formData.rating,
          avatar_url: formData.avatar_url,
          submitter_email: formData.email,
        }),
      })

      const json = await resp.json().catch(() => ({}))
      if (!resp.ok) throw new Error((json && json.error) || "Failed to submit testimonial")

      setResult(
        "Thank you — your testimonial was submitted and will appear after admin verification.",
      )
      setFormData({ client_name: "", client_company: "", client_position: "", content: "", rating: 5, avatar_url: "", email: "" })
    } catch (err: any) {
      setResult(err?.message || "Failed to submit testimonial")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="border-border">
        <CardContent className="p-6 space-y-6">
          <p className="text-sm text-muted-foreground">
            Please enter the email you used when coordinating with us. We will verify this before publishing to
            ensure submissions are genuine.
          </p>

          <div className="space-y-2">
            <Label htmlFor="client_name">Your Name <span className="text-destructive">*</span></Label>
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
            <Label htmlFor="content">Testimonial <span className="text-destructive">*</span></Label>
            <Textarea
              id="content"
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write your testimonial..."
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
              <Label htmlFor="avatar_url">Avatar URL</Label>
              <Input
                id="avatar_url"
                value={formData.avatar_url}
                onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
            <Input
              id="email"
              required
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="user@example.com"
            />
            <p className="text-sm text-muted-foreground">Use the email you used to coordinate with our team; submissions are verified before publishing.</p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Submit Testimonial"}</Button>
          </div>

          {result ? <p className="text-sm mt-2">{result}</p> : null}
        </CardContent>
      </Card>
    </form>
  )
}
