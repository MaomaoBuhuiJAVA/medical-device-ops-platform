import bcrypt from "bcryptjs"
import { prisma } from "../_lib/prisma.js"
import { json } from "../_lib/http.js"
import { sessionCookie, signSession } from "../_lib/auth.js"

export const config = { runtime: "nodejs" }

export default async function handler(req: Request) {
  try {
    if (req.method !== "POST") return json(405, { error: "Method Not Allowed" })

    const { username, password } = (await req.json().catch(() => ({}))) as {
      username?: string
      password?: string
    }

    if (!username || !password) return json(400, { error: "缺少用户名或密码" })

    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true, username: true, department: true, passwordHash: true },
    })
    if (!user) return json(401, { error: "用户名或密码错误" })

    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) return json(401, { error: "用户名或密码错误" })

    const token = await signSession(user.id)
    const res = json(200, { user: { id: user.id, username: user.username, department: user.department } })
    res.headers.set("set-cookie", sessionCookie(token))
    return res
  } catch (error) {
    const message = error instanceof Error ? error.message : "登录失败"
    return json(500, { error: message })
  }
}