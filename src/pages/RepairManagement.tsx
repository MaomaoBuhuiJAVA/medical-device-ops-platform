import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
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
import { AlertCircle, User } from "lucide-react"

type RepairStatus = "待派单" | "维修中" | "待验收" | "已结单"

interface RepairTicket {
  id: string
  urgency: "一般" | "紧急" | "特急"
  equipment: string
  description: string
  department: string
  engineer: string | null
  status: RepairStatus
}

const repairTickets: RepairTicket[] = [
  {
    id: "RX-2024-0156",
    urgency: "特急",
    equipment: "64排螺旋CT",
    description: "设备开机后无法正常启动，显示错误代码E-502",
    department: "放射科",
    engineer: null,
    status: "待派单",
  },
  {
    id: "RX-2024-0155",
    urgency: "紧急",
    equipment: "心电监护仪",
    description: "心率波形显示异常，数据跳动不稳定",
    department: "ICU",
    engineer: "张工程师",
    status: "维修中",
  },
  {
    id: "RX-2024-0154",
    urgency: "一般",
    equipment: "输液泵",
    description: "输液速度调节不精确，需要校准",
    department: "手术室",
    engineer: "李工程师",
    status: "维修中",
  },
  {
    id: "RX-2024-0153",
    urgency: "紧急",
    equipment: "呼吸机",
    description: "氧气流量传感器故障，需更换配件",
    department: "ICU",
    engineer: "王工程师",
    status: "待验收",
  },
  {
    id: "RX-2024-0152",
    urgency: "一般",
    equipment: "全自动生化分析仪",
    description: "试剂加样针堵塞，已清洗完成",
    department: "检验科",
    engineer: "张工程师",
    status: "已结单",
  },
  {
    id: "RX-2024-0151",
    urgency: "一般",
    equipment: "彩色多普勒超声诊断仪",
    description: "探头线缆接触不良，已更换",
    department: "超声科",
    engineer: "李工程师",
    status: "已结单",
  },
]

const statusColumns: RepairStatus[] = ["待派单", "维修中", "待验收", "已结单"]

const urgencyColors: Record<string, string> = {
  一般: "bg-primary text-primary-foreground",
  紧急: "bg-warning text-warning-foreground",
  特急: "bg-destructive text-destructive-foreground",
}

export default function RepairManagement() {
  const [open, setOpen] = useState(false)
  const [tickets, setTickets] = useState<RepairTicket[]>(repairTickets)
  const [reportForm, setReportForm] = useState({
    equipment: "",
    department: "",
    urgency: "一般" as RepairTicket["urgency"],
    description: "",
  })

  const getTicketsByStatus = (status: RepairStatus) =>
    tickets.filter((ticket) => ticket.status === status)

  const nextStatus: Record<RepairStatus, RepairStatus | null> = {
    待派单: "维修中",
    维修中: "待验收",
    待验收: "已结单",
    已结单: null,
  }

  const advanceTicket = (id: string) => {
    setTickets((prev) =>
      prev.map((ticket) => {
        if (ticket.id !== id) return ticket
        const newStatus = nextStatus[ticket.status]
        if (!newStatus) return ticket
        return {
          ...ticket,
          status: newStatus,
          engineer: ticket.engineer ?? "系统自动派单",
        }
      })
    )
  }

  const createTicket = () => {
    if (!reportForm.equipment || !reportForm.department || !reportForm.description) {
      window.alert("请完整填写报修信息后再提交。")
      return
    }

    const serial = tickets.length + 151
    const id = `RX-${new Date().getFullYear()}-${String(serial).padStart(4, "0")}`
    const newTicket: RepairTicket = {
      id,
      urgency: reportForm.urgency,
      equipment: reportForm.equipment,
      description: reportForm.description,
      department: reportForm.department,
      engineer: null,
      status: "待派单",
    }
    setTickets((prev) => [newTicket, ...prev])
    setOpen(false)
    setReportForm({ equipment: "", department: "", urgency: "一般", description: "" })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">报修工单</h2>
          <p className="text-sm text-muted-foreground">
            管理和跟踪所有设备维修工单
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive">
              <AlertCircle className="mr-2 h-4 w-4" />
              故障上报
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>故障上报</DialogTitle>
              <DialogDescription>
                填写设备故障信息，提交后将自动进入待派单队列
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>报修设备</Label>
                <Select
                  value={reportForm.equipment}
                  onValueChange={(value) =>
                    setReportForm((prev) => ({
                      ...prev,
                      equipment: value,
                      department: value.includes("ICU")
                        ? "ICU"
                        : value.includes("检验")
                          ? "检验科"
                          : value.includes("超声")
                            ? "超声科"
                            : "放射科",
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="搜索并选择设备..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="彩色多普勒超声诊断仪">
                      EQ-2024-001 彩色多普勒超声诊断仪
                    </SelectItem>
                    <SelectItem value="全自动生化分析仪">
                      EQ-2024-002 全自动生化分析仪
                    </SelectItem>
                    <SelectItem value="64排螺旋CT">
                      EQ-2024-003 64排螺旋CT
                    </SelectItem>
                    <SelectItem value="心电监护仪 ICU">
                      EQ-2024-004 心电监护仪
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>紧急程度</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="urgency"
                      value="一般"
                      checked={reportForm.urgency === "一般"}
                      onChange={() => setReportForm((prev) => ({ ...prev, urgency: "一般" }))}
                      className="h-4 w-4 border-border text-primary"
                    />
                    <span className="text-sm">一般</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="urgency"
                      value="紧急"
                      checked={reportForm.urgency === "紧急"}
                      onChange={() => setReportForm((prev) => ({ ...prev, urgency: "紧急" }))}
                      className="h-4 w-4 border-border text-primary"
                    />
                    <span className="text-sm">紧急</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="urgency"
                      value="特急"
                      checked={reportForm.urgency === "特急"}
                      onChange={() => setReportForm((prev) => ({ ...prev, urgency: "特急" }))}
                      className="h-4 w-4 border-border text-primary"
                    />
                    <span className="text-sm">特急</span>
                  </label>
                </div>
              </div>
              <div className="space-y-2">
                <Label>故障描述</Label>
                <Textarea
                  placeholder="请详细描述设备故障现象..."
                  rows={4}
                  value={reportForm.description}
                  onChange={(e) =>
                    setReportForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                取消
              </Button>
              <Button onClick={createTicket}>提交报修</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statusColumns.map((status) => {
          const tickets = getTicketsByStatus(status)
          return (
            <Card key={status} className="flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-sm font-medium">
                  <span>{status}</span>
                  <Badge variant="secondary" className="ml-2">
                    {tickets.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 pt-0">
                <ScrollArea className="h-[calc(100vh-320px)]">
                  <div className="space-y-3 pr-2">
                    {tickets.map((ticket) => (
                      <Card
                        key={ticket.id}
                        className="cursor-pointer border-border bg-card transition-shadow hover:shadow-md"
                      >
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs text-muted-foreground">
                                {ticket.id}
                              </span>
                              <Badge
                                variant="secondary"
                                className={urgencyColors[ticket.urgency]}
                              >
                                {ticket.urgency}
                              </Badge>
                            </div>
                            <h4 className="font-medium text-foreground">
                              {ticket.equipment}
                            </h4>
                            <p className="line-clamp-2 text-sm text-muted-foreground">
                              {ticket.description}
                            </p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{ticket.department}</span>
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {ticket.engineer || "待分配"}
                              </span>
                            </div>
                            {ticket.status !== "已结单" && (
                              <Button
                                size="sm"
                                className="w-full"
                                onClick={() => advanceTicket(ticket.id)}
                              >
                                {ticket.status === "待派单" && "派单并开始维修"}
                                {ticket.status === "维修中" && "提交验收"}
                                {ticket.status === "待验收" && "验收通过并结单"}
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {tickets.length === 0 && (
                      <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                        暂无工单
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
