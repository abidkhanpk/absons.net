"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react"

type WhyChooseItem = {
  title: string
  description: string
  icon: "check" | "award" | "book" | "star" | "shield" | "bolt" | "heart" | "users" | "globe" | "sparkles"
}

type WhyChooseFormValues = {
  whyChooseItems: WhyChooseItem[]
}

export function WhyChooseForm({ initial }: { initial: WhyChooseFormValues }) {
  const [formData, setFormData] = useState(initial)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const moveItem = <T,>(items: T[], fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= items.length) return items
    const next = [...items]
    const [moved] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, moved)
    return next
  }

  const updateItem = (index: number, updates: Partial<WhyChooseItem>) => {
    setFormData((prev) => {
      const next = [...prev.whyChooseItems]
      next[index] = { ...next[index], ...updates }
      return { ...prev, whyChooseItems: next }
    })
  }

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      whyChooseItems: [
        ...prev.whyChooseItems,
        { title: "New Item", description: "Description", icon: "check" },
      ],
    }))
  }

  const removeItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      whyChooseItems: prev.whyChooseItems.filter((_, itemIndex) => itemIndex !== index),
    }))
  }

  const moveWhyChooseItem = (index: number, direction: -1 | 1) => {
    setFormData((prev) => ({
      ...prev,
      whyChooseItems: moveItem(prev.whyChooseItems, index, index + direction),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch("/api/admin/site-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          whyChooseItems: formData.whyChooseItems,
        }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(result.error || "Failed to save Why Choose Us settings")
      }
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save Why Choose Us settings")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Tiles</Label>
        <Button type="button" variant="outline" onClick={addItem}>
          Add Tile
        </Button>
      </div>

      <div className="space-y-2">
        {formData.whyChooseItems.map((item, index) => (
          <div
            key={`${item.title}-${index}`}
            className="flex flex-col gap-3 rounded-md border border-border/60 bg-muted/40 px-3 py-3 md:flex-row md:items-center md:justify-between"
          >
            <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center">
              <div className="md:w-44">
                <Label htmlFor={`why-choose-icon-${index}`} className="sr-only">
                  Icon
                </Label>
                <Select value={item.icon} onValueChange={(value: WhyChooseItem["icon"]) => updateItem(index, { icon: value })}>
                  <SelectTrigger id={`why-choose-icon-${index}`}>
                    <SelectValue placeholder="Icon" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="award">Award</SelectItem>
                    <SelectItem value="book">Book</SelectItem>
                    <SelectItem value="star">Star</SelectItem>
                    <SelectItem value="shield">Shield</SelectItem>
                    <SelectItem value="bolt">Bolt</SelectItem>
                    <SelectItem value="heart">Heart</SelectItem>
                    <SelectItem value="users">Users</SelectItem>
                    <SelectItem value="globe">Globe</SelectItem>
                    <SelectItem value="sparkles">Sparkles</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label htmlFor={`why-choose-title-${index}`} className="sr-only">
                  Why choose title
                </Label>
                <Input
                  id={`why-choose-title-${index}`}
                  value={item.title}
                  onChange={(e) => updateItem(index, { title: e.target.value })}
                  placeholder="Title"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor={`why-choose-desc-${index}`} className="sr-only">
                  Why choose description
                </Label>
                <Input
                  id={`why-choose-desc-${index}`}
                  value={item.description}
                  onChange={(e) => updateItem(index, { description: e.target.value })}
                  placeholder="Description"
                />
              </div>
            </div>
            <div className="flex items-center gap-1 self-end md:self-auto">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeItem(index)}
                aria-label={`Delete ${item.title}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => moveWhyChooseItem(index, -1)}
                disabled={index === 0}
                aria-label={`Move ${item.title} up`}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => moveWhyChooseItem(index, 1)}
                disabled={index === formData.whyChooseItems.length - 1}
                aria-label={`Move ${item.title} down`}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-emerald-600">Saved.</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  )
}
