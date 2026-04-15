import { json } from "../_lib/http.js"
import { prisma } from "../_lib/prisma.js"
import { requirePermission } from "../_lib/auth.js"

export const config = { runtime: "nodejs" }

function mapStatusToDb(status: string) {
  if (status === "在用") return "IN_USE"
  if (status === "维修中") return "IN_REPAIR"
  if (status === "停用") return "DISABLED"
  if (status === "已报废") return "SCRAPPED"
  return "IN_USE"
}

function mapRiskToDb(risk: string) {
  if (risk === "高") return "HIGH"
  if (risk === "中") return "MEDIUM"
  if (risk === "低") return "LOW"
  return "MEDIUM"
}

export default async function handler(req: Request) {
  try {
    const url = new URL(req.url)
    const parts = url.pathname.split("/")
    const id = parts[parts.length - 1]
    if (!id) return json(400, { error: "Missing id" })

    if (req.method === "PUT") {
      await requirePermission(req, "equipment:update")
      const body = (await req.json().catch(() => ({}))) as {
        code?: string
        name?: string
        brand?: string
        model?: string
        department?: string
        risk?: string
        status?: string
      }
      await prisma.equipment.update({
        where: { id },
        data: {
          code: body.code,
          name: body.name,
          brand: body.brand ?? null,
          model: body.model ?? null,
          department: body.department,
          risk: body.risk ? (mapRiskToDb(body.risk) as any) : undefined,
          status: body.status ? (mapStatusToDb(body.status) as any) : undefined,
        },
      })
      return json(200, { ok: true })
    }

    if (req.method === "POST") {
      return json(400, { error: "Unsupported action" })
    }

    return json(405, { error: "Method Not Allowed" })
  } catch (error) {
    const message = error instanceof Error ? error.message : "设备更新失败"
    return json(500, { error: message })
  }
}