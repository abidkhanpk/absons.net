import type { MetadataRoute } from "next"
import { getSiteSettings } from "@/lib/site-settings"
import { resolveSiteBaseUrl } from "@/lib/seo"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSiteSettings()
  const baseUrl = resolveSiteBaseUrl(settings.seoDefaultCanonicalBase)

  // Respect the global "allow indexing" switch: when off, ask crawlers to stay
  // out entirely and do not advertise a sitemap.
  if (!settings.allowIndexing) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    }
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Keep private/admin/API surfaces out of the index.
        disallow: ["/admin", "/api", "/auth", "/assets"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
