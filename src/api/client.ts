export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    credentials: "include",
    headers: {
      "content-type": "application/json",
      ...(init?.headers || {}),
    },
    ...init,
  })

  const text = await res.text()
  const contentType = res.headers.get("content-type") || ""
  const isJson = contentType.includes("application/json")
  const data = text ? (isJson ? JSON.parse(text) : { error: text }) : null

  if (!res.ok) {
    const message =
      data?.error ||
      (typeof data === "string" ? data : "") ||
      "请求失败"
    throw new ApiError(res.status, message)
  }
  return data as T
}

