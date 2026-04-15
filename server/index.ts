import express from "express"
import registerHandler from "../api/auth/register"
import loginHandler from "../api/auth/login"
import logoutHandler from "../api/auth/logout"
import meHandler from "../api/auth/me"
import changePasswordHandler from "../api/auth/change-password"
import equipmentHandler from "../api/equipment/index"
import equipmentByIdHandler from "../api/equipment/[id]"
import equipmentScrapHandler from "../api/equipment/scrap"

type ApiHandler = (req: Request) => Promise<Response> | Response

function toRequest(req: express.Request, baseUrl: string, urlPath?: string) {
  const url = `${baseUrl}${urlPath ?? req.originalUrl}`
  const headers = new Headers()
  for (const [key, value] of Object.entries(req.headers)) {
    if (!value) continue
    if (Array.isArray(value)) {
      for (const item of value) headers.append(key, item)
    } else {
      headers.set(key, value)
    }
  }
  const hasBody = req.method !== "GET" && req.method !== "HEAD"
  const body = hasBody ? JSON.stringify(req.body ?? {}) : undefined
  return new Request(url, { method: req.method, headers, body })
}

async function runHandler(
  req: express.Request,
  res: express.Response,
  handler: ApiHandler,
  baseUrl: string,
  urlPath?: string
) {
  try {
    const request = toRequest(req, baseUrl, urlPath)
    const response = await handler(request)
    res.status(response.status)
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === "set-cookie") {
        res.append("set-cookie", value)
      } else {
        res.setHeader(key, value)
      }
    })
    const buffer = Buffer.from(await response.arrayBuffer())
    res.send(buffer)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error"
    const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500
    res.status(status).json({ error: message })
  }
}

const app = express()
const port = Number(process.env.LOCAL_API_PORT || 3100)
const baseUrl = `http://localhost:${port}`

app.use(express.json())

app.all("/api/auth/register", (req, res) => runHandler(req, res, registerHandler, baseUrl))
app.all("/api/auth/login", (req, res) => runHandler(req, res, loginHandler, baseUrl))
app.all("/api/auth/logout", (req, res) => runHandler(req, res, logoutHandler, baseUrl))
app.all("/api/auth/me", (req, res) => runHandler(req, res, meHandler, baseUrl))
app.all("/api/auth/change-password", (req, res) => runHandler(req, res, changePasswordHandler, baseUrl))

app.all("/api/equipment", (req, res) => runHandler(req, res, equipmentHandler, baseUrl))
app.all("/api/equipment/scrap", (req, res) => runHandler(req, res, equipmentScrapHandler, baseUrl))
app.all("/api/equipment/:id", (req, res) => {
  return runHandler(req, res, equipmentByIdHandler, baseUrl, `/api/equipment/${req.params.id}`)
})

app.listen(port, () => {
  console.log(`Local API server is running on ${baseUrl}`)
})

