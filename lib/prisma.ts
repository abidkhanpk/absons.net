import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export class DatabaseConnectionError extends Error {
  constructor(message = "Database connection problem. Please retry after some time.") {
    super(message)
    this.name = "DatabaseConnectionError"
  }
}

export function isDatabaseConnectionError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false
  const maybeCode = (err as { code?: unknown }).code
  const code = typeof maybeCode === "string" ? maybeCode : ""
  if (code === "P1001" || code === "P1002" || code === "P1017") return true
  const message = err instanceof Error ? err.message : ""
  return message.includes("Can't reach database server") || message.includes("Database")
}

export async function withRls<T>(userId: string | null, fn: (tx: PrismaClient) => Promise<T>) {
  const run = () =>
    prisma.$transaction(
      async (tx) => {
        await tx.$executeRaw`SELECT set_config('request.jwt.claim.sub', ${userId ?? ""}, true)`
        return fn(tx)
      },
      {
        timeout: 10000,
        maxWait: 5000,
      },
    )

  try {
    return await run()
  } catch (err: unknown) {
    // Retry once on transaction errors (e.g., pooler churn)
    if (err instanceof Error && "code" in err && (err as any).code === "P2028") {
      return run()
    }
    throw err
  }
}
