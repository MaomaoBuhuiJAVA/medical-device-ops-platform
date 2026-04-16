// api/equipment/index.ts
import { json } from "../_lib/http.js"
import { prisma } from "../_lib/prisma.js"
import { requireUser } from "../_lib/auth.js"

export const config = { runtime: "nodejs" }

export default async function handler(req: Request) {
  try {
    await requireUser(req)
    const data = await prisma.equipment.findMany()
    return json(200, data)
  } catch (e) {
    return json(401, { error: "未授权" })
  }
}
