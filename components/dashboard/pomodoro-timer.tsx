"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Icons } from "@/components/icons"
import { useData } from "@/components/local-data-provider"
import { useToast } from "@/hooks/use-toast"

export function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [sessionStartTime, setSessionStartTime] = useState<string | null>(null)
  const [sessionCount, setSessionCount] = useState(0)
  const [selectedTask, setSelectedTask] = useState<string>("general")
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const { addPomodoro, pomodoros, tasks } = useData()
  const { toast } = useToast()

  const pendingTasks = tasks.filter((task) => !task.completed)
  const todaySessions = pomodoros.filter((session) => {
    const today = new Date().toISOString().split("T")[0]
    return session.startTime.split("T")[0] === today && session.completed
  }).length

  // Clear interval on unmount and when dependencies change
  const clearCurrentInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      clearCurrentInterval()
    }
  }, [clearCurrentInterval])

  const handleTimerComplete = useCallback(() => {
    if (!isBreak && sessionStartTime) {
      // Complete focus session
      addPomodoro({
        startTime: sessionStartTime,
        endTime: new Date().toISOString(),
        duration: 25,
        taskId: selectedTask === "general" ? undefined : selectedTask,
        completed: true,
      })

      const newSessionCount = sessionCount + 1
      setSessionCount(newSessionCount)

      toast({
        title: "Focus session completed! 🎉",
        description: `Great job! You've completed ${newSessionCount} sessions today.`,
      })

      // Start break
      setIsBreak(true)
      const breakDuration = newSessionCount % 4 === 0 ? 15 : 5 // Long break every 4 sessions
      setTimeLeft(breakDuration * 60)
      setSessionStartTime(null)
    } else if (isBreak) {
      // Break completed
      const isLongBreak = sessionCount % 4 === 0
      toast({
        title: isLongBreak ? "Long break over! 💪" : "Break time over! ⚡",
        description: "Ready for another focused session?",
      })

      setIsBreak(false)
      setTimeLeft(25 * 60) // Back to 25 minutes
    }
  }, [isBreak, sessionStartTime, sessionCount, selectedTask, addPomodoro, toast])

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
      clearCurrentInterval()
    }

    return () => {
      clearCurrentInterval()
    }
  }, [isActive, timeLeft, handleTimerComplete, clearCurrentInterval])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getTotalTime = () => {
    if (isBreak) {
      return sessionCount % 4 === 0 ? 15 * 60 : 5 * 60 // Long break or short break
    }
    return 25 * 60 // Focus time
  }

  const totalTime = getTotalTime()
  const progress = ((totalTime - timeLeft) / totalTime) * 100

  const handleStart = () => {
    setIsActive(true)
    if (!sessionStartTime && !isBreak) {
      setSessionStartTime(new Date().toISOString())
    }
  }

  const handlePause = () => {
    setIsActive(false)
  }

  const handleReset = () => {
    setIsActive(false)
    clearCurrentInterval()

    if (isBreak) {
      const breakDuration = sessionCount % 4 === 0 ? 15 : 5
      setTimeLeft(breakDuration * 60)
    } else {
      setTimeLeft(25 * 60)
      setSessionStartTime(null)
    }
  }

  const handleSkip = () => {
    setIsActive(false)
    clearCurrentInterval()

    if (isBreak) {
      // Skip break
      setIsBreak(false)
      setTimeLeft(25 * 60)
    } else {
      // Skip to break
      if (sessionStartTime) {
        addPomodoro({
          startTime: sessionStartTime,
          endTime: new Date().toISOString(),
          duration: Math.round((25 * 60 - timeLeft) / 60), // Partial session
          taskId: selectedTask === "general" ? undefined : selectedTask,
          completed: false,
        })
      }

      setIsBreak(true)
      const breakDuration = (sessionCount + 1) % 4 === 0 ? 15 : 5
      setTimeLeft(breakDuration * 60)
      setSessionStartTime(null)
    }
  }

  const getTaskTitle = (taskId?: string) => {
    if (!taskId) return "General Focus"
    const task = tasks.find((t) => t.id === taskId)
    return task ? task.title : "Deleted Task"
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center">
          <Icons.timer className="w-5 h-5 mr-2 text-emerald-600" />
          Pomodoro Timer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="relative w-32 h-32 mx-auto mb-4">
            <div
              className={`absolute inset-0 rounded-full ${
                isBreak
                  ? "bg-gradient-to-br from-green-100 to-emerald-100"
                  : "bg-gradient-to-br from-blue-100 to-violet-100"
              }`}
            ></div>
            <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center shadow-inner">
              <span className="text-2xl font-bold text-gray-900">{formatTime(timeLeft)}</span>
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

          <Progress value={progress} className="w-full h-2 mb-4" />

          <p className="text-sm text-gray-600 mb-4">
            {isBreak ? (sessionCount % 4 === 0 ? "Long Break 🌱" : "Short Break 🌱") : "Focus Time 🎯"}
          </p>

          {/* Task Selection */}
          {!isBreak && (
            <div className="mb-4">
              <Select value={selectedTask} onValueChange={setSelectedTask}>
                <SelectTrigger className="w-full text-sm">
                  <SelectValue placeholder="Select task" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Focus</SelectItem>
                  {pendingTasks.map((task) => (
                    <SelectItem key={task.id} value={task.id}>
                      {task.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Working on: {getTaskTitle(selectedTask === "general" ? undefined : selectedTask)}
              </p>
            </div>
          )}

          <div className="flex items-center justify-center space-x-2 mb-4">
            {!isActive ? (
              <Button
                onClick={handleStart}
                className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white rounded-lg"
              >
                <Icons.play className="w-4 h-4 mr-1" />
                Start
              </Button>
            ) : (
              <Button
                onClick={handlePause}
                className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white rounded-lg"
              >
                <Icons.pause className="w-4 h-4 mr-1" />
                Pause
              </Button>
            )}

            <Button onClick={handleReset} variant="outline" className="rounded-lg">
              <Icons.reset className="w-4 h-4 mr-1" />
              Reset
            </Button>

            <Button onClick={handleSkip} variant="outline" className="rounded-lg">
              <Icons.chevronRight className="w-4 h-4 mr-1" />
              Skip
            </Button>
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Sessions Today</span>
            <span className="text-lg font-bold text-emerald-600">{todaySessions}</span>
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-600">Until long break</span>
            <span className="text-xs font-medium">{4 - (sessionCount % 4)}</span>
          </div>
          <div className="flex items-center space-x-1">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-2 rounded-full ${i < (sessionCount % 4) ? "bg-emerald-600" : "bg-gray-200"}`}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
