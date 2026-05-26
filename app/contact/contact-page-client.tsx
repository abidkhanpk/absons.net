"use client"

import type React from "react"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin, Send } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import type { SiteSettings } from "@/lib/site-settings"

type ContactPageClientProps = {
  settings: SiteSettings
}

type RequiredContactField = "name" | "email" | "purpose" | "message"

const requiredContactFields: RequiredContactField[] = ["name", "email", "purpose", "message"]

export function ContactPageClient({ settings }: ContactPageClientProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    purpose: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [touchedFields, setTouchedFields] = useState<Record<RequiredContactField, boolean>>({
    name: false,
    email: false,
    purpose: false,
    message: false,
  })
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<RequiredContactField, string>>>({})
  const externalFormRef = useRef<HTMLDivElement | null>(null)
  const useExternalForm =
    settings.emailSettings.contactFormMode === "external_embed" &&
    settings.emailSettings.externalFormEmbedHtml.trim().length > 0

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  const validateRequiredField = (field: RequiredContactField, value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return "This field is required."
    if (field === "email" && !emailPattern.test(trimmed)) return "Enter a valid email address."
    return ""
  }

  const setValidationError = (field: RequiredContactField, message: string) => {
    setFieldErrors((prev) => {
      if (!message) {
        if (!prev[field]) return prev
        const next = { ...prev }
        delete next[field]
        return next
      }
      if (prev[field] === message) return prev
      return { ...prev, [field]: message }
    })
  }

  const handleRequiredChange = (field: RequiredContactField, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (touchedFields[field] || fieldErrors[field]) {
      setValidationError(field, validateRequiredField(field, value))
    }
  }

  const handleRequiredBlur = (field: RequiredContactField) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }))
    setValidationError(field, validateRequiredField(field, formData[field]))
  }

  useEffect(() => {
    if (!useExternalForm || !externalFormRef.current) return
    const container = externalFormRef.current
    const scripts = Array.from(container.querySelectorAll("script"))
    scripts.forEach((script) => {
      const next = document.createElement("script")
      Array.from(script.attributes).forEach((attr) => {
        next.setAttribute(attr.name, attr.value)
      })
      next.text = script.text
      script.parentNode?.replaceChild(next, script)
    })
  }, [useExternalForm, settings.emailSettings.externalFormEmbedHtml])

  const orderedDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

  const formatTime = (value: string) => {
    if (!value) return ""
    const [h, m] = value.split(":").map(Number)
    if (Number.isNaN(h) || Number.isNaN(m)) return value
    const period = h >= 12 ? "PM" : "AM"
    const hour = ((h + 11) % 12) + 1
    return `${hour}:${m.toString().padStart(2, "0")} ${period}`
  }

  const groupSchedule = (schedule: { day: string; open: string; close: string; closed?: boolean }[]) => {
    const normalized = orderedDays.map((day) => {
      const found = schedule?.find((entry) => entry.day === day)
      return (
        found || {
          day,
          open: "",
          close: "",
          closed: true,
        }
      )
    })

    const groups: { days: string[]; open: string; close: string; closed?: boolean }[] = []
    normalized.forEach((entry) => {
      const normalizedOpen = entry.closed ? "closed" : entry.open
      const normalizedClose = entry.closed ? "closed" : entry.close
      const last = groups[groups.length - 1]
      const hasSameHours =
        last && last.closed === entry.closed && last.open === normalizedOpen && last.close === normalizedClose
      if (last && hasSameHours) {
        last.days.push(entry.day)
      } else {
        groups.push({ days: [entry.day], open: normalizedOpen, close: normalizedClose, closed: entry.closed })
      }
    })

    return groups.map((group) => ({
      label: group.days.length > 1 ? `${group.days[0]} - ${group.days[group.days.length - 1]}` : group.days[0],
      hours: group.closed ? "Closed" : `${formatTime(group.open)} - ${formatTime(group.close)}`,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const nextErrors: Partial<Record<RequiredContactField, string>> = {}
    for (const field of requiredContactFields) {
      const message = validateRequiredField(field, formData[field])
      if (message) nextErrors[field] = message
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors)
      setTouchedFields({
        name: true,
        email: true,
        purpose: true,
        message: true,
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || "Failed to submit. Please try again.")

      setSubmitted(true)
      setFormData({ name: "", email: "", phone: "", company: "", purpose: "", message: "" })
      setFieldErrors({})
      setTouchedFields({
        name: false,
        email: false,
        purpose: false,
        message: false,
      })
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to submit. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header settings={settings} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 border-b border-border">
          <div className="container mx-auto px-4 lg:px-8 py-16">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-balance">Contact Us</h1>
              <p className="text-lg text-muted-foreground text-pretty leading-relaxed">
                Get in touch with our team to discuss how we can help your organization
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Contact Form */}
              <div className="lg:col-span-2">
                <Card className="border-border">
                  <CardContent className="p-6 md:p-8">
                    {submitted ? (
                      <div className="text-center py-8 space-y-4">
                        <div className="flex justify-center">
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Send className="h-8 w-8" />
                          </div>
                        </div>
                        <h3 className="text-2xl font-bold">Thank You!</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          Your message has been received. We'll get back to you as soon as possible.
                        </p>
                        <Button onClick={() => setSubmitted(false)} variant="outline">
                          Send Another Message
                        </Button>
                      </div>
                    ) : useExternalForm ? (
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <h2 className="text-2xl font-bold">Send us a Message</h2>
                          <p className="text-muted-foreground">
                            Fill out the form below and we'll get back to you.
                          </p>
                        </div>
                        <div
                          ref={externalFormRef}
                          className="w-full"
                          dangerouslySetInnerHTML={{ __html: settings.emailSettings.externalFormEmbedHtml }}
                        />
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                          <h2 className="text-2xl font-bold">Send us a Message</h2>
                          <p className="text-muted-foreground">
                            Fill out the form below and we'll get back to you.
                          </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">
                              Full Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              id="name"
                              required
                              value={formData.name}
                              onChange={(e) => handleRequiredChange("name", e.target.value)}
                              onBlur={() => handleRequiredBlur("name")}
                              aria-invalid={Boolean(touchedFields.name && fieldErrors.name)}
                              className={touchedFields.name && fieldErrors.name ? "border-destructive focus-visible:ring-destructive" : ""}
                              placeholder="Ahmed Khan"
                            />
                            {touchedFields.name && fieldErrors.name ? (
                              <p className="text-xs text-destructive">{fieldErrors.name}</p>
                            ) : null}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="email">
                              Email Address <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              id="email"
                              type="email"
                              required
                              value={formData.email}
                              onChange={(e) => handleRequiredChange("email", e.target.value)}
                              onBlur={() => handleRequiredBlur("email")}
                              aria-invalid={Boolean(touchedFields.email && fieldErrors.email)}
                              className={touchedFields.email && fieldErrors.email ? "border-destructive focus-visible:ring-destructive" : ""}
                              placeholder="ahmed@example.com"
                            />
                            {touchedFields.email && fieldErrors.email ? (
                              <p className="text-xs text-destructive">{fieldErrors.email}</p>
                            ) : null}
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                              id="phone"
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              placeholder="+92 XXX XXXXXXX"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="company">Company/Organization</Label>
                            <Input
                              id="company"
                              value={formData.company}
                              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                              placeholder="Your Organization"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="purpose">
                            Purpose <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="purpose"
                            required
                            value={formData.purpose}
                            onChange={(e) => handleRequiredChange("purpose", e.target.value)}
                            onBlur={() => handleRequiredBlur("purpose")}
                            aria-invalid={Boolean(touchedFields.purpose && fieldErrors.purpose)}
                            className={touchedFields.purpose && fieldErrors.purpose ? "border-destructive focus-visible:ring-destructive" : ""}
                            placeholder="Purpose of inquiry"
                          />
                          {touchedFields.purpose && fieldErrors.purpose ? (
                            <p className="text-xs text-destructive">{fieldErrors.purpose}</p>
                          ) : null}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="message">
                            Message <span className="text-destructive">*</span>
                          </Label>
                          <Textarea
                            id="message"
                            required
                            value={formData.message}
                            onChange={(e) => handleRequiredChange("message", e.target.value)}
                            onBlur={() => handleRequiredBlur("message")}
                            aria-invalid={Boolean(touchedFields.message && fieldErrors.message)}
                            className={
                              touchedFields.message && fieldErrors.message
                                ? "min-h-30 border-destructive focus-visible:ring-destructive"
                                : "min-h-30"
                            }
                            placeholder="Tell us about your requirements..."
                            rows={5}
                          />
                          {touchedFields.message && fieldErrors.message ? (
                            <p className="text-xs text-destructive">{fieldErrors.message}</p>
                          ) : null}
                        </div>

                        {error && <p className="text-sm text-destructive">{error}</p>}

                        <Button type="submit" disabled={isSubmitting} size="lg" className="w-full md:w-auto">
                          {isSubmitting ? "Sending..." : "Send Message"}
                          <Send className="ml-2 h-4 w-4" />
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Contact Information */}
              <div className="space-y-6">
                <Card className="border-border">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="text-xl font-semibold">Contact Information</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
                          <Mail className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium mb-1">Email</p>
                          <p className="text-sm text-muted-foreground">{settings.contactEmail}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
                          <Phone className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium mb-1">Phone</p>
                          <p className="text-sm text-muted-foreground">{settings.contactPhone}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
                          <MapPin className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium mb-1">Location</p>
                          <p className="text-sm text-muted-foreground">{settings.contactAddress}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {(() => {
                  const grouped = groupSchedule(settings.businessHoursSchedule)
                  const fallbackDays = grouped.map((g) => g.label).join(", ")
                  const fallbackHours = grouped.map((g) => `${g.label}: ${g.hours}`).join("; ")
                  const summaryDays = settings.businessDays || fallbackDays
                  const summaryHours = settings.businessHours || fallbackHours
                  const hasContent =
                    settings.businessHoursMode !== "hidden" && (settings.showBusinessHours || summaryDays || summaryHours)

                  if (!hasContent) return null

                  return (
                    <Card className="border-border bg-primary text-primary-foreground">
                      <CardContent className="p-3">
                        <h3 className="text-xl font-semibold mb-1">Business Hours</h3>
                        {settings.businessHoursMode === "table" ? (
                          <div className="space-y-2 text-sm">
                            {groupSchedule(settings.businessHoursSchedule).map((group) => (
                              <div
                                key={group.label}
                                className="flex items-center justify-between rounded-md bg-primary-foreground/10 px-4 py-2"
                              >
                                <div className="font-semibold">{group.label}</div>
                                <div className="text-right">{group.hours}</div>
                              </div>
                            ))}
                          </div>
                        ) : settings.businessHoursMode === "summary" ? (
                          <div className="space-y-1 text-sm rounded-md bg-primary-foreground/10 px-3 py-1 text-left">
                            {summaryDays && <div>{summaryDays}</div>}
                            {summaryHours && <div>{summaryHours}</div>}
                          </div>
                        ) : null}
                      </CardContent>
                    </Card>
                  )
                })()}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer settings={settings} />
    </div>
  )
}
