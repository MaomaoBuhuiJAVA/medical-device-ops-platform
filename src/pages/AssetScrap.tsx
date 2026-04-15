import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FileX, Eye, Check, ChevronRight } from "lucide-react"

type ScrapStatus = "待科室审批" | "待医工处审批" | "已通过" | "已驳回"
interface ScrapApplication {
  id: string
  equipment: string
  equipmentId: string
  department: string
  date: string
  reason?: string
  status: ScrapStatus
}

const scrapApplications = [
  {
    id: "BF-2024-0023",
    equipment: "除颤仪",
    equipmentId: "EQ-2024-007",
    department: "急诊科",
    date: "2024-03-10",
    status: "待科室审批",
  },
  {
    id: "BF-2024-0022",
    equipment: "呼吸机",
    equipmentId: "EQ-2024-005",
    department: "ICU",
    date: "2024-03-08",
    status: "待医工处审批",
  },
  {
    id: "BF-2024-0021",
    equipment: "心电图机",
    equipmentId: "EQ-2024-018",
    department: "心内科",
    date: "2024-03-05",
    status: "已通过",
  },
  {
    id: "BF-2024-0020",
    equipment: "血气分析仪",
    equipmentId: "EQ-2024-012",
    department: "检验科",
    date: "2024-03-01",
    status: "已驳回",
  },
  {
    id: "BF-2024-0019",
    equipment: "监护仪",
    equipmentId: "EQ-2024-025",
    department: "手术室",
    date: "2024-02-28",
    status: "已通过",
  },
] satisfies ScrapApplication[]

const statusColors: Record<string, string> = {
  待科室审批: "bg-warning text-warning-foreground",
  待医工处审批: "bg-warning text-warning-foreground",
  已通过: "bg-accent text-accent-foreground",
  已驳回: "bg-destructive text-destructive-foreground",
}

const approvalSteps = [
  { step: 1, label: "科室主任", status: "completed" },
  { step: 2, label: "医工处", status: "current" },
  { step: 3, label: "分管领导", status: "pending" },
]

export default function AssetScrap() {
  const [open, setOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [applications, setApplications] = useState<ScrapApplication[]>(scrapApplications)
  const [selectedApp, setSelectedApp] = useState<ScrapApplication | null>(null)
  const [formData, setFormData] = useState({
    equipmentId: "",
    reason: "",
  })

  const equipmentMap: Record<string, { name: string; department: string }> = {
    "EQ-2024-005": { name: "呼吸机", department: "ICU" },
    "EQ-2024-003": { name: "64排螺旋CT", department: "放射科" },
    "EQ-2024-007": { name: "除颤仪", department: "急诊科" },
  }

  const submitScrap = () => {
    if (!formData.equipmentId || !formData.reason) {
      window.alert("请选择设备并填写报废原因。")
      return
    }
    const info = equipmentMap[formData.equipmentId]
    const id = `BF-${new Date().getFullYear()}-${String(applications.length + 19).padStart(4, "0")}`
    const newApplication: ScrapApplication = {
      id,
      equipment: info.name,
      equipmentId: formData.equipmentId,
      department: info.department,
      date: new Date().toISOString().slice(0, 10),
      reason: formData.reason,
      status: "待科室审批",
    }
    setApplications((prev) => [newApplication, ...prev])
    setOpen(false)
    setFormData({ equipmentId: "", reason: "" })
  }

  const openDetail = (app: ScrapApplication) => {
    setSelectedApp(app)
    setDetailOpen(true)
  }

  const updateStatus = (status: ScrapStatus) => {
    if (!selectedApp) return
    setApplications((prev) =>
      prev.map((item) => (item.id === selectedApp.id ? { ...item, status } : item))
    )
    setSelectedApp((prev) => (prev ? { ...prev, status } : prev))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">资产报废</h2>
          <p className="text-sm text-muted-foreground">
            管理设备退出使用的审批流程
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <FileX className="mr-2 h-4 w-4" />
              发起报废申请
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>发起报废申请</DialogTitle>
              <DialogDescription>
                选择需要报废的设备并填写报废原因
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>选择设备</Label>
                <Select
                  value={formData.equipmentId}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, equipmentId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="仅能选择停用或维修中的设备" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EQ-2024-005">
                      EQ-2024-005 呼吸机 (停用)
                    </SelectItem>
                    <SelectItem value="EQ-2024-003">
                      EQ-2024-003 64排螺旋CT (维修中)
                    </SelectItem>
                    <SelectItem value="EQ-2024-007">
                      EQ-2024-007 除颤仪 (停用)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  仅能选择停用或维修中的设备
                </p>
              </div>
              <div className="space-y-2">
                <Label>报废原因</Label>
                <Textarea
                  placeholder="请详细说明申请报废的原因..."
                  rows={4}
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, reason: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>审批流程预览</Label>
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <div className="flex items-center justify-between">
                    {approvalSteps.map((step, index) => (
                      <div key={step.step} className="flex items-center">
                        <div className="flex flex-col items-center">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                              step.status === "completed"
                                ? "bg-accent text-accent-foreground"
                                : step.status === "current"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {step.status === "completed" ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              step.step
                            )}
                          </div>
                          <span className="mt-2 text-xs text-muted-foreground">
                            {step.label}
                          </span>
                        </div>
                        {index < approvalSteps.length - 1 && (
                          <ChevronRight className="mx-4 h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                取消
              </Button>
              <Button onClick={submitScrap}>提交申请</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>申请单号</TableHead>
                <TableHead>设备名称</TableHead>
                <TableHead>申请科室</TableHead>
                <TableHead>申请日期</TableHead>
                <TableHead>当前状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-mono text-sm">{app.id}</TableCell>
                  <TableCell>
                    <div>
                      <span className="font-medium">{app.equipment}</span>
                      <span className="ml-2 text-sm text-muted-foreground">
                        ({app.equipmentId})
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{app.department}</TableCell>
                  <TableCell>{app.date}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={statusColors[app.status]}
                    >
                      {app.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openDetail(app)}>
                      <Eye className="mr-1 h-4 w-4" />
                      查看详情
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>报废申请详情</DialogTitle>
            <DialogDescription>可在此进行审批处理</DialogDescription>
          </DialogHeader>
          {selectedApp && (
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">申请单号：</span>
                {selectedApp.id}
              </p>
              <p>
                <span className="text-muted-foreground">设备：</span>
                {selectedApp.equipment} ({selectedApp.equipmentId})
              </p>
              <p>
                <span className="text-muted-foreground">科室：</span>
                {selectedApp.department}
              </p>
              <p>
                <span className="text-muted-foreground">状态：</span>
                {selectedApp.status}
              </p>
              <p>
                <span className="text-muted-foreground">原因：</span>
                {selectedApp.reason || "未填写"}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => updateStatus("已驳回")}>
              驳回
            </Button>
            <Button onClick={() => updateStatus("已通过")}>审批通过</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
