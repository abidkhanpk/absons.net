import type { EmailSettings, SiteSettings } from "./site-settings"

export type PublicHeaderSettings = {
  siteTitle: string
  logoUrl: string | null
  logoWidth: number
  logoHeight: number
  logoRadius: number
  navAlignment: string
  navLoginText: string
  navCtaText: string
  navCtaHref: string
  navCtaEnabled: boolean
  navItems: SiteSettings["navItems"]
  showLoginLink: boolean
  companyTagline: string
  showHeaderTagline: boolean
}

export type PublicFooterSettings = {
  siteTitle: string
  logoUrl: string | null
  footerMenuEnabled: boolean
  footerNavItems: SiteSettings["footerNavItems"]
  footerSecondaryNavItems: SiteSettings["footerSecondaryNavItems"]
  footerQuickLinksTitle: string
  footerSecondaryTitle: string
  footerContactTitle: string
  footerShowSecondaryColumn: boolean
  footerShowContactColumn: boolean
  footerShowCompanyInfo: boolean
  footerCompanyName: string
  footerCompanyDescription: string
  companyTagline: string
  showFooterTagline: boolean
  contactEmail: string | null
  contactPhone: string | null
  contactAddress: string | null
}

export type PublicContactSettings = {
  emailSettings: Pick<EmailSettings, "contactFormMode" | "externalFormEmbedHtml">
  contactEmail: string | null
  contactPhone: string | null
  contactAddress: string | null
  businessHoursSchedule: SiteSettings["businessHoursSchedule"]
  businessDays: string
  businessHours: string
  businessHoursMode: SiteSettings["businessHoursMode"]
  showBusinessHours: boolean
}

export function toPublicHeaderSettings(settings: SiteSettings): PublicHeaderSettings {
  return {
    siteTitle: settings.siteTitle,
    logoUrl: settings.logoUrl,
    logoWidth: settings.logoWidth,
    logoHeight: settings.logoHeight,
    logoRadius: settings.logoRadius,
    navAlignment: settings.navAlignment,
    navLoginText: settings.navLoginText,
    navCtaText: settings.navCtaText,
    navCtaHref: settings.navCtaHref,
    navCtaEnabled: settings.navCtaEnabled,
    navItems: settings.navItems,
    showLoginLink: settings.showLoginLink,
    companyTagline: settings.companyTagline,
    showHeaderTagline: settings.showHeaderTagline,
  }
}

export function toPublicFooterSettings(settings: SiteSettings): PublicFooterSettings {
  return {
    siteTitle: settings.siteTitle,
    logoUrl: settings.logoUrl,
    footerMenuEnabled: settings.footerMenuEnabled,
    footerNavItems: settings.footerNavItems,
    footerSecondaryNavItems: settings.footerSecondaryNavItems,
    footerQuickLinksTitle: settings.footerQuickLinksTitle,
    footerSecondaryTitle: settings.footerSecondaryTitle,
    footerContactTitle: settings.footerContactTitle,
    footerShowSecondaryColumn: settings.footerShowSecondaryColumn,
    footerShowContactColumn: settings.footerShowContactColumn,
    footerShowCompanyInfo: settings.footerShowCompanyInfo,
    footerCompanyName: settings.footerCompanyName,
    footerCompanyDescription: settings.footerCompanyDescription,
    companyTagline: settings.companyTagline,
    showFooterTagline: settings.showFooterTagline,
    contactEmail: settings.contactEmail,
    contactPhone: settings.contactPhone,
    contactAddress: settings.contactAddress,
  }
}

export function toPublicContactSettings(settings: SiteSettings): PublicContactSettings {
  return {
    emailSettings: {
      contactFormMode: settings.emailSettings.contactFormMode,
      externalFormEmbedHtml: settings.emailSettings.externalFormEmbedHtml,
    },
    contactEmail: settings.contactEmail,
    contactPhone: settings.contactPhone,
    contactAddress: settings.contactAddress,
    businessHoursSchedule: settings.businessHoursSchedule,
    businessDays: settings.businessDays,
    businessHours: settings.businessHours,
    businessHoursMode: settings.businessHoursMode,
    showBusinessHours: settings.showBusinessHours,
  }
}
