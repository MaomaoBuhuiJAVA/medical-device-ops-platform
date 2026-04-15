import { json } from "../_lib/http"
import { getUserFromRequest, getUserPermissions } from "../_lib/auth"

export const config = { runtime: "nodejs" }

export default async function handler(req: Request) {
  try {
    if (req.method !== "GET") return json(405, { error: "Method Not Allowed" })
    const user = await getUserFromRequest(req)
    if (!user) return json(200, { user: null })
    const { roles, permissions } = await getUserPermissions(user.id)
    return json(200, { user, roles, permissions })
  } catch (error) {
    const message = error instanceof Error ? error.message : "获取用户信息失败"
    return json(500, { error: message })
  }
}

