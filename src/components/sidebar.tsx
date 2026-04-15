import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Server,
  ClipboardCheck,
  Wrench,
  Trash2,
  Stethoscope,
  User,
} from "lucide-react"

const navItems = [
  { href: "/", label: "首页看板", icon: LayoutDashboard },
  { href: "/equipment", label: "设备台账", icon: Server },
  { href: "/inspection", label: "巡检管理", icon: ClipboardCheck },
  { href: "/repair", label: "报修处理", icon: Wrench },
  { href: "/scrap", label: "资产报废", icon: Trash2 },
]

export function Sidebar() {
  const { pathname } = useLocation()

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
          <Stethoscope className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-sidebar-foreground">医疗设备运维系统</span>
          <span className="text-xs text-sidebar-foreground/60">Equipment Management</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sidebar-accent">
            <User className="h-5 w-5 text-sidebar-accent-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-sidebar-foreground">管理员</span>
            <span className="text-xs text-sidebar-foreground/60">医工处</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
