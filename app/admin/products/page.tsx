import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, Edit } from "lucide-react"
import { DeleteProductButton } from "@/components/admin/delete-product-button"
import { getSession } from "@/lib/auth"
import { withRls } from "@/lib/prisma"
import { findManyProductsCompat } from "@/lib/product-compat"
import { redirect } from "next/navigation"

export default async function ProductsManagementPage() {
  const session = await getSession()
  if (!session) return null

  const adminUser = await withRls(session.userId, (tx) =>
    tx.user.findUnique({ where: { id: session.userId }, select: { role: true } }),
  )
  if (!adminUser || (adminUser.role !== "admin" && adminUser.role !== "super_admin")) {
    redirect("/admin/blog")
  }

  const products = await withRls(session.userId, (tx) =>
    findManyProductsCompat(tx, { orderBy: { displayOrder: "asc" } }),
  )

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground mt-1">Manage product listings</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/section-pages/products">Edit Website Page</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/products/new">
              <Plus className="mr-2 h-4 w-4" />
              New Product
            </Link>
          </Button>
        </div>
      </div>

      {products.length > 0 ? (
        <div className="grid gap-4">
          {products.map((product) => (
            <Card key={product.id} className="border-border">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-semibold">{product.title}</h3>
                      {product.isFeatured ? <Badge variant="outline">Featured</Badge> : null}
                      <Badge variant={product.isActive ? "default" : "secondary"}>
                        {product.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground line-clamp-2">{product.description}</p>
                    {product.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {product.tags.map((tag) => (
                          <Badge key={`${product.id}-${tag}`} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                    <p className="text-sm text-muted-foreground">Display Order: {product.displayOrder}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/products/edit/${product.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <DeleteProductButton productId={product.id} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-border">
          <CardContent className="p-12 text-center">
            <p className="text-lg font-medium mb-2">No products yet</p>
            <p className="text-muted-foreground mb-4">Add your first product to get started</p>
            <Button asChild>
              <Link href="/admin/products/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
