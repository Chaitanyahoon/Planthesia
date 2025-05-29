"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Icons } from "@/components/icons"
import { useData } from "@/components/local-data-provider"

export function QuickStats() {
  const { stats, tasks, pomodoros } = useData()

  const todayTasks = tasks.filter((task) => {
    const today = new Date().toISOString().split("T")[0]
    return task.completedAt && task.completedAt.split("T")[0] === today
  }).length

  const todayPomodoros = pomodoros.filter((session) => {
    const today = new Date().toISOString().split("T")[0]
    return session.startTime.split("T")[0] === today && session.completed
  }).length

  const todayFocusTime =
    pomodoros
      .filter((session) => {
        const today = new Date().toISOString().split("T")[0]
        return session.startTime.split("T")[0] === today && session.completed
      })
      .reduce((sum, session) => sum + session.duration, 0) / 60 // Convert to hours

  const completionRate = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0

  const statsData = [
    {
      title: "Tasks Today",
      value: todayTasks.toString(),
      total: `${stats.completedTasks} total`,
      icon: Icons.target,
      color: "from-green-500 to-emerald-600",
    },
    {
      title: "Pomodoros Today",
      value: todayPomodoros.toString(),
      total: `${stats.totalPomodoros} total`,
      icon: Icons.timer,
      color: "from-blue-500 to-cyan-600",
    },
    {
      title: "Focus Time Today",
      value: `${todayFocusTime.toFixed(1)}h`,
      total: `${(stats.totalFocusTime / 60).toFixed(1)}h total`,
      icon: Icons.clock,
      color: "from-purple-500 to-violet-600",
    },
    {
      title: "Completion Rate",
      value: `${completionRate}%`,
      total: `${stats.streak} day streak`,
      icon: Icons.trendingUp,
      color: "from-orange-500 to-red-600",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsData.map((stat, index) => (
        <Card
          key={index}
          className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.total}</p>
              </div>
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
