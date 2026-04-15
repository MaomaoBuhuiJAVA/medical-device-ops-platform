import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Server, CheckCircle, AlertTriangle, ClipboardList } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

const statsData = [
  {
    title: "设备总数",
    value: "1,286",
    icon: Server,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    title: "设备完好率",
    value: "94.8%",
    icon: CheckCircle,
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    title: "维修中设备",
    value: "32",
    icon: AlertTriangle,
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  {
    title: "待执行巡检",
    value: "58",
    icon: ClipboardList,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
]

const departmentData = [
  { name: "超声科", value: 156 },
  { name: "检验科", value: 234 },
  { name: "放射科", value: 189 },
  { name: "手术室", value: 298 },
  { name: "ICU", value: 167 },
  { name: "急诊科", value: 142 },
]

const statusData = [
  { name: "在用", value: 1180, color: "hsl(160, 60%, 45%)" },
  { name: "维修中", value: 32, color: "hsl(45, 80%, 55%)" },
  { name: "停用", value: 74, color: "hsl(220, 10%, 60%)" },
]

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className={`mt-2 text-3xl font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`rounded-lg p-3 ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              各科室设备分布
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={departmentData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <YAxis
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Bar
                    dataKey="value"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              设备状态占比
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(1)}%`
                    }
                    labelLine={{ stroke: "hsl(var(--muted-foreground))" }}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Legend
                    formatter={(value) => (
                      <span style={{ color: "hsl(var(--foreground))" }}>
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
