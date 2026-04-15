import { json } from "../_lib/http"
import { prisma } from "../_lib/prisma"
import { requirePermission } from "../_lib/auth"

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

function mapStatusFromDb(status: string) {
  if (status === "IN_USE") return "在用"
  if (status === "IN_REPAIR") return "维修中"
  if (status === "DISABLED") return "停用"
  if (status === "SCRAPPED") return "已报废"
  return "在用"
}

function mapRiskFromDb(risk: string) {
  if (risk === "HIGH") return "高"
  if (risk === "MEDIUM") return "中"
  if (risk === "LOW") return "低"
  return "中"
}

export default async function handler(req: Request) {
  if (req.method === "GET") {
    await requirePermission(req, "equipment:read")
    const list = await prisma.equipment.findMany({ orderBy: { updatedAt: "desc" } })
    return json(
      200,
      list.map((e) => ({
        id: e.id,
        code: e.code,
        name: e.name,
        brand: e.brand ?? "",
        model: e.model ?? "",
        department: e.department,
        status: mapStatusFromDb(e.status),
        risk: mapRiskFromDb(e.risk),
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
      }))
    )
  }

  if (req.method === "POST") {
    await requirePermission(req, "equipment:create")
    const body = (await req.json().catch(() => ({}))) as {
      code?: string
      name?: string
      brand?: string
      model?: string
      department?: string
      risk?: string
      status?: string
    }
    if (!body.code || !body.name || !body.department || !body.risk) {
      return json(400, { error: "缺少必填字段" })
    }
    const created = await prisma.equipment.create({
      data: {
        code: body.code,
        name: body.name,
        brand: body.brand || null,
        model: body.model || null,
        department: body.department,
        risk: mapRiskToDb(body.risk) as any,
        status: mapStatusToDb(body.status || "在用") as any,
      },
    })
    return json(200, { id: created.id })
  }

  return json(405, { error: "Method Not Allowed" })
}

