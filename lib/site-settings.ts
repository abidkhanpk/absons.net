import { prisma } from "./prisma"

export type SiteSettings = {
  siteTitle: string
  logoUrl: string | null
  navAlignment: string
  navLoginText: string
  logoWidth: number
  logoHeight: number
  contactEmail: string | null
  contactPhone: string | null
  contactAddress: string | null
}

const defaultSettings: SiteSettings = {
  siteTitle: "ABSON Solutions",
  logoUrl: "/uploads/default-logo.png",
  navAlignment: "left",
  navLoginText: "Login",
  logoWidth: 40,
  logoHeight: 40,
  contactEmail: "info@absonsolutions.com",
  contactPhone: "+92 XXX XXXXXXX",
  contactAddress: "Pakistan",
}

function resolveLogoUrl(logoUrl: string | null | undefined) {
  if (!logoUrl || logoUrl.trim() === "") {
    // Nothing configured in settings: use the bundled default logo
    return defaultSettings.logoUrl
  }

  // If an old WordPress asset URL is still stored, serve the bundled default instead of a 404
  if (logoUrl.includes("/wp-includes/")) {
    return defaultSettings.logoUrl
  }

  return logoUrl
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: "site" } })
    if (!settings) return defaultSettings

    return {
      siteTitle: settings.siteTitle ?? defaultSettings.siteTitle,
      logoUrl: resolveLogoUrl(settings.logoUrl),
      navAlignment: settings.navAlignment ?? defaultSettings.navAlignment,
      navLoginText: settings.navLoginText ?? defaultSettings.navLoginText,
      logoWidth: settings.logoWidth ?? defaultSettings.logoWidth,
      logoHeight: settings.logoHeight ?? defaultSettings.logoHeight,
      contactEmail: settings.contactEmail ?? defaultSettings.contactEmail,
      contactPhone: settings.contactPhone ?? defaultSettings.contactPhone,
      contactAddress: settings.contactAddress ?? defaultSettings.contactAddress,
    }
  } catch (error) {
    console.error("Failed to load site settings, using defaults:", error)
    return defaultSettings
  }
}
