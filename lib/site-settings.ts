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

export async function getSiteSettings(): Promise<SiteSettings> {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "site" } })
  if (!settings) return defaultSettings

  return {
    siteTitle: settings.siteTitle ?? defaultSettings.siteTitle,
    logoUrl: settings.logoUrl || defaultSettings.logoUrl,
    navAlignment: settings.navAlignment ?? defaultSettings.navAlignment,
    navLoginText: settings.navLoginText ?? defaultSettings.navLoginText,
    logoWidth: settings.logoWidth ?? defaultSettings.logoWidth,
    logoHeight: settings.logoHeight ?? defaultSettings.logoHeight,
    contactEmail: settings.contactEmail ?? defaultSettings.contactEmail,
    contactPhone: settings.contactPhone ?? defaultSettings.contactPhone,
    contactAddress: settings.contactAddress ?? defaultSettings.contactAddress,
  }
}
