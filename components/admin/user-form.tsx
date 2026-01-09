"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"

interface UserFormProps {
  user?: {
    id: string
    email: string
    full_name: string
    role: string
  }
  currentUserRole?: string
}

export function UserForm({ user, currentUserRole }: UserFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: user?.email || "",
    password: "",
    fullName: user?.full_name || "",
    role: user?.role || "editor",
  })

  const isEditing = !!user

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (isEditing) {
        const supabase = createClient()

        // Update existing user
        const { error: updateError } = await supabase
          .from("users")
          .update({
            full_name: formData.fullName,
            role: formData.role,
          })
          .eq("id", user.id)

        if (updateError) throw updateError
      } else {
        const response = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            fullName: formData.fullName,
            role: formData.role,
          }),
        })

        const result = await response.json().catch(() => ({}))
        if (!response.ok) {
          throw new Error(result.error || "Failed to create user")
        }
      }

      router.push("/admin/users")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${isEditing ? "update" : "create"} user`)
    } finally {
      setIsLoading(false)
    }
  }

  // Role descriptions
  const roleDescriptions = {
    super_admin: "Full system access, can manage all users and settings",
    admin: "Can manage content and users (except Super Admins)",
    editor: "Can manage content only (blog, services, etc.)",
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          disabled={isEditing}
        />
        {isEditing && <p className="text-sm text-muted-foreground">Email cannot be changed</p>}
      </div>

      {!isEditing && (
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            minLength={6}
          />
          <p className="text-sm text-muted-foreground">Must be at least 6 characters</p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            {currentUserRole === "super_admin" && (
              <SelectItem value="super_admin">
                <div className="flex flex-col items-start">
                  <span className="font-medium">Super Admin</span>
                </div>
              </SelectItem>
            )}
            <SelectItem value="admin">
              <div className="flex flex-col items-start">
                <span className="font-medium">Admin</span>
              </div>
            </SelectItem>
            <SelectItem value="editor">
              <div className="flex flex-col items-start">
                <span className="font-medium">Editor</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          {roleDescriptions[formData.role as keyof typeof roleDescriptions]}
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (isEditing ? "Updating..." : "Creating...") : isEditing ? "Update User" : "Create User"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
