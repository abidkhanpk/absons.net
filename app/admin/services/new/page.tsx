import { ServiceForm } from "@/components/admin/service-form"

export default function NewServicePage() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create New Service</h1>
        <p className="text-muted-foreground mt-1">Add a new service offering</p>
      </div>

      <ServiceForm />
    </div>
  )
}
