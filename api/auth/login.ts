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

    // 极速模式：只要账号密码是这个，立刻放行
    if (username !== 'admin' || password !== '123456') {
      return json(401, { error: "用户名或密码错误" })
    }

    const token = await signSession('mock-admin-id')
    const res = json(200, { user: { id: 'mock-admin-id', username: 'admin', department: '信息科' } })
    res.headers.set("set-cookie", sessionCookie(token))
    return res
  } catch (error) {
    const message = error instanceof Error ? error.message : "登录失败"
    return json(500, { error: message })
  }
}
