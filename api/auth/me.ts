// api/auth/me.ts
import { json } from "../_lib/http.js"
import { getUserFromRequest, getUserPermissions } from "../_lib/auth.js"

export const config = { runtime: "nodejs" }

export default async function handler(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return json(200, { user: null })
  const { roles, permissions } = await getUserPermissions(user.id)
  return json(200, { user, roles, permissions })
}
