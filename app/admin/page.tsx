import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Briefcase, GraduationCap, MessageSquare, Mail, TrendingUp } from "lucide-react"
import { getSession } from "@/lib/auth"
import { withRls } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { getSiteSettings } from "@/lib/site-settings"

export default async function AdminDashboard() {
  const session = await getSession()
  if (!session) return null

  const adminUser = await withRls(session.userId, (tx) =>
    tx.user.findUnique({ where: { id: session.userId }, select: { role: true } }),
  )
  if (!adminUser || (adminUser.role !== "admin" && adminUser.role !== "super_admin")) {
    redirect("/admin/blog")
  }

  const [siteSettings, statsData] = await Promise.all([
    getSiteSettings(),
    withRls(session.userId, async (tx) => {
      const [blogs, services, training, testimonials, inquiries, newInquiries, recent] = await Promise.all([
        tx.blogPost.count(),
        tx.service.count(),
        tx.trainingCourse.count(),
        tx.testimonial.count(),
        tx.contactInquiry.count(),
        tx.contactInquiry.count({ where: { status: "new" } }),
        tx.contactInquiry.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
      ])
      return [blogs, services, training, testimonials, inquiries, newInquiries, recent]
    }),
  ])
  const [blogCount, servicesCount, trainingCount, testimonialsCount, inquiriesCount, newInquiriesCount, recentInquiries] =
    statsData
  const siteTitle = siteSettings.siteTitle || "Site"

  const stats = [
    { title: "Blog Posts", value: blogCount || 0, icon: FileText, color: "text-blue-600" },
    { title: "Services", value: servicesCount || 0, icon: Briefcase, color: "text-green-600" },
    { title: "Training Courses", value: trainingCount || 0, icon: GraduationCap, color: "text-purple-600" },
    { title: "Testimonials", value: testimonialsCount || 0, icon: MessageSquare, color: "text-orange-600" },
    { title: "Total Inquiries", value: inquiriesCount || 0, icon: Mail, color: "text-red-600" },
    { title: "New Inquiries", value: newInquiriesCount || 0, icon: TrendingUp, color: "text-emerald-600" },
  ]

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome to the {siteTitle} CMS</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.color}`}>
                    <Icon className="h-8 w-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Inquiries */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Recent Inquiries</CardTitle>
        </CardHeader>
        <CardContent>
          {recentInquiries && recentInquiries.length > 0 ? (
            <div className="space-y-4">
              {recentInquiries.map((inquiry) => (
                <div key={inquiry.id} className="flex items-start justify-between p-4 border border-border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">{inquiry.name}</p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          inquiry.status === "new"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {inquiry.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{inquiry.email}</p>
                    <p className="text-sm mt-2 line-clamp-2">{inquiry.message}</p>
                  </div>
                  <p className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                    {new Date(inquiry.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No inquiries yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
