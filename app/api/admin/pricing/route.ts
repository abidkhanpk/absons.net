import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { withRls, prisma } from "@/lib/prisma"

async function requireAdmin() {
  const session = await getSession()
  if (!session) return { session: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!user?.isActive || (user.role !== "admin" && user.role !== "super_admin")) {
    return { session, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) }
  }
  return { session, error: null }
}

function parseFeatures(raw: unknown): string[] {
  if (!raw || typeof raw !== "string") return []
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
}

export async function POST(request: Request) {
  const { session, error } = await requireAdmin()
  if (error) return error

  try {
    const body = await request.json()
    const { name, price, period, features, is_active, display_order } = body
    if (!name || !price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await withRls(session!.userId, (tx) =>
      tx.pricingPlan.create({
        data: {
          name,
          price,
          period,
          features: parseFeatures(features),
          isActive: is_active ?? true,
          displayOrder: Number(display_order) || 0,
        },
      }),
    )
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Create pricing error:", err)
    return NextResponse.json({ error: "Failed to create pricing plan" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const { session, error } = await requireAdmin()
  if (error) return error

  try {
    const body = await request.json()
    const { id, name, price, period, features, is_active, display_order } = body
    if (!id) return NextResponse.json({ error: "Plan id is required" }, { status: 400 })

    await withRls(session!.userId, (tx) =>
      tx.pricingPlan.update({
        where: { id },
        data: {
          name,
          price,
          period,
          features: parseFeatures(features),
          isActive: is_active ?? true,
          displayOrder: Number(display_order) || 0,
        },
      }),
    )
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Update pricing error:", err)
    return NextResponse.json({ error: "Failed to update pricing plan" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const { session, error } = await requireAdmin()
  if (error) return error

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "Plan id is required" }, { status: 400 })

    await withRls(session!.userId, (tx) => tx.pricingPlan.delete({ where: { id } }))
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Delete pricing error:", err)
    return NextResponse.json({ error: "Failed to delete pricing plan" }, { status: 500 })
  }
}
