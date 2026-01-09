import { TrainingForm } from "@/components/admin/training-form"

export default function NewTrainingPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create New Training Course</h1>
        <p className="text-muted-foreground mt-1">Add a new training program</p>
      </div>

      <TrainingForm />
    </div>
  )
}
