import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, Edit, Clock, TrendingUp } from "lucide-react"
import { DeleteTrainingButton } from "@/components/admin/delete-training-button"
import { getSession } from "@/lib/auth"
import { withRls } from "@/lib/prisma"
import { redirect } from "next/navigation"

export default async function TrainingManagementPage() {
  const session = await getSession()
  if (!session) return null

  const adminUser = await withRls(session.userId, (tx) =>
    tx.user.findUnique({ where: { id: session.userId }, select: { role: true } }),
  )
  if (!adminUser || (adminUser.role !== "admin" && adminUser.role !== "super_admin")) {
    redirect("/admin/blog")
  }

  const courses = await withRls(session.userId, (tx) =>
    tx.trainingCourse.findMany({ orderBy: { displayOrder: "asc" } }),
  )

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Training Courses</h1>
          <p className="text-muted-foreground mt-1">Manage training programs and courses</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/section-pages/training">Edit Website Page</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/training/new">
              <Plus className="mr-2 h-4 w-4" />
              New Course
            </Link>
          </Button>
        </div>
      </div>

      {/* Courses List */}
      {courses && courses.length > 0 ? (
        <div className="grid gap-4">
          {courses.map((course) => (
            <Card key={course.id} className="border-border">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-semibold">{course.title}</h3>
                      <Badge variant={course.isActive ? "default" : "secondary"}>
                        {course.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline">{course.level}</Badge>
                    </div>
                    <p className="text-muted-foreground line-clamp-2">{course.description}</p>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        <span>Order: {course.displayOrder}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/training/edit/${course.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <DeleteTrainingButton courseId={course.id} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-border">
          <CardContent className="p-12 text-center">
            <p className="text-lg font-medium mb-2">No courses yet</p>
            <p className="text-muted-foreground mb-4">Add your first training course</p>
            <Button asChild>
              <Link href="/admin/training/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Course
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
