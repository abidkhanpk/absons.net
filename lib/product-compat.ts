import { Prisma } from "@prisma/client"

const PRODUCT_BASE_SELECT_TEMPLATE = {
  id: true,
  title: true,
  description: true,
  icon: true,
  imageUrl: true,
  imageFitMode: true,
  linkUrl: true,
  linkLabel: true,
  isActive: true,
  displayOrder: true,
}

const PRODUCT_OPTIONAL_COLUMN_TO_FIELD = {
  is_featured: "isFeatured",
  tags: "tags",
} as const

type ProductSelectField = keyof typeof PRODUCT_BASE_SELECT_TEMPLATE | (typeof PRODUCT_OPTIONAL_COLUMN_TO_FIELD)[keyof typeof PRODUCT_OPTIONAL_COLUMN_TO_FIELD]

type ProductQueryClient = {
  product: {
    findMany: (args: Record<string, unknown>) => Promise<Array<Record<string, unknown>>>
    findUnique: (args: Record<string, unknown>) => Promise<Record<string, unknown> | null>
  }
  $queryRaw?: <T = unknown>(query: TemplateStringsArray, ...values: unknown[]) => Promise<T>
}

export type ProductCompatRecord = {
  id: string
  title: string
  description: string
  icon: string | null
  imageUrl: string | null
  imageFitMode: string | null
  linkUrl: string | null
  linkLabel: string | null
  isFeatured: boolean
  tags: string[]
  isActive: boolean
  displayOrder: number
}

function isProductTableMissing(error: unknown) {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2021") return false
  const modelName = typeof error.meta?.modelName === "string" ? error.meta.modelName : ""
  if (modelName && modelName !== "Product") return false

  const table = typeof error.meta?.table === "string" ? error.meta.table.toLowerCase() : ""
  if (table.includes("products")) return true

  return /table\s+`[^`]*products`/i.test(error.message)
}

function extractMissingColumn(error: Prisma.PrismaClientKnownRequestError) {
  const metaColumn = typeof error.meta?.column === "string" ? error.meta.column : ""
  if (metaColumn) return metaColumn
  const match = error.message.match(/The column `([^`]+)` does not exist/i)
  return match?.[1] || ""
}

function isMissingColumnError(error: unknown) {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2022") return false
  return Boolean(extractMissingColumn(error))
}

function normalizeProduct(record: Record<string, unknown>): ProductCompatRecord {
  return {
    id: typeof record.id === "string" ? record.id : "",
    title: typeof record.title === "string" ? record.title : "",
    description: typeof record.description === "string" ? record.description : "",
    icon: typeof record.icon === "string" ? record.icon : null,
    imageUrl: typeof record.imageUrl === "string" ? record.imageUrl : null,
    imageFitMode: typeof record.imageFitMode === "string" ? record.imageFitMode : null,
    linkUrl: typeof record.linkUrl === "string" ? record.linkUrl : null,
    linkLabel: typeof record.linkLabel === "string" ? record.linkLabel : null,
    isFeatured: record.isFeatured === true,
    tags: Array.isArray(record.tags) ? record.tags.filter((tag): tag is string => typeof tag === "string") : [],
    isActive: typeof record.isActive === "boolean" ? record.isActive : true,
    displayOrder: typeof record.displayOrder === "number" ? record.displayOrder : 0,
  }
}

async function getProductColumnSet(client: ProductQueryClient): Promise<Set<string> | null> {
  if (typeof client.$queryRaw !== "function") return null

  try {
    const rows = await client.$queryRaw<Array<{ column_name: unknown }>>`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'products'
    `
    return new Set(rows.map((row) => (typeof row.column_name === "string" ? row.column_name.toLowerCase() : "")).filter(Boolean))
  } catch {
    return null
  }
}

function buildSelect(columnSet: Set<string> | null) {
  const select: Partial<Record<ProductSelectField, boolean>> = { ...PRODUCT_BASE_SELECT_TEMPLATE }
  if (!columnSet) return select as Record<string, boolean>

  for (const [column, field] of Object.entries(PRODUCT_OPTIONAL_COLUMN_TO_FIELD)) {
    if (columnSet.has(column)) {
      select[field as ProductSelectField] = true
    }
  }

  return select as Record<string, boolean>
}

export async function findManyProductsCompat(client: ProductQueryClient, args: Record<string, unknown> = {}) {
  const columnSet = await getProductColumnSet(client)
  const select = buildSelect(columnSet)

  try {
    const rows = await client.product.findMany({ ...args, select })
    return rows.map(normalizeProduct)
  } catch (error) {
    if (isProductTableMissing(error)) return []
    if (isMissingColumnError(error)) return []
    throw error
  }
}

export async function findUniqueProductCompat(client: ProductQueryClient, id: string) {
  const columnSet = await getProductColumnSet(client)
  const select = buildSelect(columnSet)

  try {
    const row = await client.product.findUnique({ where: { id }, select })
    return row ? normalizeProduct(row) : null
  } catch (error) {
    if (isProductTableMissing(error)) return null
    if (isMissingColumnError(error)) return null
    throw error
  }
}
