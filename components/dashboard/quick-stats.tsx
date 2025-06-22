"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Icons } from "@/components/icons"
import { useData } from "@/components/local-data-provider"

export function QuickStats() {
  const { stats, tasks, pomodoros } = useData()

  const today = new Date().toISOString().split("T")[0]

  const todayTasks = tasks.filter((task) => {
    return task.completedAt && task.completedAt.split("T")[0] === today
  }).length

  const todayPomodoros = pomodoros.filter((session) => {
    return session.startTime.split("T")[0] === today && session.completed
  }).length

  const todayFocusTime =
    pomodoros
      .filter((session) => {
        return session.startTime.split("T")[0] === today && session.completed
      })
      .reduce((sum, session) => sum + session.duration, 0) / 60 // Convert to hours

  const completionRate = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0

  const statsData = [
    {
      title: "Tasks Bloomed",
      subtitle: "Today's Growth",
      value: todayTasks.toString(),
      total: `${stats.completedTasks} total harvest`,
      icon: Icons.flower,
      color: "from-green-500 to-emerald-600",
      bgColor: "from-green-50 to-emerald-50",
      progress: Math.min((todayTasks / 5) * 100, 100), // Goal of 5 tasks per day
    },
    {
      title: "Focus Sessions",
      subtitle: "Deep Work Grove",
      value: todayPomodoros.toString(),
      total: `${stats.totalPomodoros} total sessions`,
      icon: Icons.tree,
      color: "from-blue-500 to-cyan-600",
      bgColor: "from-blue-50 to-cyan-50",
      progress: Math.min((todayPomodoros / 8) * 100, 100), // Goal of 8 sessions per day
    },
    {
      title: "Growth Time",
      subtitle: "Today's Cultivation",
      value: `${todayFocusTime.toFixed(1)}h`,
      total: `${(stats.totalFocusTime / 60).toFixed(1)}h total focus`,
      icon: Icons.sun,
      color: "from-purple-500 to-violet-600",
      bgColor: "from-purple-50 to-violet-50",
      progress: Math.min((todayFocusTime / 4) * 100, 100), // Goal of 4 hours per day
    },
    {
      title: "Success Rate",
      subtitle: "Garden Health",
      value: `${completionRate}%`,
      total: `${stats.streak} day streak`,
      icon: Icons.sprout,
      color: "from-orange-500 to-red-600",
      bgColor: "from-orange-50 to-red-50",
      progress: completionRate,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat, index) => (
        <Card
          key={index}
          className="card-premium border-0 shadow-organic-lg hover:shadow-organic-xl transition-all duration-500 overflow-hidden group animate-grow-in"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <CardContent className="p-6 relative">
            {/* Background Pattern */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} opacity-30 group-hover:opacity-40 transition-opacity duration-300`}
            ></div>

            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.subtitle}</p>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{stat.title}</h3>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-bold text-gradient-primary">{stat.value}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 font-medium">{stat.total}</p>
                </div>

                <div
                  className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center shadow-organic group-hover:scale-110 transition-transform duration-300`}
                >
                  <stat.icon className="w-7 h-7 text-white drop-shadow-sm" />
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-gray-600">Daily Goal</span>
                  <span className="text-gray-700">{Math.round(stat.progress)}%</span>
                </div>
                <div className="progress-organic h-2 rounded-full overflow-hidden">
                  <div
                    className="progress-fill h-full transition-all duration-1000 ease-out"
                    style={{ width: `${stat.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Floating decoration */}
            <div className="absolute top-4 right-4 w-2 h-2 bg-white/40 rounded-full animate-pulse"></div>
            <div
              className="absolute bottom-6 left-4 w-1 h-1 bg-white/30 rounded-full animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
