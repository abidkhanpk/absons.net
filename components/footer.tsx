import Link from "next/link"
import { Mail, Phone, MapPin } from "lucide-react"
import type { SiteSettings } from "@/lib/site-settings"

export function Footer({ settings }: { settings: SiteSettings }) {
  const navItems = (settings.footerNavItems || []).filter((item) => item.enabled !== false)
  const secondaryItems = (settings.footerSecondaryNavItems || []).filter((item) => item.enabled !== false)
  const showCompany = settings.footerShowCompanyInfo !== false
  const showSecondary = settings.footerShowSecondaryColumn !== false
  const showContact = settings.footerShowContactColumn !== false
  const companyName = settings.footerCompanyName || settings.siteTitle || "Site"
  const companyDescription =
    settings.footerCompanyDescription ||
    "Professional software solutions and training services for educational institutions and organizations."
  const companyTagline = typeof settings.companyTagline === "string" ? settings.companyTagline.trim() : ""
  const showFooterTagline = settings.showFooterTagline !== false && Boolean(companyTagline)

  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-8 md:mx-auto md:w-fit md:grid-flow-col md:auto-cols-[260px]">
          {showCompany ? (
            <div className="w-full md:w-[260px] space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
                  {companyName?.slice(0, 2).toUpperCase() || "AS"}
                </div>
                <span className="font-bold text-lg">{companyName}</span>
              </div>
              {showFooterTagline ? <p className="text-xs text-muted-foreground">{companyTagline}</p> : null}
              <p className="text-sm text-muted-foreground leading-relaxed">
                {companyDescription}
              </p>
            </div>
          ) : null}

          <div className="w-full md:w-[260px]">
            <h3 className="font-semibold mb-4">{settings.footerQuickLinksTitle || "Quick Links"}</h3>
            <ul className="space-y-3">
              {navItems.map((item) => (
                <li key={item.id}>
                  <Link href={item.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {showSecondary ? (
            <div className="w-full md:w-[260px]">
              <h3 className="font-semibold mb-4">{settings.footerSecondaryTitle || "Services"}</h3>
              <ul className="space-y-3">
                {secondaryItems.map((item) => (
                  <li key={item.id}>
                    <Link href={item.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {showContact ? (
            <div className="w-full md:w-[260px]">
              <h3 className="font-semibold mb-4">{settings.footerContactTitle || "Contact Info"}</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Mail className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{settings.contactEmail || "info@absonsolutions.com"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Phone className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{settings.contactPhone || "+92 XXX XXXXXXX"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{settings.contactAddress || "Pakistan"}</span>
                </li>
              </ul>
            </div>
          ) : null}
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {settings.siteTitle || "Site"}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
