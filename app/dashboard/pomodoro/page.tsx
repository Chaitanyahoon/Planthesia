"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Icons } from "@/components/icons"
import { useData } from "@/components/local-data-provider"
import { useToast } from "@/hooks/use-toast"

export default function PomodoroPage() {
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isActive, setIsActive] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [sessionStartTime, setSessionStartTime] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<string>("general")
  const [settings, setSettings] = useState({
    focusTime: 25,
    shortBreak: 5,
    longBreak: 15,
    sessionsUntilLongBreak: 4,
  })

  const { tasks, pomodoros, addPomodoro } = useData()
  const { toast } = useToast()

  const pendingTasks = tasks.filter((task) => !task.completed)
  const todaySessions = pomodoros.filter((session) => {
    const today = new Date().toISOString().split("T")[0]
    return session.startTime.split("T")[0] === today && session.completed
  })

  const completedSessionsToday = todaySessions.length
  const isLongBreakTime = completedSessionsToday > 0 && completedSessionsToday % settings.sessionsUntilLongBreak === 0

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Clear interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            setIsActive(false)
            handleTimerComplete()
            return 0
          }
          return prevTime - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isActive, timeLeft])

  const handleTimerComplete = () => {
    if (!isBreak && sessionStartTime) {
      // Complete focus session
      addPomodoro({
        startTime: sessionStartTime,
        endTime: new Date().toISOString(),
        duration: settings.focusTime,
        taskId: selectedTask === "general" ? undefined : selectedTask,
        completed: true,
      })

      toast({
        title: "Focus session completed! 🎉",
        description: `Great job! You've completed ${completedSessionsToday + 1} sessions today.`,
      })

      setIsBreak(true)
      const breakDuration = isLongBreakTime ? settings.longBreak : settings.shortBreak
      setTimeLeft(breakDuration * 60)
    } else {
      // Break completed
      toast({
        title: isLongBreakTime ? "Long break over! 💪" : "Break time over! ⚡",
        description: "Ready for another focused session?",
      })

      setIsBreak(false)
      setTimeLeft(settings.focusTime * 60)
    }

    setSessionStartTime(null)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getCurrentSessionDuration = () => {
    if (isBreak) {
      return isLongBreakTime ? settings.longBreak * 60 : settings.shortBreak * 60
    }
    return settings.focusTime * 60
  }

  const totalTime = getCurrentSessionDuration()
  const progress = ((totalTime - timeLeft) / totalTime) * 100

  const handleStart = () => {
    setIsActive(true)
    if (!sessionStartTime && !isBreak) {
      setSessionStartTime(new Date().toISOString())
    }
  }

  const handlePause = () => setIsActive(false)

  const handleReset = () => {
    setIsActive(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setTimeLeft(getCurrentSessionDuration())
    setSessionStartTime(null)
  }

  const getSessionHistory = () => {
    return pomodoros
      .filter((session) => session.completed)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, 10)
  }

  const getTaskTitle = (taskId?: string) => {
    if (!taskId) return "General Focus"
    const task = tasks.find((t) => t.id === taskId)
    return task ? task.title : "Deleted Task"
  }

  // Get task analytics
  const getTaskAnalytics = () => {
    const taskStats = new Map()

    pomodoros.forEach((session) => {
      if (session.completed) {
        const taskId = session.taskId || "general"
        const taskTitle = getTaskTitle(session.taskId)

        if (!taskStats.has(taskId)) {
          taskStats.set(taskId, {
            title: taskTitle,
            sessions: 0,
            totalTime: 0,
            category: session.taskId ? tasks.find((t) => t.id === session.taskId)?.category || "unknown" : "general",
          })
        }

        const stats = taskStats.get(taskId)
        stats.sessions += 1
        stats.totalTime += session.duration
      }
    })

    return Array.from(taskStats.values())
      .sort((a, b) => b.totalTime - a.totalTime)
      .slice(0, 5)
  }

  const taskAnalytics = getTaskAnalytics()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Pomodoro Focus
          </h1>
          <p className="text-gray-600 mt-1">Stay focused with the Pomodoro Technique.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Timer */}
        <div className="lg:col-span-2">
          <Card className="bg-gradient-to-br from-white/90 to-blue-50/50 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold flex items-center justify-center">
                <Icons.timer className="w-6 h-6 mr-3 text-emerald-600" />
                {isBreak ? (isLongBreakTime ? "Long Break" : "Short Break") : "Focus Session"}
              </CardTitle>
              {!isBreak && selectedTask && (
                <p className="text-gray-600 mt-2">
                  Working on: {getTaskTitle(selectedTask === "general" ? undefined : selectedTask)}
                </p>
              )}
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Timer Display */}
              <div className="text-center">
                <div className="relative w-48 h-48 mx-auto mb-6">
                  <div
                    className={`absolute inset-0 rounded-full ${
                      isBreak
                        ? "bg-gradient-to-br from-green-100 to-emerald-100"
                        : "bg-gradient-to-br from-blue-100 to-violet-100"
                    }`}
                  ></div>
                  <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-4xl font-bold text-gray-900">{formatTime(timeLeft)}</span>
                  </div>
                  {/* Progress Ring */}
                  <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      className="text-gray-200"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 45}`}
                      strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                      className={isBreak ? "text-emerald-500" : "text-blue-500"}
                      style={{ transition: "stroke-dashoffset 0.5s ease-in-out" }}
                    />
                  </svg>
                </div>

                <Progress value={progress} className="w-full h-3 mb-6" />

                {/* Controls */}
                <div className="flex items-center justify-center space-x-4">
                  {!isActive ? (
                    <Button
                      onClick={handleStart}
                      size="lg"
                      className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl text-lg font-medium"
                    >
                      <Icons.play className="w-5 h-5 mr-2" />
                      Start
                    </Button>
                  ) : (
                    <Button
                      onClick={handlePause}
                      size="lg"
                      className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white px-8 py-3 rounded-xl text-lg font-medium"
                    >
                      <Icons.pause className="w-5 h-5 mr-2" />
                      Pause
                    </Button>
                  )}

                  <Button onClick={handleReset} variant="outline" size="lg" className="px-8 py-3 rounded-xl">
                    <Icons.reset className="w-5 h-5 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>

              {/* Task Selection */}
              {!isBreak && (
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Focus on a specific task (optional)
                  </label>
                  <Select value={selectedTask} onValueChange={setSelectedTask}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a task or focus generally" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Focus Session</SelectItem>
                      {pendingTasks.map((task) => (
                        <SelectItem key={task.id} value={task.id}>
                          {task.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Today's Stats */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Today's Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Completed Sessions</span>
                <Badge className="bg-emerald-100 text-emerald-700 text-lg px-3 py-1">{completedSessionsToday}</Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Until long break</span>
                  <span>
                    {settings.sessionsUntilLongBreak - (completedSessionsToday % settings.sessionsUntilLongBreak)}
                  </span>
                </div>
                <Progress
                  value={
                    ((completedSessionsToday % settings.sessionsUntilLongBreak) / settings.sessionsUntilLongBreak) * 100
                  }
                  className="h-2"
                />
              </div>

              <div className="grid grid-cols-4 gap-1 mt-4">
                {[...Array(settings.sessionsUntilLongBreak)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-3 rounded-full ${
                      i < (completedSessionsToday % settings.sessionsUntilLongBreak) ? "bg-emerald-500" : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Task Analytics */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Focus Analytics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {taskAnalytics.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No focus sessions yet</p>
              ) : (
                taskAnalytics.map((task, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900 truncate">{task.title}</p>
                      <p className="text-xs text-gray-600">
                        {task.sessions} sessions • {(task.totalTime / 60).toFixed(1)}h
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {task.sessions}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Settings */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Timer Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Focus Time (minutes)</label>
                <Select
                  value={settings.focusTime.toString()}
                  onValueChange={(value) => setSettings({ ...settings, focusTime: Number.parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="25">25 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Short Break (minutes)</label>
                <Select
                  value={settings.shortBreak.toString()}
                  onValueChange={(value) => setSettings({ ...settings, shortBreak: Number.parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 minutes</SelectItem>
                    <SelectItem value="10">10 minutes</SelectItem>
                    <SelectItem value="15">15 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Long Break (minutes)</label>
                <Select
                  value={settings.longBreak.toString()}
                  onValueChange={(value) => setSettings({ ...settings, longBreak: Number.parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="20">20 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Session History */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Recent Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="today" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-lg">
              <TabsTrigger value="today" className="rounded-md">
                Today
              </TabsTrigger>
              <TabsTrigger value="all" className="rounded-md">
                All Time
              </TabsTrigger>
            </TabsList>

            <TabsContent value="today" className="mt-4">
              {todaySessions.length === 0 ? (
                <div className="text-center py-8">
                  <Icons.timer className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No sessions completed today yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todaySessions.map((session, index) => (
                    <div key={session.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                        <Icons.timer className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{getTaskTitle(session.taskId)}</p>
                        <p className="text-sm text-gray-600">
                          {session.duration} minutes • {new Date(session.startTime).toLocaleTimeString()}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
                        Completed
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="all" className="mt-4">
              {getSessionHistory().length === 0 ? (
                <div className="text-center py-8">
                  <Icons.timer className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No sessions completed yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getSessionHistory().map((session) => (
                    <div key={session.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Icons.timer className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{getTaskTitle(session.taskId)}</p>
                        <p className="text-sm text-gray-600">
                          {session.duration} minutes • {new Date(session.startTime).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline">{session.duration}m</Badge>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
