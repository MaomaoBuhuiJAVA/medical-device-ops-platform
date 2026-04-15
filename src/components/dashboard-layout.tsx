import { Outlet } from "react-router-dom"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-64">
        <Header />
        <main className="p-6">
          <div className="apple-glass smooth-hover rounded-2xl p-4 md:p-6">
          <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
