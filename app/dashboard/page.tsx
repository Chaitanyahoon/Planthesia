"use client"

import { MotivationalQuote } from "@/components/dashboard/motivational-quote"
import { TaskCalendar } from "@/components/dashboard/task-calendar"
import { TaskList } from "@/components/dashboard/task-list"
import { PomodoroTimer } from "@/components/dashboard/pomodoro-timer"
import { QuickStats } from "@/components/dashboard/quick-stats"
import { RecentActivity } from "@/components/dashboard/recent-activity"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Welcome back! Let's make today productive.</p>
        </div>
      </div>

      <MotivationalQuote />
      <QuickStats />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <TaskCalendar />
          <RecentActivity />
        </div>

        <div className="space-y-6">
          <PomodoroTimer />
          <TaskList />
        </div>
      </div>
    </div>
  )
}
