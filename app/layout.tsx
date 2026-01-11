import type React from "react"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ServiceWorkerReset } from "@/components/service-worker-reset"
import { getSiteSettings } from "@/lib/site-settings"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

// Force dynamic rendering so pages always pick up current settings and assets
export const dynamic = "force-dynamic"
export const revalidate = 0

function iconMeta(url: string | null | undefined) {
  const safeUrl = url || "/icon-light-32x32.png"
  const lower = safeUrl.toLowerCase()
  const isPng = lower.endsWith(".png")
  const isIco = lower.endsWith(".ico")

  return {
    url: safeUrl,
    sizes: "32x32",
    type: isPng ? "image/png" : isIco ? "image/x-icon" : undefined,
  }
}

export async function generateMetadata() {
  const settings = await getSiteSettings()
  const favicon = settings.faviconUrl || "/icon-light-32x32.png"
  const iconEntry = iconMeta(favicon)

  return {
    title: "ABSON Solutions - Software & Training Services",
    description:
      "Professional software solutions for schools, Quran academies, madaris, and vibration analysis training certification from Mobius Institute of Australia",
    generator: "v0.app",
    icons: {
      icon: [
        iconEntry,
        {
          url: "/icon-dark-32x32.png",
          media: "(prefers-color-scheme: dark)",
          sizes: "32x32",
          type: "image/png",
        },
        {
          url: "/icon.svg",
          type: "image/svg+xml",
        },
      ],
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
        <ServiceWorkerReset />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
