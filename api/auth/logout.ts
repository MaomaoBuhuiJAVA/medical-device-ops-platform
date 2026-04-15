import { clearSessionCookie } from "../_lib/auth"
import { json } from "../_lib/http"

export const config = { runtime: "nodejs" }

export default async function handler(req: Request) {
  if (req.method !== "POST") return json(405, { error: "Method Not Allowed" })
  const res = json(200, { ok: true })
  res.headers.set("set-cookie", clearSessionCookie())
  return res
}

