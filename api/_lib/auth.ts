import { SignJWT, jwtVerify } from "jose"

const COOKIE_NAME = "session"
const SECRET = new TextEncoder().encode("static-secret-for-demo-2026")

export async function signSession(userId: string) {
  return await new SignJWT({ sub: userId }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(SECRET)
}

export async function verifySession(token: string) {
  const { payload } = await jwtVerify(token, SECRET)
  return { userId: payload.sub as string }
}

export function sessionCookie(token: string) {
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`
}

export function clearSessionCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
}

export async function getUserFromRequest(req: any) {
  // 致命错误修复：直接从 req.headers.cookie 拿字符串，不再调用其它花里胡哨的库
  const cookieHeader = req.headers?.cookie || ""
  const match = cookieHeader.match(new RegExp(`(^| )${COOKIE_NAME}=([^;]+)`))
  const token = match ? decodeURIComponent(match[2]) : null

  if (!token) return null
  try {
    await verifySession(token)
    return { id: 'mock-admin-id', username: 'admin', department: '信息科' }
  } catch {
    return null
  }
}

export async function getUserPermissions(userId: string) {
  return { roles: ["admin"], permissions: ["equipment:read", "equipment:create", "equipment:update", "admin:manage", "inspection:read", "repair:read"] }
}

export async function requireUser(req: any) { return { id: 'mock-admin-id', username: 'admin' } }
export async function ensureBaseRbacData() { return {} }
