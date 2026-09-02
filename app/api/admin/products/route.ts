import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { getSession } from "@/lib/auth"
import { withRls, prisma } from "@/lib/prisma"
import { normalizeAssetDbValue } from "@/lib/asset-key"

async function requireAdmin() {
  const session = await getSession()
  if (!session) return { session: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!user?.isActive || (user.role !== "admin" && user.role !== "super_admin")) {
    return { session, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) }
  }
  return { session, error: null }
}

const PRODUCT_OPTIONAL_COLUMN_TO_DATA_KEY = {
  is_featured: "isFeatured",
  tags: "tags",
  image_url: "imageUrl",
  link_url: "linkUrl",
  link_label: "linkLabel",
} as const

type ProductOptionalDataKey = (typeof PRODUCT_OPTIONAL_COLUMN_TO_DATA_KEY)[keyof typeof PRODUCT_OPTIONAL_COLUMN_TO_DATA_KEY]

function getProductOptionalFieldFromError(error: unknown): ProductOptionalDataKey | null {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2022") return null

  const metaColumn = typeof error.meta?.column === "string" ? error.meta.column : ""
  const messageColumnMatch = error.message.match(/The column `([^`]+)` does not exist/i)
  const column = (metaColumn || messageColumnMatch?.[1] || "").split(".").pop()?.toLowerCase() || ""
  return PRODUCT_OPTIONAL_COLUMN_TO_DATA_KEY[column as keyof typeof PRODUCT_OPTIONAL_COLUMN_TO_DATA_KEY] ?? null
}

async function createProductCompat(userId: string, initialData: Record<string, unknown>) {
  let data = { ...initialData }
  const removed = new Set<ProductOptionalDataKey>()

  while (true) {
    try {
      await withRls(userId, (tx) =>
        tx.product.create({
          data: data as Prisma.ProductCreateInput,
          select: { id: true },
        }),
      )
      return
    } catch (error) {
      const missingField = getProductOptionalFieldFromError(error)
      if (!missingField || removed.has(missingField) || !(missingField in data)) {
        throw error
      }
      removed.add(missingField)
      const next = { ...data }
      delete next[missingField]
      data = next
    }
  }
}

async function updateProductCompat(userId: string, id: string, initialData: Record<string, unknown>) {
  let data = { ...initialData }
  const removed = new Set<ProductOptionalDataKey>()

  while (true) {
    try {
      await withRls(userId, (tx) =>
        tx.product.update({
          where: { id },
          data: data as Prisma.ProductUpdateInput,
          select: { id: true },
        }),
      )
      return
    } catch (error) {
      const missingField = getProductOptionalFieldFromError(error)
      if (!missingField || removed.has(missingField) || !(missingField in data)) {
        throw error
      }
      removed.add(missingField)
      const next = { ...data }
      delete next[missingField]
      data = next
    }
  }
}

export async function POST(request: Request) {
  const { session, error } = await requireAdmin()
  if (error) return error

  try {
    const body = await request.json()
    const { title, description, icon, image_url, image_fit_mode, link_url, link_label, is_featured, tags, is_active, display_order } = body
    const normalizedImageUrl = normalizeAssetDbValue(image_url)
    const normalizedTags = Array.isArray(tags)
      ? tags
          .map((tag: unknown) => String(tag || "").trim())
          .filter((tag: string) => tag.length > 0)
      : typeof tags === "string"
        ? tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0)
        : []

    if (!title || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await createProductCompat(session!.userId, {
      title,
      description,
      icon,
      imageUrl: typeof normalizedImageUrl === "string" && normalizedImageUrl ? normalizedImageUrl : null,
      linkUrl: link_url || null,
      linkLabel: link_label || null,
      isFeatured: is_featured ?? false,
      tags: Array.from(new Set(normalizedTags)),
      isActive: is_active ?? true,
      imageFitMode: image_fit_mode || "cover",
      displayOrder: Number(display_order) || 0,
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Create product error:", err)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const { session, error } = await requireAdmin()
  if (error) return error

  try {
    const body = await request.json()
    const { id, title, description, icon, image_url, image_fit_mode, link_url, link_label, is_featured, tags, is_active, display_order } = body
    const normalizedImageUrl = normalizeAssetDbValue(image_url)
    const normalizedTags = Array.isArray(tags)
      ? tags
          .map((tag: unknown) => String(tag || "").trim())
          .filter((tag: string) => tag.length > 0)
      : typeof tags === "string"
        ? tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0)
        : []

    if (!id) return NextResponse.json({ error: "Product id is required" }, { status: 400 })

    await updateProductCompat(session!.userId, id, {
      title,
      description,
      icon,
      imageUrl: typeof normalizedImageUrl === "string" && normalizedImageUrl ? normalizedImageUrl : null,
      linkUrl: link_url || null,
      linkLabel: link_label || null,
      isFeatured: is_featured ?? false,
      tags: Array.from(new Set(normalizedTags)),
      isActive: is_active ?? true,
      imageFitMode: image_fit_mode || "cover",
      displayOrder: Number(display_order) || 0,
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Update product error:", err)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const { session, error } = await requireAdmin()
  if (error) return error

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "Product id is required" }, { status: 400 })

    await withRls(session!.userId, (tx) => tx.product.delete({ where: { id } }))
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Delete product error:", err)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
