import { SignJWT, jwtVerify } from "jose"
import { prisma } from "./prisma"
import { parseCookies } from "./http"

const COOKIE_NAME = "session"

function getJwtSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error("Missing JWT_SECRET")
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
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, department: true },
    })
    return user
  } catch {
    return null
  }
}

export async function getUserPermissions(userId: string) {
  const roles = await prisma.userRole.findMany({
    where: { userId },
    select: {
      role: {
        select: {
          name: true,
          permissions: { select: { permission: { select: { key: true } } } },
        },
      },
    },
  })
  const roleNames = roles.map((r) => r.role.name)
  const keys = new Set<string>()
  for (const r of roles) {
    for (const p of r.role.permissions) keys.add(p.permission.key)
  }
  return { roles: roleNames, permissions: Array.from(keys) }
}

export async function requireUser(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) throw new Error("UNAUTHORIZED")
  return user
}

export async function requirePermission(req: Request, permissionKey: string) {
  const user = await requireUser(req)
  const { permissions } = await getUserPermissions(user.id)
  if (!permissions.includes(permissionKey)) throw new Error("FORBIDDEN")
  return user
}

export async function ensureBaseRbacData() {
  const permissionKeys = [
    "equipment:read",
    "equipment:create",
    "equipment:update",
    "equipment:scrap",
    "inspection:read",
    "inspection:write",
    "repair:read",
    "repair:write",
    "scrap:read",
    "scrap:write",
    "admin:manage",
  ]

  for (const key of permissionKeys) {
    await prisma.permission.upsert({
      where: { key },
      update: {},
      create: { key },
    })
  }

  const roleAdmin = await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: { name: "admin" },
  })
  const roleEngineer = await prisma.role.upsert({
    where: { name: "engineer" },
    update: {},
    create: { name: "engineer" },
  })
  const roleManager = await prisma.role.upsert({
    where: { name: "manager" },
    update: {},
    create: { name: "manager" },
  })

  const perms = await prisma.permission.findMany({ select: { id: true, key: true } })
  const byKey = new Map(perms.map((p) => [p.key, p.id]))

  const adminPerms = permissionKeys
  const engineerPerms = ["equipment:read", "inspection:read", "inspection:write", "repair:read", "repair:write"]
  const managerPerms = ["equipment:read", "scrap:read", "scrap:write", "repair:read", "repair:write", "inspection:read"]

  async function setRolePerms(roleId: string, keys: string[]) {
    await prisma.rolePermission.deleteMany({ where: { roleId } })
    await prisma.rolePermission.createMany({
      data: keys.map((k) => ({ roleId, permissionId: byKey.get(k)! })),
      skipDuplicates: true,
    })
  }

  await setRolePerms(roleAdmin.id, adminPerms)
  await setRolePerms(roleEngineer.id, engineerPerms)
  await setRolePerms(roleManager.id, managerPerms)

  return { roleAdmin, roleEngineer, roleManager }
}

