"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Icons } from "@/components/icons"
import { useData } from "@/components/local-data-provider"

export function WeeklyStats() {
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
        focusTime: dayFocusTime,
      })
    }

    return weekData
  }

  const weeklyData = getWeeklyData()
  const totalPomodoros = weeklyData.reduce((sum, day) => sum + day.pomodoros, 0)
  const totalTasks = weeklyData.reduce((sum, day) => sum + day.tasks, 0)
  const totalHours = weeklyData.reduce((sum, day) => sum + day.focusTime, 0)

  // Calculate real percentage changes from previous week
  const getPreviousWeekData = () => {
    const today = new Date()
    let prevWeekTasks = 0
    let prevWeekPomodoros = 0
    let prevWeekHours = 0

    for (let i = 13; i >= 7; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      const dateString = date.toISOString().split("T")[0]

      prevWeekTasks += tasks.filter((task) => task.completedAt && task.completedAt.split("T")[0] === dateString).length
      prevWeekPomodoros += pomodoros.filter(
        (session) => session.completed && session.startTime.split("T")[0] === dateString,
      ).length
      prevWeekHours +=
        pomodoros
          .filter((session) => session.completed && session.startTime.split("T")[0] === dateString)
          .reduce((sum, session) => sum + session.duration, 0) / 60
    }

    return { prevWeekTasks, prevWeekPomodoros, prevWeekHours }
  }

  const { prevWeekTasks, prevWeekPomodoros, prevWeekHours } = getPreviousWeekData()

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? "+100%" : "0%"
    const change = ((current - previous) / previous) * 100
    return change >= 0 ? `+${Math.round(change)}%` : `${Math.round(change)}%`
  }

  const pomodoroChange = calculateChange(totalPomodoros, prevWeekPomodoros)
  const taskChange = calculateChange(totalTasks, prevWeekTasks)
  const hoursChange = calculateChange(totalHours, prevWeekHours)

  // Calculate progress towards weekly goals
  const weeklyGoals = {
    pomodoros: 28, // 4 per day
    tasks: 21, // 3 per day
    hours: 14, // 2 hours per day
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Weekly Pomodoros</CardTitle>
          <Icons.timer className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalPomodoros}</div>
          <p
            className={`text-xs ${pomodoroChange.startsWith("+") ? "text-emerald-600" : pomodoroChange.startsWith("-") ? "text-red-600" : "text-gray-600"}`}
          >
            {pomodoroChange} from last week
          </p>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Goal: {weeklyGoals.pomodoros}</span>
              <span>{Math.round((totalPomodoros / weeklyGoals.pomodoros) * 100)}%</span>
            </div>
            <Progress value={(totalPomodoros / weeklyGoals.pomodoros) * 100} className="h-2" />
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
          <p
            className={`text-xs ${taskChange.startsWith("+") ? "text-emerald-600" : taskChange.startsWith("-") ? "text-red-600" : "text-gray-600"}`}
          >
            {taskChange} from last week
          </p>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Goal: {weeklyGoals.tasks}</span>
              <span>{Math.round((totalTasks / weeklyGoals.tasks) * 100)}%</span>
            </div>
            <Progress value={(totalTasks / weeklyGoals.tasks) * 100} className="h-2" />
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
          <p
            className={`text-xs ${hoursChange.startsWith("+") ? "text-emerald-600" : hoursChange.startsWith("-") ? "text-red-600" : "text-gray-600"}`}
          >
            {hoursChange} from last week
          </p>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Goal: {weeklyGoals.hours}h</span>
              <span>{Math.round((totalHours / weeklyGoals.hours) * 100)}%</span>
            </div>
            <Progress value={(totalHours / weeklyGoals.hours) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
