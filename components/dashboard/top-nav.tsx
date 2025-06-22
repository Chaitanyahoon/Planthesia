"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Icons } from "@/components/icons"
import { useData } from "@/components/local-data-provider"
import { useState } from "react"
import { DataInfoModal } from "@/components/data-info-modal"

interface TopNavProps {
  onAIAssistantClick: () => void
}

export function TopNav({ onAIAssistantClick }: TopNavProps) {
  const { tasks, pomodoros } = useData()
  const [isDataInfoOpen, setIsDataInfoOpen] = useState(false)

  const pendingTasks = tasks.filter((task) => !task.completed).length
  const todayTasks = tasks.filter((task) => {
    const today = new Date().toISOString().split("T")[0]
    return task.dueDate === today && !task.completed
  })

  const todayTasksCount = todayTasks.length

  const overdueTasks = tasks.filter((task) => {
    const today = new Date().toISOString().split("T")[0]
    return task.dueDate && task.dueDate < today && !task.completed
  })

  const recentCompletions = tasks.filter((task) => {
    const today = new Date().toISOString().split("T")[0]
    return task.completedAt && task.completedAt.split("T")[0] === today
  })

  const todayPomodoros = pomodoros.filter((session) => {
    const today = new Date().toISOString().split("T")[0]
    return session.startTime.split("T")[0] === today && session.completed
  }).length

  // Create notifications
  const notifications = [
    ...overdueTasks.map((task) => ({
      id: `overdue-${task.id}`,
      type: "warning" as const,
      title: "🍂 Wilting Task",
      message: `"${task.title}" needs attention - overdue since ${new Date(task.dueDate!).toLocaleDateString()}`,
      time: task.dueDate!,
      priority: task.priority,
    })),
    ...todayTasks.map((task) => ({
      id: `due-today-${task.id}`,
      type: "info" as const,
      title: "🌱 Ready to Bloom",
      message: `"${task.title}" is ready for completion today`,
      time: task.dueDate!,
      priority: task.priority,
    })),
    ...recentCompletions.slice(0, 3).map((task) => ({
      id: `completed-${task.id}`,
      type: "success" as const,
      title: "🌸 Task Bloomed",
      message: `You successfully grew "${task.title}" to completion!`,
      time: task.completedAt!,
      priority: task.priority,
    })),
  ]

  // Add Pomodoro milestone notifications
  if (todayPomodoros >= 4) {
    notifications.unshift({
      id: "pomodoro-milestone",
      type: "success" as const,
      title: "🌳 Focus Forest Milestone!",
      message: `You've cultivated ${todayPomodoros} focus sessions today - your productivity forest is thriving!`,
      time: new Date().toISOString(),
      priority: "medium" as const,
    })
  }

  const unreadCount = notifications.length

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <Icons.droplets className="w-4 h-4 text-orange-500" />
      case "info":
        return <Icons.sun className="w-4 h-4 text-blue-500" />
      case "success":
        return <Icons.flower className="w-4 h-4 text-green-500" />
      default:
        return <Icons.bell className="w-4 h-4 text-gray-500" />
    }
  }

  const getNotificationBg = (type: string) => {
    switch (type) {
      case "warning":
        return "bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200/50"
      case "info":
        return "bg-gradient-to-r from-blue-50 to-sky-50 border-blue-200/50"
      case "success":
        return "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200/50"
      default:
        return "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200/50"
    }
  }

  const formatNotificationTime = (timeString: string) => {
    const date = new Date(timeString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60)
      return `${diffInMinutes}m ago`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50 px-8 py-5 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6 flex-1">
          {/* Status Badges */}
          <div className="flex items-center space-x-3">
            {todayTasksCount > 0 && (
              <Badge className="badge-organic px-4 py-2 rounded-2xl shadow-organic micro-scale">
                <Icons.seedling className="w-3 h-3 mr-2" />
                {todayTasksCount} ready to bloom
              </Badge>
            )}

            {overdueTasks.length > 0 && (
              <Badge className="bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-700 border-orange-200/50 px-4 py-2 rounded-2xl shadow-organic micro-scale">
                <Icons.droplets className="w-3 h-3 mr-2" />
                {overdueTasks.length} need water
              </Badge>
            )}

            {pendingTasks > 0 && (
              <Badge className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-blue-200/50 px-4 py-2 rounded-2xl shadow-organic micro-scale">
                <Icons.tasks className="w-3 h-3 mr-2" />
                {pendingTasks} pending tasks
              </Badge>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-4">
          {/* AI Assistant Button */}
          <Button
            onClick={onAIAssistantClick}
            className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 px-6 py-3 rounded-2xl font-semibold text-white shadow-lg relative overflow-hidden group"
          >
            <div className="flex items-center space-x-2 relative z-10">
              <Icons.sparkles className="w-4 h-4" />
              <span>🌟 Growth AI</span>
            </div>
          </Button>

          {/* Garden Info Button */}
          <Button
            onClick={() => setIsDataInfoOpen(true)}
            className="bg-white/60 backdrop-blur-sm border border-slate-200/50 hover:bg-white/80 hover:border-slate-300/50 px-5 py-3 rounded-2xl font-medium text-slate-700 micro-bounce"
          >
            <Icons.leaf className="w-4 h-4 mr-2" />
            Garden Info
          </Button>

          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative w-12 h-12 rounded-2xl hover:bg-slate-50/50 transition-all duration-300 micro-scale"
              >
                <Icons.bell className="w-5 h-5 text-green-600" />
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse-glow shadow-organic">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </div>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-96 p-0 rounded-3xl border-green-200/30 shadow-organic-xl glass-heavy"
              align="end"
            >
              {/* Header */}
              <div className="p-6 border-b border-green-100/50 bg-gradient-to-r from-green-50/50 to-emerald-50/30 rounded-t-3xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                    <Icons.flower className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-green-800 text-lg">Garden Updates</h3>
                    <p className="text-sm text-green-600">{unreadCount} new growth notifications</p>
                  </div>
                </div>
              </div>

              {/* Notifications List */}
              <ScrollArea className="h-80">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                      <Icons.seedling className="w-8 h-8 text-green-500" />
                    </div>
                    <h4 className="font-semibold text-green-700 mb-2">Your garden is peaceful</h4>
                    <p className="text-sm text-green-600">All tasks are growing beautifully 🌿</p>
                  </div>
                ) : (
                  <div className="p-4 space-y-3">
                    {notifications.map((notification, index) => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-2xl border ${getNotificationBg(notification.type)} hover:shadow-organic transition-all duration-200 animate-grow-in`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
                              <span className="text-xs text-gray-500 font-medium">
                                {formatNotificationTime(notification.time)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed">{notification.message}</p>
                            {notification.priority && (
                              <Badge
                                className={`mt-3 text-xs rounded-xl ${
                                  notification.priority === "high"
                                    ? "bg-red-50 border-red-200 text-red-700"
                                    : notification.priority === "medium"
                                      ? "bg-yellow-50 border-yellow-200 text-yellow-700"
                                      : "bg-green-50 border-green-200 text-green-700"
                                }`}
                              >
                                {notification.priority} priority
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-4 border-t border-green-100/50 bg-gradient-to-r from-green-50/30 to-emerald-50/20 rounded-b-3xl">
                  <Button
                    variant="ghost"
                    className="w-full text-sm text-green-600 hover:text-green-700 hover:bg-green-50/50 rounded-2xl font-medium py-3"
                  >
                    Mark all as read
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>

          {/* Settings */}
          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12 rounded-2xl hover:bg-slate-50/50 transition-all duration-300 micro-scale"
          >
            <Icons.settings className="w-5 h-5 text-green-600" />
          </Button>
        </div>
      </div>

      <DataInfoModal isOpen={isDataInfoOpen} onClose={() => setIsDataInfoOpen(false)} />
    </header>
  )
}
