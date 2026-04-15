import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, User, CheckCircle2, AlertTriangle } from "lucide-react"

type TaskStatus = "pending" | "completed" | "repair"

interface InspectionTask {
  id: number
  type: "日检" | "周检" | "月检"
  equipment: string
  equipmentId: string
  deadline: string
  assignee: string
  status: TaskStatus
}

const inspectionTasks = [
  {
    id: 1,
    type: "日检",
    equipment: "彩色多普勒超声诊断仪",
    equipmentId: "EQ-2024-001",
    deadline: "2024-03-15",
    assignee: "张工程师",
    status: "pending",
  },
  {
    id: 2,
    type: "周检",
    equipment: "全自动生化分析仪",
    equipmentId: "EQ-2024-002",
    deadline: "2024-03-17",
    assignee: "李工程师",
    status: "pending",
  },
  {
    id: 3,
    type: "月检",
    equipment: "64排螺旋CT",
    equipmentId: "EQ-2024-003",
    deadline: "2024-03-20",
    assignee: "王工程师",
    status: "completed",
  },
  {
    id: 4,
    type: "日检",
    equipment: "心电监护仪",
    equipmentId: "EQ-2024-004",
    deadline: "2024-03-15",
    assignee: "张工程师",
    status: "pending",
  },
  {
    id: 5,
    type: "周检",
    equipment: "呼吸机",
    equipmentId: "EQ-2024-005",
    deadline: "2024-03-18",
    assignee: "李工程师",
    status: "pending",
  },
] satisfies InspectionTask[]

const checkItems = [
  {
    id: "appearance",
    label: "外观完好",
    description: "检查设备外壳是否有损坏、变形或腐蚀",
  },
  {
    id: "probe",
    label: "探头无破损",
    description: "检查探头表面是否有裂纹、磨损或信号异常",
  },
  {
    id: "display",
    label: "图像显示正常",
    description: "检查显示屏是否正常，图像清晰度是否达标",
  },
  {
    id: "function",
    label: "功能测试通过",
    description: "执行基本功能测试，确认各项功能正常运行",
  },
]

const typeColors: Record<string, string> = {
  日检: "bg-primary text-primary-foreground",
  周检: "bg-accent text-accent-foreground",
  月检: "bg-warning text-warning-foreground",
}

export default function InspectionPlanning() {
  const [tasks, setTasks] = useState<InspectionTask[]>(inspectionTasks)
  const [selectedTaskId, setSelectedTaskId] = useState<number>(inspectionTasks[0].id)
  const [checkedItemsMap, setCheckedItemsMap] = useState<Record<number, string[]>>({})
  const [feedback, setFeedback] = useState("")
  const [planForm, setPlanForm] = useState({
    equipment: "",
    assignee: "",
    type: "日检" as InspectionTask["type"],
  })

  const handleCheckChange = (itemId: string, checked: boolean) => {
    setCheckedItemsMap((prev) => {
      const current = prev[selectedTaskId] || []
      return {
        ...prev,
        [selectedTaskId]: checked
          ? [...current, itemId]
          : current.filter((id) => id !== itemId),
      }
    })
  }

  const selectedTask = tasks.find((task) => task.id === selectedTaskId) ?? null
  const checkedItems = checkedItemsMap[selectedTaskId] || []

  const markTaskStatus = (taskId: number, status: TaskStatus) => {
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, status } : task)))
  }

  const handleSubmitRecord = () => {
    if (!selectedTask) return
    if (checkedItems.length === 0) {
      setFeedback("请至少勾选一项检查项后再提交。")
      return
    }
    markTaskStatus(selectedTask.id, "completed")
    setFeedback(`已提交 ${selectedTask.equipment} 的巡检记录。`)
  }

  const handleMoveToRepair = () => {
    if (!selectedTask) return
    markTaskStatus(selectedTask.id, "repair")
    setFeedback(`${selectedTask.equipment} 已转为报修处理。`)
  }

  const handleCreatePlanTask = () => {
    if (!planForm.equipment || !planForm.assignee) {
      setFeedback("请填写设备名称与执行人。")
      return
    }
    const nextId = Math.max(...tasks.map((task) => task.id)) + 1
    const newTask: InspectionTask = {
      id: nextId,
      type: planForm.type,
      equipment: planForm.equipment,
      equipmentId: `EQ-${new Date().getFullYear()}-${String(nextId).padStart(3, "0")}`,
      deadline: new Date().toISOString().slice(0, 10),
      assignee: planForm.assignee,
      status: "pending",
    }
    setTasks((prev) => [newTask, ...prev])
    setSelectedTaskId(newTask.id)
    setPlanForm({ equipment: "", assignee: "", type: "日检" })
    setFeedback("已新增巡检计划并加入待办任务。")
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="tasks" className="w-full">
        <TabsList>
          <TabsTrigger value="tasks">巡检任务待办</TabsTrigger>
          <TabsTrigger value="settings">巡检计划设置</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">待办任务列表</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[calc(100vh-320px)]">
                    <div className="space-y-3 pr-4">
                      {tasks.map((task) => (
                        <div
                          key={task.id}
                          onClick={() => setSelectedTaskId(task.id)}
                          className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                            selectedTaskId === task.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="secondary"
                                  className={typeColors[task.type]}
                                >
                                  {task.type}
                                </Badge>
                                {task.status === "completed" && (
                                  <Badge
                                    variant="secondary"
                                    className="bg-accent text-accent-foreground"
                                  >
                                    <CheckCircle2 className="mr-1 h-3 w-3" />
                                    已完成
                                  </Badge>
                                )}
                                {task.status === "repair" && (
                                  <Badge variant="destructive">已转报修</Badge>
                                )}
                              </div>
                              <h3 className="font-medium text-foreground">
                                {task.equipment}
                              </h3>
                              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  截止: {task.deadline}
                                </span>
                                <span className="flex items-center gap-1">
                                  <User className="h-4 w-4" />
                                  {task.assignee}
                                </span>
                              </div>
                            </div>
                            {task.status === "pending" && (
                              <Button size="sm" onClick={() => setSelectedTaskId(task.id)}>
                                去执行
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card className="sticky top-20">
                <CardHeader className="border-b">
                  <CardTitle className="text-base">巡检执行面板</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {selectedTask ? (
                    <div className="space-y-6">
                      <div className="rounded-lg bg-muted/50 p-4">
                        <p className="text-sm text-muted-foreground">
                          当前设备
                        </p>
                        <p className="mt-1 font-medium text-foreground">
                          {selectedTask.equipment}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {selectedTask.equipmentId}
                        </p>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-medium text-foreground">
                          检查项清单
                        </h4>
                        <div className="space-y-4">
                          {checkItems.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-start gap-3"
                            >
                              <Checkbox
                                id={item.id}
                                checked={checkedItems.includes(item.id)}
                                onCheckedChange={(checked) =>
                                  handleCheckChange(item.id, checked as boolean)
                                }
                              />
                              <div className="space-y-1">
                                <Label
                                  htmlFor={item.id}
                                  className="cursor-pointer font-medium"
                                >
                                  {item.label}
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button className="flex-1" onClick={handleSubmitRecord}>
                          提交记录
                        </Button>
                        <Button
                          variant="destructive"
                          className="flex-1"
                          onClick={handleMoveToRepair}
                        >
                          <AlertTriangle className="mr-2 h-4 w-4" />
                          转报修
                        </Button>
                      </div>
                      {feedback && (
                        <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
                          {feedback}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex h-64 items-center justify-center text-muted-foreground">
                      请选择一个巡检任务
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">巡检计划设置</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>设备名称</Label>
                    <Input
                      value={planForm.equipment}
                      onChange={(e) =>
                        setPlanForm((prev) => ({ ...prev, equipment: e.target.value }))
                      }
                      placeholder="例如：便携式监护仪"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>执行人</Label>
                    <Input
                      value={planForm.assignee}
                      onChange={(e) =>
                        setPlanForm((prev) => ({ ...prev, assignee: e.target.value }))
                      }
                      placeholder="例如：张工程师"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>巡检类型</Label>
                    <Select
                      value={planForm.type}
                      onValueChange={(value) =>
                        setPlanForm((prev) => ({ ...prev, type: value as InspectionTask["type"] }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="日检">日检</SelectItem>
                        <SelectItem value="周检">周检</SelectItem>
                        <SelectItem value="月检">月检</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    新建后会自动进入待办任务列表
                  </div>
                  <Button onClick={handleCreatePlanTask}>保存计划</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
