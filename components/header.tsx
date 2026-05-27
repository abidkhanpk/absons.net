"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X, Lock } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import type { PublicHeaderSettings } from "@/lib/site-public-settings"
import { resolveAssetUrl } from "@/lib/asset-url"

type HeaderProps = {
  settings: PublicHeaderSettings
}

export function Header({ settings }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [logoFailed, setLogoFailed] = useState(false)
  const headerRef = useRef<HTMLElement | null>(null)
  const pathname = usePathname() || "/"
  const navLinkClass =
    "relative inline-flex items-center text-sm font-semibold text-foreground/78 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:text-primary active:translate-y-0 active:scale-[0.97] focus-visible:outline-none focus-visible:text-primary focus-visible:ring-2 focus-visible:ring-primary/35 rounded-sm after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:rounded-full after:bg-gradient-to-r after:from-primary after:to-accent after:transition-transform after:duration-200 hover:after:scale-x-100 focus-visible:after:scale-x-100"
  const mobileNavLinkClass =
    "rounded-md px-3 py-2 text-sm font-semibold text-foreground/80 transition-all duration-200 ease-out hover:bg-primary/10 hover:text-primary active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"

  const logoRadius = Math.max(0, Math.min(512, settings.logoRadius ?? 8))
  const showCta = settings.navCtaEnabled !== false
  const navItems = (settings.navItems || []).filter((item) => item.enabled !== false)
  const companyTagline = typeof settings.companyTagline === "string" ? settings.companyTagline.trim() : ""
  const showHeaderTagline = settings.showHeaderTagline !== false && Boolean(companyTagline)

  const navAlignmentClass = useMemo(() => {
    switch (settings.navAlignment) {
      case "center":
        return "justify-center"
      case "right":
        return "justify-end"
      default:
        return "justify-start"
    }
  }, [settings.navAlignment])

  const normalizePath = (value: string) => {
    const [pathOnly] = value.split(/[?#]/)
    if (!pathOnly || pathOnly === "/") return "/"
    return pathOnly.replace(/\/+$/, "")
  }

  const isHrefActive = (href: string) => {
    if (!href.startsWith("/")) return false
    const current = normalizePath(pathname)
    const target = normalizePath(href)
    if (target === "/") return current === "/"
    return current === target || current.startsWith(`${target}/`)
  }

  const isLoginActive = normalizePath(pathname) === "/auth/login"

  useEffect(() => {
    const root = document.documentElement
    const mobileQuery = window.matchMedia("(max-width: 767px)")
    const headerEl = headerRef.current
    if (!headerEl) return

    const applyHeaderOffset = () => {
      if (mobileQuery.matches) {
        root.style.setProperty("--mobile-sticky-header-h", `${headerEl.offsetHeight}px`)
      } else {
        root.style.setProperty("--mobile-sticky-header-h", "0px")
      }
    }

    applyHeaderOffset()
    const observer = new ResizeObserver(applyHeaderOffset)
    observer.observe(headerEl)
    mobileQuery.addEventListener("change", applyHeaderOffset)
    window.addEventListener("resize", applyHeaderOffset)

    return () => {
      observer.disconnect()
      mobileQuery.removeEventListener("change", applyHeaderOffset)
      window.removeEventListener("resize", applyHeaderOffset)
    }
  }, [mobileMenuOpen, settings.navItems, settings.navCtaEnabled, settings.showLoginLink])

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 w-full border-b border-border/50 bg-gradient-to-r from-background/95 via-background/92 to-primary/8 shadow-[0_10px_26px_color-mix(in_oklab,var(--primary)_10%,transparent)] backdrop-blur supports-[backdrop-filter]:bg-background/70"
    >
      <nav className="container mx-auto px-4 lg:px-8">
        <div className="flex h-16 items-center gap-6">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              {settings.logoUrl && !logoFailed ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resolveAssetUrl(settings.logoUrl)}
                  alt={settings.siteTitle}
                  width={settings.logoWidth || 40}
                  height={settings.logoHeight || 40}
                  style={{
                    width: `${settings.logoWidth || 40}px`,
                    height: `${settings.logoHeight || 40}px`,
                    borderRadius: `${logoRadius}px`,
                  }}
                  className="object-contain"
                  onError={() => setLogoFailed(true)}
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
                  {settings.siteTitle.slice(0, 2).toUpperCase()}
                </div>
              )}
              <span className="flex flex-col leading-tight">
                <span className="font-bold text-lg text-foreground">{settings.siteTitle}</span>
                {showHeaderTagline ? <span className="text-[11px] text-muted-foreground">{companyTagline}</span> : null}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className={`hidden md:flex flex-1 ${navAlignmentClass}`}>
            <div className="flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`${navLinkClass} ${isHrefActive(item.href) ? "text-primary after:scale-x-100" : ""}`}
                  aria-current={isHrefActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {(settings.showLoginLink || showCta) && (
            <div className="hidden md:flex items-center gap-3 ml-auto">
              {settings.showLoginLink && (
                <Link
                  href="/auth/login"
                  className={`group inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-semibold transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-primary/10 hover:text-primary active:translate-y-0 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 ${
                    isLoginActive ? "bg-primary/10 text-primary ring-1 ring-primary/25" : "text-foreground/78"
                  }`}
                  aria-current={isLoginActive ? "page" : undefined}
                >
                  <Lock className="h-4 w-4 transition-transform duration-200 group-hover:rotate-6" />
                  {settings.navLoginText || "Login"}
                </Link>
              )}
              {showCta && (
                <Button asChild size="sm">
                  <Link href={settings.navCtaHref || "/contact"}>{settings.navCtaText || "Get Started"}</Link>
                </Button>
              )}
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            className="md:hidden ml-auto -mr-2 rounded-md border border-transparent p-2 text-foreground/75 transition-all duration-200 hover:border-primary/25 hover:bg-primary/10 hover:text-primary active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50 bg-gradient-to-b from-background/90 to-primary/5">
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`${mobileNavLinkClass} ${isHrefActive(item.href) ? "bg-primary/15 text-primary ring-1 ring-primary/30" : ""}`}
                  aria-current={isHrefActive(item.href) ? "page" : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="flex items-center justify-between gap-3">
                {showCta && (
                  <Button asChild className="flex-1">
                    <Link href={settings.navCtaHref || "/contact"} onClick={() => setMobileMenuOpen(false)}>
                      {settings.navCtaText || "Get Started"}
                    </Link>
                  </Button>
                )}
                {settings.showLoginLink && (
                  <Link
                    href="/auth/login"
                    className={`inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-semibold transition-all duration-200 ease-out hover:bg-primary/10 hover:text-primary active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 ${
                      isLoginActive ? "bg-primary/15 text-primary ring-1 ring-primary/30" : "text-foreground/80"
                    }`}
                    aria-current={isLoginActive ? "page" : undefined}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Lock className="h-4 w-4" />
                    {settings.navLoginText || "Login"}
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
