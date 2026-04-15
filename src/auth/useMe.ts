import { useEffect, useMemo, useState } from "react"
import { api } from "@/api/client"

export type MeResponse = {
  user: { id: string; username: string; department: string | null } | null
  roles?: string[]
  permissions?: string[]
}

export function useMe() {
  const [me, setMe] = useState<MeResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    setLoading(true)
    try {
      const data = await api<MeResponse>("/api/auth/me")
      setMe(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const permissions = useMemo(() => {
    if (!me || me.user === null) return []
    return me.permissions ?? []
  }, [me])

  const has = (permissionKey: string) => permissions.includes(permissionKey)

  return { me, loading, refresh, has }
}

