import { Prisma } from "@prisma/client"

const DEPARTMENT_SELECT_TEMPLATE = {
  id: true,
  title: true,
  description: true,
  icon: true,
  imageUrl: true,
  linkUrl: true,
  linkLabel: true,
  isFeatured: true,
  isActive: true,
  displayOrder: true,
}

const DEPARTMENT_COLUMN_TO_FIELD = {
  title: "title",
  description: "description",
  icon: "icon",
  image_url: "imageUrl",
  link_url: "linkUrl",
  link_label: "linkLabel",
  is_featured: "isFeatured",
  is_active: "isActive",
  display_order: "displayOrder",
} as const

type DepartmentSelectField = keyof typeof DEPARTMENT_SELECT_TEMPLATE

type DepartmentQueryClient = {
  department: {
    findMany: (args: Record<string, unknown>) => Promise<Array<Record<string, unknown>>>
    findUnique: (args: Record<string, unknown>) => Promise<Record<string, unknown> | null>
  }
}

export type DepartmentCompatRecord = {
  id: string
  title: string
  description: string
  icon: string | null
  imageUrl: string | null
  linkUrl: string | null
  linkLabel: string | null
  isFeatured: boolean
  isActive: boolean
  displayOrder: number
}

function isDepartmentTableMissing(error: unknown) {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2021") return false
  const modelName = typeof error.meta?.modelName === "string" ? error.meta.modelName : ""
  if (modelName && modelName !== "Department") return false

  const table = typeof error.meta?.table === "string" ? error.meta.table.toLowerCase() : ""
  if (table.includes("departments")) return true

  return /table\s+`[^`]*departments`/i.test(error.message)
}

function extractColumnFromError(error: Prisma.PrismaClientKnownRequestError) {
  const metaColumn = typeof error.meta?.column === "string" ? error.meta.column : ""
  if (metaColumn) return metaColumn
  const match = error.message.match(/The column `([^`]+)` does not exist/i)
  return match?.[1] || ""
}

function resolveMissingField(error: unknown): DepartmentSelectField | null {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2022") return null
  const column = extractColumnFromError(error)
  if (!column) return null
  const normalizedColumn = column.split(".").pop()?.toLowerCase() || ""
  const mapped = DEPARTMENT_COLUMN_TO_FIELD[normalizedColumn as keyof typeof DEPARTMENT_COLUMN_TO_FIELD]
  return mapped ?? null
}

function normalizeDepartment(record: Record<string, unknown>): DepartmentCompatRecord {
  return {
    id: typeof record.id === "string" ? record.id : "",
    title: typeof record.title === "string" ? record.title : "",
    description: typeof record.description === "string" ? record.description : "",
    icon: typeof record.icon === "string" ? record.icon : null,
    imageUrl: typeof record.imageUrl === "string" ? record.imageUrl : null,
    linkUrl: typeof record.linkUrl === "string" ? record.linkUrl : null,
    linkLabel: typeof record.linkLabel === "string" ? record.linkLabel : null,
    isFeatured: record.isFeatured === true,
    isActive: typeof record.isActive === "boolean" ? record.isActive : true,
    displayOrder: typeof record.displayOrder === "number" ? record.displayOrder : 0,
  }
}

async function runWithSelectFallback<T>(
  run: (select: Record<string, boolean>) => Promise<T>,
  missingTableFallback: T,
): Promise<T> {
  const select: Record<string, boolean> = { ...DEPARTMENT_SELECT_TEMPLATE }
  const removed = new Set<DepartmentSelectField>()

  while (true) {
    try {
      return await run(select)
    } catch (error) {
      if (isDepartmentTableMissing(error)) return missingTableFallback

      const missingField = resolveMissingField(error)
      if (!missingField || removed.has(missingField) || !select[missingField]) {
        throw error
      }
      delete select[missingField]
      removed.add(missingField)
    }
  }
}

export async function findManyDepartmentsCompat(client: DepartmentQueryClient, args: Record<string, unknown> = {}) {
  const rows = await runWithSelectFallback((select) => client.department.findMany({ ...args, select }), [] as Array<Record<string, unknown>>)
  return rows.map(normalizeDepartment)
}

export async function findUniqueDepartmentCompat(client: DepartmentQueryClient, id: string) {
  const row = await runWithSelectFallback((select) => client.department.findUnique({ where: { id }, select }), null)
  return row ? normalizeDepartment(row) : null
}

