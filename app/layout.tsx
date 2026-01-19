import type React from "react"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ServiceWorkerReset } from "@/components/service-worker-reset"
import { getSiteSettings } from "@/lib/site-settings"
import "./globals.css"

const DEFAULT_FAVICON = "/uploads/default-icon-light-32x32.png"
const DARK_FAVICON = "/uploads/default-icon-dark-32x32.png"
const SVG_FAVICON = "/uploads/default-icon.svg"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

// Force dynamic rendering so pages always pick up current settings and assets
export const dynamic = "force-dynamic"
export const revalidate = 0

function iconMeta(url: string | null | undefined) {
  const safeUrl = url || DEFAULT_FAVICON
  const lower = safeUrl.toLowerCase()
  const isPng = lower.includes(".png")
  const isIco = lower.includes(".ico")

  return {
    url: safeUrl,
    // Uploaded favicons are normalized to 32x32 PNG; leave undefined for ICO/misc to let browsers choose
    sizes: isIco ? undefined : "32x32",
    type: isPng ? "image/png" : isIco ? "image/x-icon" : undefined,
  }
}

export async function generateMetadata() {
  const settings = await getSiteSettings()
  const favicon = settings.faviconUrl || DEFAULT_FAVICON
  const iconEntry = iconMeta(favicon)
  const usingCustomFavicon = favicon !== DEFAULT_FAVICON

  const iconList = usingCustomFavicon
    ? [iconEntry]
    : [
        iconEntry,
        {
          url: DARK_FAVICON,
          media: "(prefers-color-scheme: dark)",
          sizes: "32x32",
          type: "image/png",
        },
        {
          url: SVG_FAVICON,
          type: "image/svg+xml",
        },
      ]

  return {
    title: "ABSON Solutions - Software & Training Services",
    description:
      "Professional software solutions for schools, Quran academies, madaris, and vibration analysis training certification from Mobius Institute of Australia",
    generator: "v0.app",
    icons: {
      icon: iconList,
      shortcut: iconEntry,
      apple: iconEntry,
    },
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <LayoutWithSettings>{children}</LayoutWithSettings>
        <Analytics />
      </body>
    </html>
  )
}

async function LayoutWithSettings({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings()
  const layoutMode = settings.layoutMode || "container"
  const widthValue = layoutMode === "full" ? "100%" : `${Math.min(Math.max(settings.layoutWidth || 90, 60), 100)}%`
  const analyticsSnippet = settings.analyticsScript?.trim()
  const headerSnippet = settings.headerCode?.trim()
  const footerSnippet = settings.footerCode?.trim()

  return (
    <div style={{ ["--page-container-max" as string]: widthValue }}>
      <ServiceWorkerReset />
      {analyticsSnippet ? <div dangerouslySetInnerHTML={{ __html: analyticsSnippet }} /> : null}
      {headerSnippet ? <div dangerouslySetInnerHTML={{ __html: headerSnippet }} /> : null}
      {children}
      {footerSnippet ? <div dangerouslySetInnerHTML={{ __html: footerSnippet }} /> : null}
    </div>
  )
}
