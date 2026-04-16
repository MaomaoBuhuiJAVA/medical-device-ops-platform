// api/_lib/auth.ts
import { SignJWT, jwtVerify } from "jose"
import { parseCookies } from "./http.js"

const COOKIE_NAME = "session"
const SECRET = new TextEncoder().encode("dev-local-jwt-secret-static-version")

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

export async function getUserFromRequest(req: Request) {
  const cookies = parseCookies(req)
  if (!cookies[COOKIE_NAME]) return null
  // 只要有 Cookie 就认为是管理员，不查库
  return { id: 'mock-admin-id', username: 'admin', department: '信息科' }
}

export async function getUserPermissions(userId: string) {
  return { 
    roles: ["admin"], 
    permissions: ["equipment:read", "equipment:create", "equipment:update", "admin:manage", "inspection:read", "repair:read"] 
  }
}

export async function ensureBaseRbacData() { return {} }
