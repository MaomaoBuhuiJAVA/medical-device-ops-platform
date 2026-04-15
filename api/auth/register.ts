import bcrypt from "bcryptjs"
import { prisma } from "../_lib/prisma.js"
import { json } from "../_lib/http.js"
import { ensureBaseRbacData, sessionCookie, signSession } from "../_lib/auth.js"

export const config = { runtime: "nodejs" }

export default async function handler(req: Request) {
  try {
    if (req.method !== "POST") return json(405, { error: "Method Not Allowed" })

    const { username, password, department, role } = (await req.json().catch(() => ({}))) as {
      username?: string
      password?: string
      department?: string
      role?: "admin" | "engineer" | "manager"
    }

    if (!username || !password) return json(400, { error: "缺少用户名或密码" })

    await ensureBaseRbacData()

    const userCount = await prisma.user.count()
    const targetRoleName: "admin" | "engineer" | "manager" =
      userCount === 0 ? "admin" : role ?? "engineer"

    const exists = await prisma.user.findUnique({ where: { username } })
    if (exists) return json(409, { error: "用户名已存在" })

    const passwordHash = await bcrypt.hash(password, 10)
    const created = await prisma.user.create({
      data: {
        username,
        passwordHash,
        department: department || null,
      },
      select: { id: true, username: true, department: true },
    })

    const roleRow = await prisma.role.findUnique({ where: { name: targetRoleName } })
    if (!roleRow) return json(500, { error: "角色初始化失败" })

    await prisma.userRole.create({ data: { userId: created.id, roleId: roleRow.id } })

    const token = await signSession(created.id)
    const res = json(200, { user: created, role: targetRoleName })
    res.headers.set("set-cookie", sessionCookie(token))
    return res
  } catch (error) {
    const message = error instanceof Error ? error.message : "注册失败"
    return json(500, { error: message })
  }
}