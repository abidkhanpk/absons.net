import { TrainingForm } from "@/components/admin/training-form"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

export default async function EditTrainingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: course } = await supabase.from("training_courses").select("*").eq("id", id).single()

  if (!course) {
    notFound()
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Training Course</h1>
        <p className="text-muted-foreground mt-1">Update course information</p>
      </div>

      <TrainingForm course={course} />
    </div>
  )
}
