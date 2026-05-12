"use client"

import { useRef, useState } from "react"
import { UploadCloud } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type ImageUrlUploadFieldProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  folder?: string
}

export function ImageUrlUploadField({
  id,
  label,
  value,
  onChange,
  placeholder = "https://example.com/image.jpg",
  folder = "images",
}: ImageUrlUploadFieldProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const uploadFile = async (file: File | null) => {
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const payload = new FormData()
      payload.append("file", file)
      payload.append("folder", folder)
      const res = await fetch("/api/admin/uploads", { method: "POST", body: payload })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || (!data?.key && !data?.url)) {
        throw new Error(data.error || "Upload failed")
      }
      onChange(data.key || data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      <div className="space-y-1">
        <Label
          htmlFor={`${id}-upload`}
          className="inline-flex cursor-pointer items-center gap-2 text-sm text-primary hover:underline"
        >
          <UploadCloud className="h-4 w-4" />
          Upload image file
        </Label>
        <input
          ref={fileInputRef}
          id={`${id}-upload`}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => uploadFile(e.target.files?.[0] || null)}
        />
        {uploading ? <span className="text-xs text-muted-foreground">Uploading...</span> : null}
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </div>
    </div>
  )
}
