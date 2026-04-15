import { useLocation, useNavigate } from "react-router-dom"
import { useState } from "react"
import { Remind, SettingTwo, AppSwitch, Lock } from "@icon-park/react"
import { Button } from "@/components/ui/button"
import { useMe } from "@/auth/useMe"
import { api } from "@/api/client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const pageTitles: Record<string, string> = {
  "/": "首页看板",
  "/equipment": "设备台账",
  "/inspection": "巡检管理",
  "/repair": "报修处理",
  "/scrap": "资产报废",
}

export function Header() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const title = pageTitles[pathname] || "医疗设备运维系统"
  const [showNotice, setShowNotice] = useState(false)
  const [changePwdOpen, setChangePwdOpen] = useState(false)
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [changePwdError, setChangePwdError] = useState("")
  const [changingPwd, setChangingPwd] = useState(false)
  const { me, refresh } = useMe()

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark")
  }

  const handleSwitchAccount = async () => {
    await api("/api/auth/logout", { method: "POST" }).catch(() => undefined)
    navigate("/login", { replace: true })
  }

  const handleChangePassword = async () => {
    setChangePwdError("")
    if (!oldPassword || !newPassword) {
      setChangePwdError("请填写旧密码和新密码")
      return
    }
    setChangingPwd(true)
    try {
      await api("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ oldPassword, newPassword }),
      })
      setChangePwdOpen(false)
      setOldPassword("")
      setNewPassword("")
      await refresh()
      window.alert("密码修改成功，请牢记新密码。")
    } catch (error) {
      setChangePwdError(error instanceof Error ? error.message : "修改失败")
    } finally {
      setChangingPwd(false)
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/60 bg-card/65 px-6 backdrop-blur-xl">
      <h1 className="text-lg font-semibold text-card-foreground">{title}</h1>
      <div className="relative flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="relative transition-all duration-300 hover:scale-105"
          onClick={() => setShowNotice((prev) => !prev)}
        >
          <Remind theme="outline" size="20" fill="currentColor" className="text-muted-foreground" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
          <span className="sr-only">通知</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="transition-all duration-300 hover:scale-105">
              <SettingTwo theme="outline" size="20" fill="currentColor" className="text-muted-foreground" />
              <span className="sr-only">设置</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              {me?.user ? `${me.user.username}（${me.user.department ?? "未分配科室"}）` : "未登录"}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={toggleTheme}>
              <SettingTwo theme="outline" size="16" fill="currentColor" className="mr-2" />
              切换明暗主题
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setChangePwdOpen(true)}>
              <Lock theme="outline" size="16" fill="currentColor" className="mr-2" />
              修改密码
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSwitchAccount}>
              <AppSwitch theme="outline" size="16" fill="currentColor" className="mr-2" />
              切换账号
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {showNotice && (
          <div className="absolute right-0 top-12 w-72 rounded-xl border border-border/70 bg-card/95 p-3 text-sm shadow-xl backdrop-blur">
            <p className="font-medium">系统通知</p>
            <p className="mt-2 text-muted-foreground">您有 3 条待处理巡检任务。</p>
            <p className="mt-1 text-muted-foreground">有 1 条报废申请等待审批。</p>
          </div>
        )}
      </div>
      <Dialog open={changePwdOpen} onOpenChange={setChangePwdOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>修改密码</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="old-password">旧密码</Label>
              <Input
                id="old-password"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="请输入当前密码"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">新密码</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="至少 6 位"
              />
            </div>
            {changePwdError && <p className="text-sm text-destructive">{changePwdError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangePwdOpen(false)}>
              取消
            </Button>
            <Button onClick={handleChangePassword} disabled={changingPwd}>
              {changingPwd ? "提交中..." : "确认修改"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  )
}
