import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, Building2, Calendar } from "lucide-react"
import { DeleteInquiryButton } from "@/components/admin/delete-inquiry-button"

export default async function InquiriesPage() {
  const supabase = await createClient()

  const { data: inquiries } = await supabase
    .from("contact_inquiries")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Contact Inquiries</h1>
        <p className="text-muted-foreground mt-1">Manage and respond to customer inquiries</p>
      </div>

      {/* Inquiries List */}
      {inquiries && inquiries.length > 0 ? (
        <div className="space-y-4">
          {inquiries.map((inquiry) => (
            <Card key={inquiry.id} className="border-border">
              <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">{inquiry.name}</CardTitle>
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        <span>{inquiry.email}</span>
                      </div>
                      {inquiry.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          <span>{inquiry.phone}</span>
                        </div>
                      )}
                      {inquiry.company && (
                        <div className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          <span>{inquiry.company}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={inquiry.status === "deletion_requested" ? "destructive" : inquiry.status === "new" ? "default" : "secondary"}>
                      {inquiry.status === "deletion_requested" ? "Deletion Request" : inquiry.status}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(inquiry.created_at).toLocaleDateString()}</span>
                    </div>
                    <DeleteInquiryButton inquiryId={inquiry.id} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{inquiry.message}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-border">
          <CardContent className="p-12 text-center">
            <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No inquiries yet</p>
            <p className="text-muted-foreground">Contact form submissions will appear here</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
