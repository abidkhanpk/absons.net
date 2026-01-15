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
import { useEffect, useState } from "react"
import type { SiteSettings } from "@/lib/site-settings"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    siteTitle: "ABSON Solutions",
    logoUrl: null,
    faviconUrl: null,
    navAlignment: "left",
    navLoginText: "Login",
    navCtaText: "Get Started",
    navCtaHref: "/contact",
    navCtaEnabled: true,
    heroSlides: [],
    heroMode: "static",
    heroStaticIndex: 0,
    heroAutoplaySeconds: 6,
    heroHeight: 560,
    showServices: true,
    showTraining: true,
    showTestimonials: true,
    businessHours: "Mon - Sat",
    businessDays: "9:00 AM - 6:00 PM",
    businessHoursMode: "table",
    businessHoursSchedule: [
      { day: "Monday", open: "09:00", close: "18:00", closed: false },
      { day: "Tuesday", open: "09:00", close: "18:00", closed: false },
      { day: "Wednesday", open: "09:00", close: "18:00", closed: false },
      { day: "Thursday", open: "09:00", close: "18:00", closed: false },
      { day: "Friday", open: "09:00", close: "18:00", closed: false },
      { day: "Saturday", open: "10:00", close: "14:00", closed: false },
      { day: "Sunday", open: "00:00", close: "00:00", closed: true },
    ],
    showBusinessHours: true,
    layoutMode: "container",
    layoutWidth: 90,
    logoWidth: 40,
    logoHeight: 40,
    logoRadius: 0,
    showLoginLink: true,
    contactEmail: "info@absonsolutions.com",
    contactPhone: "+92 XXX XXXXXXX",
    contactAddress: "Pakistan",
  })

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

  useEffect(() => {
    const parseSchedule = (raw: unknown) => {
      try {
        if (Array.isArray(raw)) return raw
        if (!raw) return []
        const parsed = JSON.parse(String(raw))
        return Array.isArray(parsed) ? parsed : []
      } catch {
        return []
      }
    }

    const loadSettings = async () => {
      try {
        const res = await fetch("/api/site-settings")
        const json = await res.json()
        if (json?.settings) {
          setSiteSettings({
            siteTitle: json.settings.siteTitle ?? "ABSON Solutions",
            logoUrl: json.settings.logoUrl ?? null,
            faviconUrl: json.settings.faviconUrl ?? null,
            navAlignment: json.settings.navAlignment ?? "left",
            navLoginText: json.settings.navLoginText ?? "Login",
            navCtaText: json.settings.navCtaText ?? "Get Started",
            navCtaHref: json.settings.navCtaHref ?? "/contact",
            navCtaEnabled: json.settings.navCtaEnabled ?? true,
            heroSlides:
              typeof json.settings.heroSlides === "string"
                ? (() => {
                    try {
                      return JSON.parse(json.settings.heroSlides || "[]")
                    } catch {
                      return []
                    }
                  })()
                : json.settings.heroSlides ?? [],
            heroMode: json.settings.heroMode ?? "static",
            heroStaticIndex: json.settings.heroStaticIndex ?? 0,
            heroAutoplaySeconds: json.settings.heroAutoplaySeconds ?? 6,
            heroHeight: json.settings.heroHeight ?? 560,
            showServices: json.settings.showServices ?? true,
            showTraining: json.settings.showTraining ?? true,
            showTestimonials: json.settings.showTestimonials ?? true,
            businessHours: json.settings.businessHours ?? "Mon - Sat",
            businessDays: json.settings.businessDays ?? "9:00 AM - 6:00 PM",
            businessHoursSchedule:
              parseSchedule(json.settings.businessHoursSchedule).length > 0
                ? parseSchedule(json.settings.businessHoursSchedule)
                : [
                    { day: "Monday", open: "09:00", close: "18:00", closed: false },
                    { day: "Tuesday", open: "09:00", close: "18:00", closed: false },
                    { day: "Wednesday", open: "09:00", close: "18:00", closed: false },
                    { day: "Thursday", open: "09:00", close: "18:00", closed: false },
                    { day: "Friday", open: "09:00", close: "18:00", closed: false },
                    { day: "Saturday", open: "10:00", close: "14:00", closed: false },
                    { day: "Sunday", open: "00:00", close: "00:00", closed: true },
                  ],
            showBusinessHours: json.settings.showBusinessHours ?? true,
            businessHoursMode: json.settings.businessHoursMode ?? "table",
            layoutMode: json.settings.layoutMode ?? "container",
            layoutWidth: json.settings.layoutWidth ?? 90,
            logoWidth: json.settings.logoWidth ?? 40,
            logoHeight: json.settings.logoHeight ?? 40,
            logoRadius: json.settings.logoRadius ?? 0,
            showLoginLink: json.settings.showLoginLink ?? true,
            contactEmail: json.settings.contactEmail ?? "info@absonsolutions.com",
            contactPhone: json.settings.contactPhone ?? "+92 XXX XXXXXXX",
            contactAddress: json.settings.contactAddress ?? "Pakistan",
          })
        }
      } catch {
        // use defaults
      }
    }
    loadSettings()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || "Failed to submit. Please try again.")

      setSubmitted(true)
      setFormData({ name: "", email: "", phone: "", company: "", message: "" })
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to submit. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header settings={siteSettings} />

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
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                          <h2 className="text-2xl font-bold">Send us a Message</h2>
                          <p className="text-muted-foreground">
                            Fill out the form below and we'll respond within 24 hours
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
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              placeholder="Ahmed Khan"
                            />
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
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              placeholder="ahmed@example.com"
                            />
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
                          <Label htmlFor="message">
                            Message <span className="text-destructive">*</span>
                          </Label>
                          <Textarea
                            id="message"
                            required
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            placeholder="Tell us about your requirements..."
                            rows={6}
                          />
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
                          <p className="text-sm text-muted-foreground">{siteSettings.contactEmail}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
                          <Phone className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium mb-1">Phone</p>
                          <p className="text-sm text-muted-foreground">{siteSettings.contactPhone}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
                          <MapPin className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium mb-1">Location</p>
                          <p className="text-sm text-muted-foreground">{siteSettings.contactAddress}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {(() => {
                  const grouped = groupSchedule(siteSettings.businessHoursSchedule)
                  const fallbackDays = grouped.map((g) => g.label).join(", ")
                  const fallbackHours = grouped.map((g) => `${g.label}: ${g.hours}`).join("; ")
                  const summaryDays = siteSettings.businessDays || fallbackDays
                  const summaryHours = siteSettings.businessHours || fallbackHours
                  const hasContent =
                    siteSettings.businessHoursMode !== "hidden" &&
                    (siteSettings.showBusinessHours || summaryDays || summaryHours)

                  if (!hasContent) return null

                  return (
                  <Card className="border-border bg-primary text-primary-foreground">
                    <CardContent className="p-6 space-y-3">
                      <h3 className="text-xl font-semibold">Business Hours</h3>
                      <p className="text-sm text-primary-foreground/90">
                        We aim to reply to all enquiries within one business day.
                      </p>
                      {siteSettings.businessHoursMode === "table" ? (
                        <div className="space-y-2 text-sm">
                          {groupSchedule(siteSettings.businessHoursSchedule).map((group) => (
                            <div
                              key={group.label}
                              className="flex items-center justify-between rounded-md bg-primary-foreground/10 px-4 py-2"
                            >
                              <div className="font-semibold">{group.label}</div>
                              <div className="text-right">{group.hours}</div>
                            </div>
                          ))}
                        </div>
                      ) : siteSettings.businessHoursMode === "summary" ? (
                        <div className="space-y-1 text-sm rounded-md bg-primary-foreground/10 px-4 py-3 text-right">
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

      <Footer settings={siteSettings} />
    </div>
  )
}
