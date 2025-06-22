"use client"
import { TaskCalendar } from "@/components/dashboard/task-calendar"
import { TaskList } from "@/components/dashboard/task-list"
import { PomodoroTimer } from "@/components/dashboard/pomodoro-timer"
import { QuickStats } from "@/components/dashboard/quick-stats"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { MotivationalQuote } from "@/components/dashboard/motivational-quote"
import { Icons } from "@/components/icons"
import { useState, useEffect } from "react"

export default function DashboardPage() {
  // Add state and effect for dynamic date updates
  const [currentDate, setCurrentDate] = useState(new Date())

  // Update date every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date())
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-growth-gradient bg-leaf-pattern">
      <div className="space-y-8 p-8">
        {/* Header Section */}
        <div className="flex items-center justify-between animate-grow-in">
          <div>
            <h1 className="bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent text-4xl font-bold mb-2">
              Growth Hub 🌱
            </h1>
            <p className="text-lg text-slate-600 font-medium">
              Welcome back! Let's nurture your productivity garden today.
            </p>
          </div>

          {/* Weather/Time Widget */}
          <div className="card-premium px-6 py-4 rounded-2xl shadow-organic">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Icons.sun className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Perfect Growing Weather</p>
                <p className="text-lg font-bold text-gray-900">
                  {currentDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Motivational Quote */}
        <MotivationalQuote />

        {/* Quick Stats */}
        <QuickStats />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="xl:col-span-2 space-y-8">
            <TaskCalendar />
            <RecentActivity />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            <PomodoroTimer />
            <TaskList />
          </div>
        </div>

        {/* Quick Action Menu */}
        <div className="fixed bottom-8 right-8 z-50">
          <div className="relative group">
            {/* Main FAB */}
            <button className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-organic-xl hover:shadow-organic-xl hover:scale-110 transition-all duration-300 flex items-center justify-center group animate-pulse-glow">
              <Icons.plus className="w-8 h-8 text-white group-hover:rotate-90 transition-transform duration-300" />
            </button>

            {/* Tooltip */}
            <div className="absolute bottom-full right-0 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="bg-slate-800 text-white text-sm px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                Quick Actions
                <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
              </div>
            </div>

            {/* Quick action buttons (hidden by default, can be expanded later) */}
            <div className="absolute bottom-20 right-0 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto">
              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => (window.location.href = "/dashboard/tasks")}
                  className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center hover:scale-110"
                  title="Add Task"
                >
                  <Icons.leaf className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={() => (window.location.href = "/dashboard/pomodoro")}
                  className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center hover:scale-110"
                  title="Start Focus Session"
                >
                  <Icons.timer className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={() => (window.location.href = "/dashboard/calendar")}
                  className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center hover:scale-110"
                  title="Schedule Task"
                >
                  <Icons.calendar className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
