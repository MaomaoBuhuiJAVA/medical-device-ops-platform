import bcrypt from "bcryptjs"
import { json } from "../_lib/http"
import { prisma } from "../_lib/prisma"
import { requireUser } from "../_lib/auth"

export const config = { runtime: "nodejs" }

export default async function handler(req: Request) {
  try {
    if (req.method !== "POST") return json(405, { error: "Method Not Allowed" })

    const user = await requireUser(req)
    const { oldPassword, newPassword } = (await req.json().catch(() => ({}))) as {
      oldPassword?: string
      newPassword?: string
    }

    if (!oldPassword || !newPassword) {
      return json(400, { error: "请填写旧密码和新密码" })
    }
    if (newPassword.length < 6) {
      return json(400, { error: "新密码至少 6 位" })
    }

    const userRow = await prisma.user.findUnique({
      where: { id: user.id },
      select: { passwordHash: true },
    })
    if (!userRow) return json(404, { error: "用户不存在" })

    const ok = await bcrypt.compare(oldPassword, userRow.passwordHash)
    if (!ok) return json(400, { error: "旧密码不正确" })

    const passwordHash = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } })

    return json(200, { ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "修改密码失败"
    return json(500, { error: message })
  }
}

