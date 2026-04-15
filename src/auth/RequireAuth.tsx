import { ReactElement } from "react"
import { useEffect, useState } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { api } from "@/api/client"

interface MeResult {
  user: { id: string; username: string } | null
}

export function RequireAuth({ children }: { children: ReactElement }) {
  const [loading, setLoading] = useState(true)
  const [authed, setAuthed] = useState(false)
  const location = useLocation()

  useEffect(() => {
    let active = true
    api<MeResult>("/api/auth/me")
      .then((res) => {
        if (!active) return
        setAuthed(Boolean(res.user))
      })
      .catch(() => {
        if (!active) return
        setAuthed(false)
      })
      .finally(() => {
        if (!active) return
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-muted-foreground">正在验证登录状态...</div>
  }

  if (!authed) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}

