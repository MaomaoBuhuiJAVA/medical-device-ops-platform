import { clearSessionCookie } from "../_lib/auth.js"
import { json } from "../_lib/http.js"

export const config = { runtime: "nodejs" }

export default async function handler(req: Request) {
  try {
    if (req.method !== "POST") return json(405, { error: "Method Not Allowed" })
    const res = json(200, { ok: true })
    res.headers.set("set-cookie", clearSessionCookie())
    return res
  } catch (error) {
    const message = error instanceof Error ? error.message : "退出失败"
    return json(500, { error: message })
  }
}