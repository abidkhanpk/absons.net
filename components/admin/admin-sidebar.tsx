"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import type { LucideIcon } from "lucide-react"
import {
  LayoutDashboard,
  FileText,
  FileStack,
  Briefcase,
  GraduationCap,
  Package,
  BadgeDollarSign,
  MessageSquare,
  Star,
  Mail,
  LogOut,
  Menu,
  X,
  Users,
  Building2,
  UserCircle,
  Settings,
  BadgeCheck,
} from "lucide-react"
import { useState } from "react"

type HomeSectionNavId = "services" | "products" | "pricing" | "training" | "departments" | "testimonials" | "who-we-serve" | "why-choose"

type SidebarItem = {
  href: string
  label: string
  icon: LucideIcon
  roles: string[]
}

const sectionNavMeta: Record<HomeSectionNavId, SidebarItem> = {
  services: { href: "/admin/services", label: "Services", icon: Briefcase, roles: ["admin", "super_admin"] },
  products: { href: "/admin/products", label: "Products", icon: Package, roles: ["admin", "super_admin"] },
  pricing: { href: "/admin/pricing", label: "Pricing", icon: BadgeDollarSign, roles: ["admin", "super_admin"] },
  training: { href: "/admin/training", label: "Training", icon: GraduationCap, roles: ["admin", "super_admin"] },
  departments: { href: "/admin/departments", label: "Departments", icon: Building2, roles: ["admin", "super_admin"] },
  testimonials: { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquare, roles: ["admin", "super_admin"] },
  "who-we-serve": { href: "/admin/who-we-serve", label: "Who We Serve", icon: Building2, roles: ["admin", "super_admin"] },
  "why-choose": { href: "/admin/why-choose", label: "Why Choose Us", icon: Star, roles: ["super_admin"] },
}

const baseNavBeforeSections: SidebarItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "super_admin"] },
  { href: "/admin/pages", label: "Pages", icon: FileStack, roles: ["editor", "admin", "super_admin"] },
  { href: "/admin/blog", label: "Blog Posts", icon: FileText, roles: ["editor", "admin", "super_admin"] },
]

const baseNavAfterSections: SidebarItem[] = [
  { href: "/admin/inquiries", label: "Inquiries", icon: Mail, roles: ["admin", "super_admin"] },
  { href: "/admin/approvals", label: "Approvals", icon: BadgeCheck, roles: ["admin", "super_admin"] },
  { href: "/admin/settings", label: "Settings", icon: Settings, roles: ["super_admin"] },
  { href: "/admin/users", label: "Users", icon: Users, roles: ["admin", "super_admin"] },
]

const defaultSectionNavOrder: HomeSectionNavId[] = [
  "services",
  "products",
  "pricing",
  "training",
  "departments",
  "testimonials",
  "who-we-serve",
  "why-choose",
]

export function AdminSidebar({
  user,
  pendingApprovals = 0,
  rejectedBlogCount = 0,
  rejectedPageCount = 0,
  siteTitle,
  homeSections = [],
}: {
  user: { id: string; email: string; role: string }
  pendingApprovals?: number
  rejectedBlogCount?: number
  rejectedPageCount?: number
  siteTitle?: string | null
  homeSections?: Array<{ id: HomeSectionNavId; enabled: boolean }>
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const role = user.role

  const orderedSectionNavItems = (() => {
    const configuredOrder = homeSections.map((section) => section.id)
    const fullOrder = [...configuredOrder, ...defaultSectionNavOrder.filter((id) => !configuredOrder.includes(id))]
    return fullOrder.map((id) => sectionNavMeta[id])
  })()
  const navItems = [...baseNavBeforeSections, ...orderedSectionNavItems, ...baseNavAfterSections]

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/auth/login")
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-background border border-border rounded-lg shadow-lg"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transition-transform duration-200`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <Link href="/admin" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
                AS
              </div>
              <div>
                <p className="font-bold text-lg">{siteTitle || "Site"}</p>
                <p className="text-xs text-muted-foreground">Admin CMS</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              if (role && !item.roles.includes(role)) return null
              const showApprovalsBadge = item.href === "/admin/approvals" && pendingApprovals > 0
              const showRejectedBlogBadge = item.href === "/admin/blog" && role === "editor" && rejectedBlogCount > 0
              const showRejectedPageBadge = item.href === "/admin/pages" && role === "editor" && rejectedPageCount > 0
              const badgeCount = showApprovalsBadge
                ? pendingApprovals
                : showRejectedBlogBadge
                  ? rejectedBlogCount
                  : showRejectedPageBadge
                    ? rejectedPageCount
                    : 0
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                  {(showApprovalsBadge || showRejectedBlogBadge || showRejectedPageBadge) && (
                    <span className="ml-auto rounded-full bg-destructive px-2 py-0.5 text-xs font-semibold text-destructive-foreground">
                      {badgeCount}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-border space-y-3">
            <div className="px-4 py-2">
              <p className="text-sm font-medium truncate">{user.email}</p>
              <p className="text-xs text-muted-foreground">{role || "Administrator"}</p>
            </div>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href={`/admin/users/edit/${user.id}`}>
                <UserCircle className="mr-2 h-4 w-4" />
                My Profile
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  )
}
