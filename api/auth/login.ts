import { sessionCookie, signSession } from "../_lib/auth.js"

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" })

  // 致命错误修复：Vercel Node 自动解析了请求，直接从 req.body 拿！
  const { username, password } = req.body || {}
  
  if (username === 'admin' && password === '123456') {
    const token = await signSession('mock-admin-id')
    res.setHeader("Set-Cookie", sessionCookie(token))
    return res.status(200).json({ user: { id: 'mock-admin-id', username: 'admin', department: '信息科' } })
  }
  return res.status(401).json({ error: "用户名或密码错误" })
}
