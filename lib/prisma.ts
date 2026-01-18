import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

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
