"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts"
import { useData } from "@/components/local-data-provider"
import { Icons } from "@/components/icons"

export function ProductivityCharts() {
  const { tasks, pomodoros } = useData()

  // Calculate weekly data
  const getWeeklyData = () => {
    const today = new Date()
    const weekData = []

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      const dateString = date.toISOString().split("T")[0]

      const dayTasks = tasks.filter((task) => task.completedAt && task.completedAt.split("T")[0] === dateString).length

      const dayPomodoros = pomodoros.filter(
        (session) => session.completed && session.startTime.split("T")[0] === dateString,
      ).length

      const dayFocusTime =
        pomodoros
          .filter((session) => session.completed && session.startTime.split("T")[0] === dateString)
          .reduce((sum, session) => sum + session.duration, 0) / 60

      weekData.push({
        day: date.toLocaleDateString("en", { weekday: "short" }),
        date: dateString,
        tasks: dayTasks,
        pomodoros: dayPomodoros,
        hours: Number.parseFloat(dayFocusTime.toFixed(1)),
      })
    }

    return weekData
  }

  // Calculate task distribution
  const getTaskDistribution = () => {
    const categories = {
      work: tasks.filter((t) => t.category === "work").length,
      personal: tasks.filter((t) => t.category === "personal").length,
      learning: tasks.filter((t) => t.category === "learning").length,
      health: tasks.filter((t) => t.category === "health").length,
    }

    const total = Object.values(categories).reduce((sum, count) => sum + count, 0)

    if (total === 0) {
      return [{ name: "No tasks yet", value: 100, color: "#E5E7EB" }]
    }

    return [
      { name: "Work", value: Math.round((categories.work / total) * 100), color: "#3B82F6" },
      { name: "Personal", value: Math.round((categories.personal / total) * 100), color: "#10B981" },
      { name: "Learning", value: Math.round((categories.learning / total) * 100), color: "#8B5CF6" },
      { name: "Health", value: Math.round((categories.health / total) * 100), color: "#F59E0B" },
    ].filter((item) => item.value > 0)
  }

  const weeklyData = getWeeklyData()
  const taskDistribution = getTaskDistribution()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Icons.clock className="w-5 h-5 mr-2 text-blue-600" />
            Weekly Focus Hours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              hours: {
                label: "Hours",
                color: "#3B82F6",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData}>
                <XAxis dataKey="day" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="hours"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Icons.timer className="w-5 h-5 mr-2 text-green-600" />
            Daily Pomodoros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              pomodoros: {
                label: "Pomodoros",
                color: "#10B981",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <XAxis dataKey="day" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="pomodoros" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Icons.target className="w-5 h-5 mr-2 text-purple-600" />
            Task Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              value: {
                label: "Tasks",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {taskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {taskDistribution.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-gray-600">{item.name}</span>
                <span className="text-sm font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Icons.target className="w-5 h-5 mr-2 text-emerald-600" />
            Tasks Completed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              tasks: {
                label: "Tasks",
                color: "#8B5CF6",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <XAxis dataKey="day" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="tasks" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
