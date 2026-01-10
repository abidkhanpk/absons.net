"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, Lock } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [settings, setSettings] = useState({
    site_title: "ABSON Solutions",
    logo_url: "",
    nav_alignment: "left",
    nav_login_text: "Login",
  })

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch("/api/site-settings")
        const json = await res.json()
        if (json?.settings) {
          setSettings({
            site_title: json.settings.site_title || "ABSON Solutions",
            logo_url: json.settings.logo_url || "",
            nav_alignment: json.settings.nav_alignment || "left",
            nav_login_text: json.settings.nav_login_text || "Login",
          })
        }
      } catch {
        // ignore and use defaults
      }
    }
    loadSettings()
  }, [])

  const navAlignmentClass = useMemo(() => {
    switch (settings.nav_alignment) {
      case "center":
        return "justify-center"
      case "right":
        return "justify-end"
      default:
        return "justify-start"
    }
  }, [settings.nav_alignment])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto px-4 lg:px-8">
        <div className="flex h-16 items-center gap-6">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              {settings.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={settings.logo_url} alt={settings.site_title} className="h-10 w-10 rounded-lg object-cover" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
                  {settings.site_title.slice(0, 2).toUpperCase()}
                </div>
              )}
              <span className="font-bold text-lg text-foreground">{settings.site_title}</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className={`hidden md:flex flex-1 ${navAlignmentClass}`}>
            <div className="flex items-center gap-8">
              <Link
                href="/"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Home
              </Link>
              <Link
                href="/about"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                About
              </Link>
              <Link
                href="/services"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Services
              </Link>
              <Link
                href="/training"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Training
              </Link>
              <Link
                href="/blog"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Blog
              </Link>
              <Link
                href="/contact"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3 ml-auto">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <Lock className="h-4 w-4" />
              {settings.nav_login_text || "Login"}
            </Link>
            <Button asChild size="sm">
              <Link href="/contact">Get Started</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/40">
            <div className="flex flex-col gap-4">
              <Link
                href="/"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/about"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/services"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Services
              </Link>
              <Link
                href="/training"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Training
              </Link>
              <Link
                href="/blog"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Blog
              </Link>
              <Link
                href="/contact"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="flex items-center justify-between gap-3">
                <Button asChild className="flex-1">
                  <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
                    Get Started
                  </Link>
                </Button>
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Lock className="h-4 w-4" />
                  {settings.nav_login_text || "Login"}
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
