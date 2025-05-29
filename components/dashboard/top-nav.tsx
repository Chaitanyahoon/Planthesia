"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Icons } from "@/components/icons"
import { useData } from "@/components/local-data-provider"

interface TopNavProps {
  onAIAssistantClick: () => void
}

export function TopNav({ onAIAssistantClick }: TopNavProps) {
  const { tasks } = useData()

  const pendingTasks = tasks.filter((task) => !task.completed).length
  const todayTasks = tasks.filter((task) => {
    const today = new Date().toISOString().split("T")[0]
    return task.dueDate === today && !task.completed
  }).length

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative max-w-md">
            <Icons.search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search tasks, projects..."
              className="pl-10 bg-gray-50/50 border-gray-200 focus:bg-white focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>

          {todayTasks > 0 && (
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">{todayTasks} due today</Badge>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <Button
            onClick={onAIAssistantClick}
            className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Icons.sparkles className="w-4 h-4 mr-2" />✨ AI Assistant
          </Button>

          <div className="relative">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <Icons.bell className="w-5 h-5 text-gray-600" />
            </Button>
            {pendingTasks > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                {pendingTasks > 9 ? "9+" : pendingTasks}
              </Badge>
            )}
          </div>

          <Button variant="ghost" size="icon" className="rounded-xl">
            <Icons.settings className="w-5 h-5 text-gray-600" />
          </Button>
        </div>
      </div>
    </header>
  )
}
