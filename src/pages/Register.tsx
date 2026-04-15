import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from "@/api/client"

type RegisterRole = "engineer" | "manager" | "admin"

export default function Register() {
  const navigate = useNavigate()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [department, setDepartment] = useState("")
  const [role, setRole] = useState<RegisterRole>("engineer")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)
    try {
      await api("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ username, password, department, role }),
      })
      navigate("/", { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : "注册失败")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>注册账号</CardTitle>
          <CardDescription>创建系统账号并分配身份角色</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="例如：zhangsan"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="至少 6 位"
                minLength={6}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">所属科室</Label>
              <Input
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="例如：医工处"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>身份角色</Label>
              <Select value={role} onValueChange={(v) => setRole(v as RegisterRole)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="engineer">工程师（engineer）</SelectItem>
                  <SelectItem value="manager">科室负责人（manager）</SelectItem>
                  <SelectItem value="admin">系统管理员（admin）</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button className="w-full" type="submit" disabled={submitting}>
              {submitting ? "注册中..." : "注册并登录"}
            </Button>
          </form>
          <p className="mt-4 text-sm text-muted-foreground">
            已有账号？{" "}
            <Link className="text-primary hover:underline" to="/login">
              去登录
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

