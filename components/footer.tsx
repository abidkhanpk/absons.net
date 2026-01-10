"use client"

import Link from "next/link"
import { Mail, Phone, MapPin } from "lucide-react"
import { useEffect, useState } from "react"

export function Footer() {
  const [settings, setSettings] = useState({
    site_title: "ABSON Solutions",
    contact_email: "info@absonsolutions.com",
    contact_phone: "+92 XXX XXXXXXX",
    contact_address: "Pakistan",
  })

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch("/api/site-settings")
        const json = await res.json()
        if (json?.settings) {
          setSettings({
            site_title: json.settings.site_title || "ABSON Solutions",
            contact_email: json.settings.contact_email || "info@absonsolutions.com",
            contact_phone: json.settings.contact_phone || "+92 XXX XXXXXXX",
            contact_address: json.settings.contact_address || "Pakistan",
          })
        }
      } catch {
        // fallback to defaults
      }
    }
    loadSettings()
  }, [])
  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
                {settings.site_title?.slice(0, 2).toUpperCase() || "AS"}
              </div>
              <span className="font-bold text-lg">{settings.site_title || "ABSON Solutions"}</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Professional software solutions and training services for educational institutions and organizations.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  href="/training"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Training
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Services</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/services"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  School Management
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Quran Academy Solutions
                </Link>
              </li>
              <li>
                <Link
                  href="/training"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Vibration Analysis
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Order Supply
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{settings.contact_email || "info@absonsolutions.com"}</span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{settings.contact_phone || "+92 XXX XXXXXXX"}</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{settings.contact_address || "Pakistan"}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} ABSON Solutions. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
