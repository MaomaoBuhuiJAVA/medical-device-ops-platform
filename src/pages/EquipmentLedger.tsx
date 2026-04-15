import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Search, Filter, Plus, FileText, MoreHorizontal, Upload } from "lucide-react"
import { api } from "@/api/client"
import { useMe } from "@/auth/useMe"

type EquipmentStatus = "在用" | "维修中" | "停用" | "已报废"
type RiskLevel = "高" | "中" | "低"

interface EquipmentItem {
  id: string
  code: string
  name: string
  brand: string
  model: string
  department: string
  status: EquipmentStatus
  risk: RiskLevel
}

const equipmentData = [
  {
    id: "local-1",
    code: "EQ-2024-001",
    name: "彩色多普勒超声诊断仪",
    brand: "GE Healthcare",
    model: "LOGIQ E10",
    department: "超声科",
    status: "在用",
    risk: "高",
  },
  {
    id: "local-2",
    code: "EQ-2024-002",
    name: "全自动生化分析仪",
    brand: "罗氏诊断",
    model: "cobas 8000",
    department: "检验科",
    status: "在用",
    risk: "高",
  },
  {
    id: "local-3",
    code: "EQ-2024-003",
    name: "64排螺旋CT",
    brand: "西门子",
    model: "SOMATOM go.Top",
    department: "放射科",
    status: "维修中",
    risk: "高",
  },
  {
    id: "local-4",
    code: "EQ-2024-004",
    name: "心电监护仪",
    brand: "迈瑞",
    model: "BeneVision N22",
    department: "ICU",
    status: "在用",
    risk: "中",
  },
  {
    id: "local-5",
    code: "EQ-2024-005",
    name: "呼吸机",
    brand: "德尔格",
    model: "Evita V800",
    department: "ICU",
    status: "停用",
    risk: "高",
  },
  {
    id: "local-6",
    code: "EQ-2024-006",
    name: "输液泵",
    brand: "贝朗",
    model: "Infusomat Space",
    department: "手术室",
    status: "在用",
    risk: "低",
  },
  {
    id: "local-7",
    code: "EQ-2024-007",
    name: "除颤仪",
    brand: "飞利浦",
    model: "HeartStart MRx",
    department: "急诊科",
    status: "已报废",
    risk: "高",
  },
] satisfies EquipmentItem[]

const statusColors: Record<string, string> = {
  在用: "bg-accent text-accent-foreground",
  维修中: "bg-warning text-warning-foreground",
  停用: "bg-muted text-muted-foreground",
  已报废: "bg-destructive text-destructive-foreground",
}

const riskColors: Record<string, string> = {
  高: "text-destructive",
  中: "text-warning",
  低: "text-accent",
}

export default function EquipmentLedger() {
  const [open, setOpen] = useState(false)
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showActiveOnly, setShowActiveOnly] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [equipments, setEquipments] = useState<EquipmentItem[]>([])
  const [selectedArchive, setSelectedArchive] = useState<EquipmentItem | null>(null)
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    brand: "",
    model: "",
    department: "",
    risk: "",
  })

  const { me, loading: meLoading, has } = useMe()

  const loadEquipments = async () => {
    const list = await api<
      Array<{
        id: string
        code: string
        name: string
        brand: string
        model: string
        department: string
        status: EquipmentStatus
        risk: RiskLevel
      }>
    >("/api/equipment")
    setEquipments(
      list.map((e) => ({
        id: e.id,
        code: e.code,
        name: e.name,
        brand: e.brand,
        model: e.model,
        department: e.department,
        status: e.status,
        risk: e.risk,
      }))
    )
  }

  useEffect(() => {
    if (meLoading) return
    if (me && me.user) {
      loadEquipments().catch(() => {
        setEquipments(equipmentData as unknown as EquipmentItem[])
      })
    } else {
      setEquipments(equipmentData as unknown as EquipmentItem[])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meLoading])

  const filteredData = equipments.filter(
    (item) =>
      (item.name.includes(searchTerm) ||
        item.id.includes(searchTerm) ||
        item.department.includes(searchTerm)) &&
      (!showActiveOnly || item.status !== "已报废")
  )

  const resetForm = () => {
    setFormData({
      id: "",
      name: "",
      brand: "",
      model: "",
      department: "",
      risk: "",
    })
  }

  const handleOpenCreate = () => {
    setEditingId(null)
    resetForm()
    setOpen(true)
  }

  const handleSaveEquipment = () => {
    if (!formData.id || !formData.name || !formData.department || !formData.risk) {
      window.alert("请先填写必填项（编号、名称、科室、风险等级）")
      return
    }

    if (me && me.user) {
      const payload = {
        code: formData.id,
        name: formData.name,
        brand: formData.brand,
        model: formData.model,
        department: formData.department,
        risk: formData.risk,
      }
      const run = async () => {
        if (editingId) {
          await api(`/api/equipment/${editingId}`, {
            method: "PUT",
            body: JSON.stringify(payload),
          })
        } else {
          await api(`/api/equipment`, {
            method: "POST",
            body: JSON.stringify(payload),
          })
        }
        await loadEquipments()
      }
      run().catch((e) => window.alert(e?.message || "保存失败"))
    } else {
      // fallback (未登录时仍可本地演示)
      if (editingId) {
        setEquipments((prev) =>
          prev.map((item) =>
            item.id === editingId
              ? {
                  ...item,
                  ...formData,
                  risk: formData.risk as RiskLevel,
                }
              : item
          )
        )
      } else {
        const duplicated = equipments.some((item) => item.id === formData.id)
        if (duplicated) {
          window.alert("设备编号已存在，请更换")
          return
        }
        const newItem: EquipmentItem = {
          ...(formData as any),
          status: "在用",
          risk: formData.risk as RiskLevel,
        }
        setEquipments((prev) => [newItem, ...prev])
      }
    }

    setOpen(false)
    setEditingId(null)
    resetForm()
  }

  const handleEdit = (item: EquipmentItem) => {
    setEditingId(item.id)
    setFormData({
      id: item.code,
      name: item.name,
      brand: item.brand,
      model: item.model,
      department: item.department,
      risk: item.risk,
    })
    setOpen(true)
  }

  const handleApplyScrap = (id: string) => {
    if (me && me.user) {
      api("/api/equipment/scrap", { method: "POST", body: JSON.stringify({ id }) })
        .then(loadEquipments)
        .catch((e) => window.alert(e?.message || "操作失败"))
      return
    }
    setEquipments((prev) => prev.map((item) => (item.id === id ? { ...item, status: "已报废" } : item)))
  }

  const openArchive = (item: EquipmentItem) => {
    setSelectedArchive(item)
    setArchiveOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜索设备名称、编号或科室..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={showActiveOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setShowActiveOnly((prev) => !prev)}
          >
            <Filter className="mr-2 h-4 w-4" />
            {showActiveOnly ? "显示全部" : "筛选"}
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                onClick={handleOpenCreate}
                disabled={me && me.user ? !has("equipment:create") : false}
              >
                <Plus className="mr-2 h-4 w-4" />
                设备登记
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>设备登记</DialogTitle>
                <DialogDescription>
                  填写以下信息登记新设备到系统台账
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">设备名称</Label>
                    <Input
                      id="name"
                      placeholder="请输入设备名称"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">设备编号</Label>
                    <Input
                      id="code"
                      placeholder="请输入设备编号"
                      value={formData.id}
                      onChange={(e) => setFormData((prev) => ({ ...prev, id: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand">品牌</Label>
                    <Input
                      id="brand"
                      placeholder="请输入品牌"
                      value={formData.brand}
                      onChange={(e) => setFormData((prev) => ({ ...prev, brand: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model">型号</Label>
                    <Input
                      id="model"
                      placeholder="请输入型号"
                      value={formData.model}
                      onChange={(e) => setFormData((prev) => ({ ...prev, model: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>所在科室</Label>
                    <Select
                      value={formData.department}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, department: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择科室" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="超声科">超声科</SelectItem>
                        <SelectItem value="检验科">检验科</SelectItem>
                        <SelectItem value="放射科">放射科</SelectItem>
                        <SelectItem value="手术室">手术室</SelectItem>
                        <SelectItem value="ICU">ICU</SelectItem>
                        <SelectItem value="急诊科">急诊科</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>风险等级</Label>
                    <Select
                      value={formData.risk}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, risk: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择风险等级" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="高">高</SelectItem>
                        <SelectItem value="中">中</SelectItem>
                        <SelectItem value="低">低</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>附件上传</Label>
                  <div className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 transition-colors hover:border-primary hover:bg-muted">
                    <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      点击或拖拽文件上传操作手册/保修卡
                    </p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setOpen(false)
                    setEditingId(null)
                    resetForm()
                  }}
                >
                  取消
                </Button>
                <Button
                  onClick={handleSaveEquipment}
                  disabled={me && me.user ? !(editingId ? has("equipment:update") : has("equipment:create")) : false}
                >
                  {editingId ? "保存修改" : "保存登记"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>设备编号</TableHead>
                <TableHead>设备名称</TableHead>
                <TableHead>品牌型号</TableHead>
                <TableHead>所在科室</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>风险等级</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-sm">
                    {item.code}
                  </TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    {item.brand} / {item.model}
                  </TableCell>
                  <TableCell>{item.department}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={statusColors[item.status]}
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={`font-medium ${riskColors[item.risk]}`}>
                      {item.risk}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openArchive(item)}>
                        <FileText className="mr-1 h-4 w-4" />
                        档案
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleEdit(item)}
                            disabled={me && me.user ? !has("equipment:update") : false}
                          >
                            编辑信息
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => window.alert(`设备 ${item.id} 的维修记录功能已触发`)}
                          >
                            维修记录
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => window.alert(`设备 ${item.id} 的巡检记录功能已触发`)}
                          >
                            巡检记录
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleApplyScrap(item.id)}
                            disabled={me && me.user ? !has("equipment:scrap") : false}
                          >
                            申请报废
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={archiveOpen} onOpenChange={setArchiveOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>设备档案</DialogTitle>
            <DialogDescription>查看当前设备基础资料</DialogDescription>
          </DialogHeader>
          {selectedArchive && (
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">设备编号：</span>
                {selectedArchive.id}
              </p>
              <p>
                <span className="text-muted-foreground">设备名称：</span>
                {selectedArchive.name}
              </p>
              <p>
                <span className="text-muted-foreground">品牌型号：</span>
                {selectedArchive.brand} / {selectedArchive.model}
              </p>
              <p>
                <span className="text-muted-foreground">所在科室：</span>
                {selectedArchive.department}
              </p>
              <p>
                <span className="text-muted-foreground">状态：</span>
                {selectedArchive.status}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setArchiveOpen(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
