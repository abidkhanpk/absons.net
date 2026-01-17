import { PageForm } from "@/components/admin/page-form"

export default function NewPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Page</h1>
        <p className="text-muted-foreground mt-1">Add a new page to the website</p>
      </div>
      <PageForm />
    </div>
  )
}
