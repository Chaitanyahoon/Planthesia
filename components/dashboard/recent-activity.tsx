"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Icons } from "@/components/icons"
import { useData } from "@/components/local-data-provider"

export function RecentActivity() {
  const { tasks, pomodoros } = useData()

  // Get recent activities (last 10 items)
  const recentTasks = tasks
    .filter((task) => task.completedAt)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
    .slice(0, 5)

  const recentPomodoros = pomodoros
    .filter((session) => session.completed)
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
    .slice(0, 5)

  // Combine and sort all activities
  const activities = [
    ...recentTasks.map((task) => ({
      id: task.id,
      type: "task" as const,
      title: `Completed: ${task.title}`,
      time: task.completedAt!,
      category: task.category,
      priority: task.priority,
    })),
    ...recentPomodoros.map((session) => ({
      id: session.id,
      type: "pomodoro" as const,
      title: `Completed ${session.duration}min focus session`,
      time: session.startTime,
      category: "focus" as const,
      priority: "medium" as const,
    })),
  ]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 8)

  const getActivityIcon = (type: string) => {
    return type === "task" ? Icons.target : Icons.timer
  }

  const getActivityColor = (type: string) => {
    return type === "task" ? "text-green-600" : "text-blue-600"
  }

  const formatTime = (timeString: string) => {
    const date = new Date(timeString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60)
      return `${diffInMinutes}m ago`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays}d ago`
    }
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center">
          <Icons.clock className="w-5 h-5 mr-2 text-emerald-600" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Icons.clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No activity yet</h3>
            <p className="text-gray-600">Complete tasks or pomodoro sessions to see your activity here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const ActivityIcon = getActivityIcon(activity.type)
              return (
                <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div
                    className={`w-8 h-8 rounded-full bg-white flex items-center justify-center ${getActivityColor(activity.type)}`}
                  >
                    <ActivityIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-500">{formatTime(activity.time)}</span>
                      {activity.type === "task" && (
                        <Badge variant="outline" className="text-xs">
                          {activity.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
