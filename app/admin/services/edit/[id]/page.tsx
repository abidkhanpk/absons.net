import { ServiceForm } from "@/components/admin/service-form"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: service } = await supabase.from("services").select("*").eq("id", id).single()

  if (!service) {
    notFound()
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Service</h1>
        <p className="text-muted-foreground mt-1">Update service information</p>
      </div>

      <ServiceForm service={service} />
    </div>
  )
}
