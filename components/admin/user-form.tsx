"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface UserFormProps {
  user?: {
    id: string
    email: string
    full_name: string
    role: string
  }
  currentUserRole?: string
  currentUserId?: string
}

export function UserForm({ user, currentUserRole, currentUserId }: UserFormProps) {
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
  const isSelf = isEditing && currentUserId === user?.id
  const canEditRole = !isSelf && (currentUserRole === "super_admin" || currentUserRole === "admin")
  const baseRoleOptions =
    currentUserRole === "super_admin" ? ["super_admin", "admin", "editor"] : currentUserRole === "admin" ? ["editor"] : ["editor"]
  const roleOptions =
    isSelf && user?.role && !baseRoleOptions.includes(user.role) ? [user.role, ...baseRoleOptions] : baseRoleOptions

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (isEditing) {
        const response = await fetch("/api/admin/users", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: user.id,
            fullName: formData.fullName,
            role: canEditRole ? formData.role : undefined,
            password: isSelf && formData.password ? formData.password : undefined,
          }),
        })

        const result = await response.json().catch(() => ({}))
        if (!response.ok) {
          throw new Error(result.error || "Failed to update user")
        }
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
    admin: "Can manage content and users (cannot create admins)",
    editor: "Can create and manage their own blog posts and pages only",
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
        <Select
          value={formData.role}
          onValueChange={(value) => setFormData({ ...formData, role: value })}
          disabled={!canEditRole && isEditing}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            {roleOptions.includes("super_admin") && (
              <SelectItem value="super_admin">
                <div className="flex flex-col items-start">
                  <span className="font-medium">Super Admin</span>
                </div>
              </SelectItem>
            )}
            {roleOptions.includes("admin") && (
              <SelectItem value="admin">
                <div className="flex flex-col items-start">
                  <span className="font-medium">Admin</span>
                </div>
              </SelectItem>
            )}
            {roleOptions.includes("editor") && (
              <SelectItem value="editor">
                <div className="flex flex-col items-start">
                  <span className="font-medium">Editor</span>
                </div>
              </SelectItem>
            )}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          {canEditRole || !isEditing
            ? roleDescriptions[formData.role as keyof typeof roleDescriptions]
            : `Role: ${formData.role}`}
        </p>
      </div>

      {isSelf && (
        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            minLength={6}
            placeholder="Leave blank to keep current password"
          />
          <p className="text-sm text-muted-foreground">Minimum 6 characters. Leave empty to keep your password.</p>
        </div>
      )}

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
