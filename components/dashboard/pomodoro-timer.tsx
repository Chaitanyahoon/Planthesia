"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Icons } from "@/components/icons"
import { useData } from "@/components/local-data-provider"
import { useToast } from "@/hooks/use-toast"

export function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [sessionStartTime, setSessionStartTime] = useState<string | null>(null)
  const { addPomodoro, pomodoros } = useData()
  const { toast } = useToast()

  const todaySessions = pomodoros.filter((session) => {
    const today = new Date().toISOString().split("T")[0]
    return session.startTime.split("T")[0] === today && session.completed
  }).length

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((timeLeft) => timeLeft - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      setIsActive(false)

      if (!isBreak && sessionStartTime) {
        // Complete focus session
        addPomodoro({
          startTime: sessionStartTime,
          endTime: new Date().toISOString(),
          duration: 25,
          completed: true,
        })

        toast({
          title: "Focus session completed! 🎉",
          description: "Great job! Time for a well-deserved break.",
        })

        setIsBreak(true)
        setTimeLeft(5 * 60) // 5 minute break
      } else {
        // Break completed
        toast({
          title: "Break time over!",
          description: "Ready for another focus session?",
        })

        setIsBreak(false)
        setTimeLeft(25 * 60) // Back to 25 minutes
      }

      setSessionStartTime(null)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timeLeft, isBreak, sessionStartTime, addPomodoro, toast])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const totalTime = isBreak ? 5 * 60 : 25 * 60
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
    setTimeLeft(isBreak ? 5 * 60 : 25 * 60)
    setSessionStartTime(null)
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
              className={`absolute inset-0 rounded-full ${isBreak ? "bg-gradient-to-br from-green-100 to-emerald-100" : "bg-gradient-to-br from-blue-100 to-violet-100"}`}
            ></div>
            <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-900">{formatTime(timeLeft)}</span>
            </div>
          </div>

          <Progress value={progress} className="w-full h-2 mb-4" />

          <p className="text-sm text-gray-600 mb-2">{isBreak ? "Break Time 🌱" : "Focus Time 🎯"}</p>

          <div className="flex items-center justify-center space-x-2">
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
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Sessions Today</span>
            <span className="text-lg font-bold text-emerald-600">{todaySessions}</span>
          </div>
          <div className="mt-2 flex items-center space-x-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`w-3 h-3 rounded-full ${i < todaySessions ? "bg-emerald-600" : "bg-gray-200"}`} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
