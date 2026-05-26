import type { MetadataRoute } from "next"
import { prisma } from "@/lib/prisma"
import { getSiteSettings } from "@/lib/site-settings"

export const dynamic = "force-dynamic"
export const revalidate = 0

const STATIC_ROUTES = ["/", "/about", "/services", "/training", "/products", "/departments", "/pricing", "/contact", "/blog"] as const

const STATIC_ROUTE_SEO_KEY: Record<(typeof STATIC_ROUTES)[number], "home" | "about" | "services" | "training" | "products" | "departments" | "pricing" | "contact" | "blog"> =
  {
    "/": "home",
    "/about": "about",
    "/services": "services",
    "/training": "training",
    "/products": "products",
    "/departments": "departments",
    "/pricing": "pricing",
    "/contact": "contact",
    "/blog": "blog",
  }

const RESERVED_STATIC_SLUGS = new Set(STATIC_ROUTES.filter((route) => route !== "/").map((route) => route.slice(1)))

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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getSiteSettings()
  const baseUrl = resolvePublicBaseUrl(settings.seoDefaultCanonicalBase || "")
  const approvalRequired = settings.editorApprovalRequired ?? true

  const [blogPosts, pages] = await Promise.all([
    prisma.blogPost.findMany({
      where: approvalRequired
        ? { published: true, approved: true, seoNoIndex: false }
        : { published: true, seoNoIndex: false },
      select: {
        slug: true,
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
        updatedAt: true,
        publishedAt: true,
      },
      orderBy: { updatedAt: "desc" },
    }),
  ])

  const entries: MetadataRoute.Sitemap = []
  const seen = new Set<string>()

  for (const route of STATIC_ROUTES) {
    const seoKey = STATIC_ROUTE_SEO_KEY[route]
    if (settings.staticSeo[seoKey]?.noIndex) continue
    const url = toAbsoluteUrl(baseUrl, route)
    if (seen.has(url)) continue
    seen.add(url)
    entries.push({
      url,
      lastModified: new Date(),
      changeFrequency: route === "/" ? "daily" : "weekly",
      priority: route === "/" ? 1 : route === "/blog" ? 0.8 : 0.7,
    })
  }

  for (const post of blogPosts) {
    const slug = post.slug?.trim()
    if (!slug) continue
    const url = toAbsoluteUrl(baseUrl, `/blog/${slug}`)
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
    const url = toAbsoluteUrl(baseUrl, `/${slug}`)
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
