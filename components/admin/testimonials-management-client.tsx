"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowDown, ArrowUp, ChevronsDown, ChevronsUp, Edit, GripVertical, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DeleteTestimonialButton } from "@/components/admin/delete-testimonial-button"

type TestimonialItem = {
  id: string
  clientName: string
  clientCompany: string | null
  clientPosition: string | null
  content: string
  rating: number
  isFeatured: boolean
  displayOrder: number
}

function normalizeSequence(items: TestimonialItem[]): TestimonialItem[] {
  return items.map((item, index) => ({ ...item, displayOrder: index + 1 }))
}

function reorder(items: TestimonialItem[], fromIndex: number, toIndex: number) {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= items.length || toIndex >= items.length) {
    return items
  }
  const next = [...items]
  const [moved] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, moved)
  return normalizeSequence(next)
}

export function TestimonialsManagementClient({
  initialTestimonials,
  initialHomeTestimonialLimit,
  canManageHomeLimit,
}: {
  initialTestimonials: TestimonialItem[]
  initialHomeTestimonialLimit: number
  canManageHomeLimit: boolean
}) {
  const router = useRouter()
  const sortedInitial = useMemo(
    () =>
      normalizeSequence(
        [...initialTestimonials].sort((a, b) => {
          if (a.displayOrder !== b.displayOrder) return a.displayOrder - b.displayOrder
          return a.clientName.localeCompare(b.clientName)
        }),
      ),
    [initialTestimonials],
  )

  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(sortedInitial)
  const [dragFromIndex, setDragFromIndex] = useState<number | null>(null)
  const [orderDirty, setOrderDirty] = useState(false)
  const [isSavingOrder, setIsSavingOrder] = useState(false)
  const [homeLimit, setHomeLimit] = useState(String(Math.max(0, Math.floor(initialHomeTestimonialLimit))))
  const [isSavingHomeLimit, setIsSavingHomeLimit] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const moveTo = (fromIndex: number, toIndex: number) => {
    setTestimonials((prev) => reorder(prev, fromIndex, toIndex))
    setOrderDirty(true)
    setMessage(null)
    setError(null)
  }

  const handleDragStart = (index: number) => {
    setDragFromIndex(index)
  }

  const handleDrop = (toIndex: number) => {
    if (dragFromIndex === null) return
    moveTo(dragFromIndex, toIndex)
    setDragFromIndex(null)
  }

  const saveOrder = async () => {
    setIsSavingOrder(true)
    setError(null)
    setMessage(null)
    try {
      const response = await fetch("/api/admin/testimonials", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: testimonials.map((testimonial) => testimonial.id) }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(result.error || "Failed to save testimonial order")
      }
      setOrderDirty(false)
      setMessage("Testimonial order updated.")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save testimonial order")
    } finally {
      setIsSavingOrder(false)
    }
  }

  const saveHomeLimit = async () => {
    setIsSavingHomeLimit(true)
    setError(null)
    setMessage(null)
    try {
      const parsed = Number(homeLimit)
      if (!Number.isFinite(parsed) || parsed < 0) {
        throw new Error("Please enter a number greater than or equal to 0")
      }
      const response = await fetch("/api/admin/testimonials", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ homeTestimonialLimit: Math.floor(parsed) }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(result.error || "Failed to update home testimonial count")
      }
      setHomeLimit(String(Math.floor(parsed)))
      setMessage("Home testimonial display count updated.")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update home testimonial count")
    } finally {
      setIsSavingHomeLimit(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardContent className="p-4 md:p-5 space-y-3">
          <div>
            <h2 className="text-lg font-semibold">Home Testimonials Scroll Count</h2>
            <p className="text-sm text-muted-foreground">Set how many testimonials appear in the home scrolling section. Use `0` to show all.</p>
          </div>
          {canManageHomeLimit ? (
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-2">
                <Label htmlFor="home-testimonial-limit">Testimonials To Show</Label>
                <Input
                  id="home-testimonial-limit"
                  type="number"
                  min={0}
                  step={1}
                  value={homeLimit}
                  onChange={(event) => setHomeLimit(event.target.value)}
                  className="w-48"
                />
              </div>
              <Button onClick={saveHomeLimit} disabled={isSavingHomeLimit}>
                {isSavingHomeLimit ? "Saving..." : "Save Count"}
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Only super admins can update this value.</p>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Reorder Testimonials</h2>
        <Button onClick={saveOrder} disabled={!orderDirty || isSavingOrder}>
          {isSavingOrder ? "Saving..." : "Save Order"}
        </Button>
      </div>

      {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {testimonials.length > 0 ? (
        <div className="grid gap-4">
          {testimonials.map((testimonial, index) => (
            <Card
              key={testimonial.id}
              className="border-border"
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => handleDrop(index)}
              onDragEnd={() => setDragFromIndex(null)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-1 gap-3">
                    <button
                      type="button"
                      className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-muted/30 text-muted-foreground"
                      title="Drag to reorder"
                    >
                      <GripVertical className="h-4 w-4" />
                    </button>

                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">#{testimonial.displayOrder}</Badge>
                        <h3 className="text-xl font-semibold">{testimonial.clientName}</h3>
                        {testimonial.isFeatured ? <Badge>Featured</Badge> : null}
                        <div className="flex gap-1">
                          {Array.from({ length: testimonial.rating }).map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.clientPosition}
                        {testimonial.clientCompany ? `, ${testimonial.clientCompany}` : ""}
                      </p>
                      <p className="text-muted-foreground line-clamp-2 italic">"{testimonial.content}"</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={() => moveTo(index, 0)} disabled={index === 0} title="Move to top">
                      <ChevronsUp className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => moveTo(index, index - 1)} disabled={index === 0} title="Move up">
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveTo(index, index + 1)}
                      disabled={index === testimonials.length - 1}
                      title="Move down"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveTo(index, testimonials.length - 1)}
                      disabled={index === testimonials.length - 1}
                      title="Move to bottom"
                    >
                      <ChevronsDown className="h-4 w-4" />
                    </Button>

                    <Button asChild variant="outline" size="sm" title="Edit">
                      <Link href={`/admin/testimonials/edit/${testimonial.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <DeleteTestimonialButton testimonialId={testimonial.id} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-border">
          <CardContent className="p-12 text-center">
            <p className="text-lg font-medium mb-2">No testimonials yet</p>
            <p className="text-muted-foreground">Add client testimonials to build trust.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
