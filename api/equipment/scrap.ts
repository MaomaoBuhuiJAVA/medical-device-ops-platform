import { json } from "../_lib/http"
import { prisma } from "../_lib/prisma"
import { requirePermission } from "../_lib/auth"

export const config = { runtime: "nodejs" }

export default async function handler(req: Request) {
  if (req.method !== "POST") return json(405, { error: "Method Not Allowed" })
  await requirePermission(req, "equipment:scrap")

  const { id } = (await req.json().catch(() => ({}))) as { id?: string }
  if (!id) return json(400, { error: "缺少设备 id" })

  await prisma.equipment.update({ where: { id }, data: { status: "SCRAPPED" as any } })
  return json(200, { ok: true })
}

