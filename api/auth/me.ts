import { getUserFromRequest, getUserPermissions } from "../_lib/auth.js"

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method Not Allowed" })

  const user = await getUserFromRequest(req)
  if (!user) return res.status(200).json({ user: null })
  
  const { roles, permissions } = await getUserPermissions(user.id)
  return res.status(200).json({ user, roles, permissions })
}
