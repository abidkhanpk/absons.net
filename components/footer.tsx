import Link from "next/link"
import { Mail, Phone, MapPin } from "lucide-react"
import type { PublicFooterSettings } from "@/lib/site-public-settings"
import { resolveAssetUrl } from "@/lib/asset-url"

export function Footer({ settings }: { settings: PublicFooterSettings }) {
  const showFooterMenu = settings.footerMenuEnabled !== false
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
      <div className={`container mx-auto px-4 lg:px-8 ${showFooterMenu ? "py-12" : "py-6"}`}>
        {showFooterMenu ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4">
            {showCompany ? (
              <div className="min-w-0 space-y-4">
                <div className="flex items-center gap-2">
                  {settings.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={resolveAssetUrl(settings.logoUrl)}
                      alt={settings.siteTitle || companyName}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-lg object-contain"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
                      {companyName?.slice(0, 2).toUpperCase() || "AS"}
                    </div>
                  )}
                  <span className="flex flex-col leading-tight">
                    <span className="font-bold text-lg">{companyName}</span>
                    {showFooterTagline ? <span className="text-[11px] text-muted-foreground">{companyTagline}</span> : null}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed break-words">
                  {companyDescription}
                </p>
              </div>
            ) : null}

            <div className="min-w-0">
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
              <div className="min-w-0">
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
              <div className="min-w-0">
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
        ) : null}

        <div className={`${showFooterMenu ? "mt-12 pt-8 border-t border-border" : ""} text-center`}>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {settings.siteTitle || "Site"}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
