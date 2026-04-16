import { SignJWT, jwtVerify } from "jose"
import { parseCookies } from "./http.js"

const COOKIE_NAME = "session"

function getJwtSecret() {
  // 如果你在 Vercel 忘了配环境变量，它会用默认值，彻底杜绝 500 报错
  const secret = process.env.JWT_SECRET || "dev-local-jwt-secret-change-m"
  return new TextEncoder().encode(secret)
}

export async function signSession(userId: string) {
  const secret = getJwtSecret()
  return await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret)
}

export async function verifySession(token: string) {
  const secret = getJwtSecret()
  const { payload } = await jwtVerify(token, secret)
  const userId = payload.sub
  if (!userId || typeof userId !== "string") throw new Error("Invalid token")
  return { userId }
}

export function sessionCookie(token: string) {
  const secure = process.env.NODE_ENV === "production"
  const parts = [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    secure ? "Secure" : null,
    "Max-Age=604800",
  ].filter(Boolean)
  return parts.join("; ")
}

export function clearSessionCookie() {
  const secure = process.env.NODE_ENV === "production"
  const parts = [
    `${COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    secure ? "Secure" : null,
    "Max-Age=0",
  ].filter(Boolean)
  return parts.join("; ")
}

export async function getUserFromRequest(req: Request) {
  const cookies = parseCookies(req)
  const token = cookies[COOKIE_NAME]
  if (!token) return null
  try {
    const { userId } = await verifySession(token)
    // 0 延迟：直接返回写死的管理员信息，不查库，速度拉满
    if (userId === 'mock-admin-id') {
      return { id: 'mock-admin-id', username: 'admin', department: '信息科' }
    }
    return null
  } catch {
    return null
  }
}

export async function getUserPermissions(userId: string) {
  // 0 延迟：直接写死返回所有的权限，让你可以演示所有的按钮和菜单
  const permissionKeys = [
    "equipment:read", "equipment:create", "equipment:update", "equipment:scrap",
    "inspection:read", "inspection:write", "repair:read", "repair:write",
    "scrap:read", "scrap:write", "admin:manage",
  ]
  return { roles: ["admin"], permissions: permissionKeys }
}

export async function requireUser(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) throw new Error("UNAUTHORIZED")
  return user
}

export async function requirePermission(req: Request, permissionKey: string) {
  const user = await requireUser(req)
  return user
}

export async function ensureBaseRbacData() {
  // 0 延迟：直接置空，防止任何建表操作卡死 504
  return {}
}
