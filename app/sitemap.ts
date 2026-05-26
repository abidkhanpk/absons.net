import type { MetadataRoute } from "next"
import { prisma } from "@/lib/prisma"
import { getSiteSettings } from "@/lib/site-settings"

export const dynamic = "force-dynamic"
export const revalidate = 0

const STATIC_ROUTE_CONFIG = [
  { path: "/", seoKey: "home" },
  { path: "/services", seoKey: "services", sectionId: "services" },
  { path: "/training", seoKey: "training", sectionId: "training" },
  { path: "/products", seoKey: "products", sectionId: "products" },
  { path: "/departments", seoKey: "departments", sectionId: "departments" },
  { path: "/pricing", seoKey: "pricing", sectionId: "pricing" },
  { path: "/contact", seoKey: "contact" },
  { path: "/blog", seoKey: "blog" },
] as const

type StaticSeoKey = (typeof STATIC_ROUTE_CONFIG)[number]["seoKey"]
type SectionRouteId = Extract<(typeof STATIC_ROUTE_CONFIG)[number]["sectionId"], string>

const RESERVED_STATIC_SLUGS = new Set(
  STATIC_ROUTE_CONFIG.filter((route) => route.path !== "/").map((route) => route.path.slice(1)),
)

function normalizeBaseUrl(input: string) {
  const trimmed = input.trim().replace(/\/+$/g, "")
  if (!trimmed) return ""
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  try {
    return new URL(withProtocol).toString().replace(/\/+$/g, "")
  } catch {
    return ""
  }
}

function resolvePublicBaseUrl(canonicalBase: string) {
  const fromCanonical = normalizeBaseUrl(canonicalBase)
  if (fromCanonical) return fromCanonical

  const fromPublicEnv = normalizeBaseUrl(process.env.NEXT_PUBLIC_SITE_URL || "")
  if (fromPublicEnv) return fromPublicEnv

  const fromVercel = normalizeBaseUrl(process.env.VERCEL_URL || "")
  if (fromVercel) return fromVercel

  return "http://localhost:3000"
}

function toAbsoluteUrl(baseUrl: string, path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return `${baseUrl}${normalizedPath === "/" ? "" : normalizedPath}`
}

function isLikelyAbsoluteUrl(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return false
  if (/^https?:\/\//i.test(trimmed)) return true
  return /^[a-z0-9.-]+\.[a-z]{2,}(?:[/:?#]|$)/i.test(trimmed)
}

function normalizeAbsoluteUrl(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ""
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  try {
    return new URL(withProtocol).toString().replace(/\/+$/g, "")
  } catch {
    return ""
  }
}

function resolveEntryUrl(baseUrl: string, canonicalUrl: string | null | undefined, fallbackPath: string) {
  const canonical = canonicalUrl?.trim() || ""
  if (!canonical) return toAbsoluteUrl(baseUrl, fallbackPath)
  if (isLikelyAbsoluteUrl(canonical)) {
    return normalizeAbsoluteUrl(canonical) || toAbsoluteUrl(baseUrl, fallbackPath)
  }
  return toAbsoluteUrl(baseUrl, canonical)
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getSiteSettings()
  const baseUrl = resolvePublicBaseUrl(settings.seoDefaultCanonicalBase || "")
  const approvalRequired = settings.editorApprovalRequired ?? true
  const enabledSectionRoutes = new Set<SectionRouteId>(
    settings.homeSections
      .filter((section) => section.enabled)
      .map((section) => section.id)
      .filter(
        (id): id is SectionRouteId =>
          id === "services" || id === "training" || id === "products" || id === "departments" || id === "pricing",
      ),
  )

  const [blogPosts, pages] = await Promise.all([
    prisma.blogPost.findMany({
      where: approvalRequired
        ? { published: true, approved: true, seoNoIndex: false }
        : { published: true, seoNoIndex: false },
      select: {
        slug: true,
        seoCanonicalUrl: true,
        updatedAt: true,
        publishedAt: true,
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.page.findMany({
      where: approvalRequired
        ? { published: true, approved: true, seoNoIndex: false }
        : { published: true, seoNoIndex: false },
      select: {
        slug: true,
        seoCanonicalUrl: true,
        updatedAt: true,
        publishedAt: true,
      },
      orderBy: { updatedAt: "desc" },
    }),
  ])

  const entries: MetadataRoute.Sitemap = []
  const seen = new Set<string>()

  for (const route of STATIC_ROUTE_CONFIG) {
    if (route.sectionId && !enabledSectionRoutes.has(route.sectionId)) continue
    const seoKey: StaticSeoKey = route.seoKey
    if (settings.staticSeo[seoKey]?.noIndex) continue
    const url = toAbsoluteUrl(baseUrl, route.path)
    if (seen.has(url)) continue
    seen.add(url)
    entries.push({
      url,
      lastModified: new Date(),
      changeFrequency: route.path === "/" ? "daily" : "weekly",
      priority: route.path === "/" ? 1 : route.path === "/blog" ? 0.8 : 0.7,
    })
  }

  for (const post of blogPosts) {
    const slug = post.slug?.trim()
    if (!slug) continue
    const url = resolveEntryUrl(baseUrl, post.seoCanonicalUrl, `/blog/${slug}`)
    if (seen.has(url)) continue
    seen.add(url)
    entries.push({
      url,
      lastModified: post.updatedAt ?? post.publishedAt ?? new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    })
  }

  for (const page of pages) {
    const slug = page.slug?.trim()
    if (!slug || RESERVED_STATIC_SLUGS.has(slug)) continue
    const url = resolveEntryUrl(baseUrl, page.seoCanonicalUrl, `/${slug}`)
    if (seen.has(url)) continue
    seen.add(url)
    entries.push({
      url,
      lastModified: page.updatedAt ?? page.publishedAt ?? new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    })
  }

  return entries
}
