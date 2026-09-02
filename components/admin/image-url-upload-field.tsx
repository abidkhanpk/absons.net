"use client"

import { useRef, useState } from "react"
import { UploadCloud } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type ImageUrlUploadFieldProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  folder?: string
  fitMode?: string
  onFitModeChange?: (value: string) => void
  showFitMode?: boolean
}

export function ImageUrlUploadField({
  id,
  label,
  value,
  onChange,
  placeholder = "https://example.com/image.jpg",
  folder = "images",
  fitMode,
  onFitModeChange,
  showFitMode = true,
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
      {showFitMode && onFitModeChange && (
        <div className="space-y-1">
          <Label htmlFor={`${id}-fit-mode`} className="text-xs text-muted-foreground font-normal">
            Image Fit Mode
          </Label>
          <Select value={fitMode || "cover"} onValueChange={onFitModeChange}>
            <SelectTrigger id={`${id}-fit-mode`} className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cover">Cover (fill &amp; crop)</SelectItem>
              <SelectItem value="contain">Contain (fit entirely)</SelectItem>
              <SelectItem value="fill">Fill (stretch)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}
