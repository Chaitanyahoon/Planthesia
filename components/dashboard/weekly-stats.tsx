"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/icons"
import { useData } from "@/components/local-data-provider"

export function WeeklyStats() {
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
        focusTime: dayFocusTime,
      })
    }

    return weekData
  }

  const weeklyData = getWeeklyData()
  const totalPomodoros = weeklyData.reduce((sum, day) => sum + day.pomodoros, 0)
  const totalTasks = weeklyData.reduce((sum, day) => sum + day.tasks, 0)
  const totalHours = weeklyData.reduce((sum, day) => sum + day.focusTime, 0)

  // Calculate percentage changes (mock data for demo)
  const pomodoroChange = totalPomodoros > 0 ? "+12%" : "0%"
  const taskChange = totalTasks > 0 ? "+8%" : "0%"
  const hoursChange = totalHours > 0 ? "+15%" : "0%"

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Weekly Pomodoros</CardTitle>
          <Icons.timer className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalPomodoros}</div>
          <p className="text-xs text-emerald-600">{pomodoroChange} from last week</p>
          <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full transition-all duration-500"
              style={{ width: totalPomodoros > 0 ? "75%" : "0%" }}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
          <Icons.target className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalTasks}</div>
          <p className="text-xs text-emerald-600">{taskChange} from last week</p>
          <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-500"
              style={{ width: totalTasks > 0 ? "82%" : "0%" }}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Focus Hours</CardTitle>
          <Icons.clock className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalHours.toFixed(1)}h</div>
          <p className="text-xs text-emerald-600">{hoursChange} from last week</p>
          <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-violet-600 rounded-full transition-all duration-500"
              style={{ width: totalHours > 0 ? "68%" : "0%" }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
