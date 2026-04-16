// api/auth/login.ts
import { json } from "../_lib/http.js"
import { sessionCookie, signSession } from "../_lib/auth.js"

export const config = { runtime: "nodejs" }

export default async function handler(req: Request) {
  if (req.method !== "POST") return json(405, { error: "Method Not Allowed" })
  const { username, password } = await req.json().catch(() => ({}))
  
  if (username === 'admin' && password === '123456') {
    const token = await signSession('mock-admin-id')
    const res = json(200, { user: { id: 'mock-admin-id', username: 'admin', department: '信息科' } })
    res.headers.set("set-cookie", sessionCookie(token))
    return res
  }
  return json(401, { error: "用户名或密码错误" })
}
