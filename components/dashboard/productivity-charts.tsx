"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartTooltip } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts"
import { useData } from "@/components/local-data-provider"
import { Icons } from "@/components/icons"

export function ProductivityCharts() {
  const { tasks, pomodoros } = useData()

  // Calculate weekly data with real insights
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

  // Calculate task distribution with insights
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
      { name: "Work", value: Math.round((categories.work / total) * 100), color: "#3B82F6", count: categories.work },
      {
        name: "Personal",
        value: Math.round((categories.personal / total) * 100),
        color: "#10B981",
        count: categories.personal,
      },
      {
        name: "Learning",
        value: Math.round((categories.learning / total) * 100),
        color: "#8B5CF6",
        count: categories.learning,
      },
      {
        name: "Health",
        value: Math.round((categories.health / total) * 100),
        color: "#F59E0B",
        count: categories.health,
      },
    ].filter((item) => item.value > 0)
  }

  // Calculate priority distribution
  const getPriorityDistribution = () => {
    const priorities = {
      high: tasks.filter((t) => t.priority === "high").length,
      medium: tasks.filter((t) => t.priority === "medium").length,
      low: tasks.filter((t) => t.priority === "low").length,
    }

    const total = Object.values(priorities).reduce((sum, count) => sum + count, 0)

    if (total === 0) {
      return [{ name: "No tasks yet", value: 100, color: "#E5E7EB" }]
    }

    return [
      { name: "High", value: Math.round((priorities.high / total) * 100), color: "#EF4444", count: priorities.high },
      {
        name: "Medium",
        value: Math.round((priorities.medium / total) * 100),
        color: "#F59E0B",
        count: priorities.medium,
      },
      { name: "Low", value: Math.round((priorities.low / total) * 100), color: "#10B981", count: priorities.low },
    ].filter((item) => item.value > 0)
  }

  // Calculate focus time by task category
  const getFocusTimeByCategory = () => {
    const categoryFocus = {
      work: 0,
      personal: 0,
      learning: 0,
      health: 0,
      general: 0,
    }

    pomodoros.forEach((session) => {
      if (session.completed) {
        if (session.taskId) {
          const task = tasks.find((t) => t.id === session.taskId)
          if (task) {
            categoryFocus[task.category] += session.duration
          } else {
            // Task was deleted, count as general
            categoryFocus.general += session.duration
          }
        } else {
          categoryFocus.general += session.duration
        }
      }
    })

    const total = Object.values(categoryFocus).reduce((sum, time) => sum + time, 0)

    if (total === 0) {
      return [{ name: "No focus time yet", value: 100, color: "#E5E7EB", hours: 0 }]
    }

    return [
      {
        name: "Work",
        value: Math.round((categoryFocus.work / total) * 100),
        color: "#3B82F6",
        hours: Number.parseFloat((categoryFocus.work / 60).toFixed(1)),
      },
      {
        name: "Personal",
        value: Math.round((categoryFocus.personal / total) * 100),
        color: "#10B981",
        hours: Number.parseFloat((categoryFocus.personal / 60).toFixed(1)),
      },
      {
        name: "Learning",
        value: Math.round((categoryFocus.learning / total) * 100),
        color: "#8B5CF6",
        hours: Number.parseFloat((categoryFocus.learning / 60).toFixed(1)),
      },
      {
        name: "Health",
        value: Math.round((categoryFocus.health / total) * 100),
        color: "#F59E0B",
        hours: Number.parseFloat((categoryFocus.health / 60).toFixed(1)),
      },
      {
        name: "General",
        value: Math.round((categoryFocus.general / total) * 100),
        color: "#6B7280",
        hours: Number.parseFloat((categoryFocus.general / 60).toFixed(1)),
      },
    ].filter((item) => item.value > 0)
  }

  const weeklyData = getWeeklyData()
  const taskDistribution = getTaskDistribution()
  const priorityDistribution = getPriorityDistribution()
  const focusTimeByCategory = getFocusTimeByCategory()

  // Calculate insights
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => t.completed).length
  const overallCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  const avgFocusPerDay = weeklyData.reduce((sum, day) => sum + day.hours, 0) / 7
  const mostProductiveDay = weeklyData.reduce((max, day) => (day.tasks > max.tasks ? day : max), weeklyData[0])

  return (
    <div className="space-y-6">
      {/* Insights Summary */}
      <Card className="bg-gradient-to-r from-emerald-50 via-blue-50 to-violet-50 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Icons.sparkles className="w-5 h-5 mr-2 text-emerald-600" />
            Productivity Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white/60 rounded-lg">
              <div className="text-2xl font-bold text-emerald-600">{overallCompletionRate}%</div>
              <div className="text-sm text-gray-600">Overall Completion Rate</div>
            </div>
            <div className="text-center p-4 bg-white/60 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{avgFocusPerDay.toFixed(1)}h</div>
              <div className="text-sm text-gray-600">Avg Focus Time/Day</div>
            </div>
            <div className="text-center p-4 bg-white/60 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{mostProductiveDay?.day || "N/A"}</div>
              <div className="text-sm text-gray-600">Most Productive Day</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Focus Hours */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Icons.clock className="w-5 h-5 mr-2 text-blue-600" />
              Weekly Focus Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <XAxis dataKey="day" />
                  <YAxis />
                  <ChartTooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload[0]) {
                        return (
                          <div className="bg-white p-3 border rounded-lg shadow-lg">
                            <p className="font-medium">{label}</p>
                            <p className="text-blue-600">Focus: {payload[0].value}h</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="hours"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Daily Pomodoros */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Icons.timer className="w-5 h-5 mr-2 text-green-600" />
              Daily Pomodoros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <XAxis dataKey="day" />
                  <YAxis />
                  <ChartTooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload[0]) {
                        return (
                          <div className="bg-white p-3 border rounded-lg shadow-lg">
                            <p className="font-medium">{label}</p>
                            <p className="text-green-600">Sessions: {payload[0].value}</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="pomodoros" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Focus Time by Category */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Icons.target className="w-5 h-5 mr-2 text-purple-600" />
              Focus Time by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={focusTimeByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {focusTimeByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload[0]) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-white p-3 border rounded-lg shadow-lg">
                            <p className="font-medium">{data.name}</p>
                            <p className="text-sm text-gray-600">
                              {data.hours}h ({data.value}%)
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {focusTimeByCategory.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-gray-600">{item.name}</span>
                  <span className="text-sm font-medium">{item.hours}h</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Task Priority Distribution */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Icons.zap className="w-5 h-5 mr-2 text-orange-600" />
              Priority Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {priorityDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload[0]) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-white p-3 border rounded-lg shadow-lg">
                            <p className="font-medium">{data.name} Priority</p>
                            <p className="text-sm text-gray-600">
                              {data.count} tasks ({data.value}%)
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {priorityDistribution.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-gray-600">{item.name}</span>
                  <span className="text-sm font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
