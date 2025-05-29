"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

export interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: "low" | "medium" | "high"
  category: "work" | "personal" | "learning" | "health"
  createdAt: string
  completedAt?: string
  dueDate?: string
}

export interface PomodoroSession {
  id: string
  startTime: string
  endTime?: string
  duration: number // in minutes
  taskId?: string
  completed: boolean
}

export interface UserStats {
  totalTasks: number
  completedTasks: number
  totalPomodoros: number
  totalFocusTime: number // in minutes
  streak: number
  lastActiveDate: string
}

interface DataContextType {
  tasks: Task[]
  pomodoros: PomodoroSession[]
  stats: UserStats
  loading: boolean
  addTask: (task: Omit<Task, "id" | "createdAt">) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  addPomodoro: (pomodoro: Omit<PomodoroSession, "id">) => void
  refreshData: () => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

// Generate a simple ID
const generateId = () => Math.random().toString(36).substr(2, 9)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [pomodoros, setPomodoros] = useState<PomodoroSession[]>([])
  const [stats, setStats] = useState<UserStats>({
    totalTasks: 0,
    completedTasks: 0,
    totalPomodoros: 0,
    totalFocusTime: 0,
    streak: 0,
    lastActiveDate: new Date().toISOString().split("T")[0],
  })
  const [loading, setLoading] = useState(true)

  // Load data from localStorage on mount
  useEffect(() => {
    loadLocalData()
    setLoading(false)
  }, [])

  // Save data to localStorage whenever state changes
  useEffect(() => {
    if (!loading) {
      saveLocalData()
      updateStats()
    }
  }, [tasks, pomodoros, loading])

  const loadLocalData = () => {
    try {
      const savedTasks = localStorage.getItem("planthesia_tasks")
      const savedPomodoros = localStorage.getItem("planthesia_pomodoros")
      const savedStats = localStorage.getItem("planthesia_stats")

      if (savedTasks) {
        setTasks(JSON.parse(savedTasks))
      }
      if (savedPomodoros) {
        setPomodoros(JSON.parse(savedPomodoros))
      }
      if (savedStats) {
        setStats(JSON.parse(savedStats))
      }
    } catch (error) {
      console.error("Error loading local data:", error)
    }
  }

  const saveLocalData = () => {
    try {
      localStorage.setItem("planthesia_tasks", JSON.stringify(tasks))
      localStorage.setItem("planthesia_pomodoros", JSON.stringify(pomodoros))
      localStorage.setItem("planthesia_stats", JSON.stringify(stats))
    } catch (error) {
      console.error("Error saving local data:", error)
    }
  }

  const addTask = (taskData: Omit<Task, "id" | "createdAt">) => {
    const newTask: Task = {
      ...taskData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    }
    setTasks((prev) => [newTask, ...prev])
  }

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === id) {
          const updatedTask = { ...task, ...updates }
          if (updates.completed && !task.completed) {
            updatedTask.completedAt = new Date().toISOString()
          }
          return updatedTask
        }
        return task
      }),
    )
  }

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }

  const addPomodoro = (pomodoroData: Omit<PomodoroSession, "id">) => {
    const newPomodoro: PomodoroSession = {
      ...pomodoroData,
      id: generateId(),
    }
    setPomodoros((prev) => [newPomodoro, ...prev])
  }

  const updateStats = () => {
    const totalTasks = tasks.length
    const completedTasks = tasks.filter((task) => task.completed).length
    const totalPomodoros = pomodoros.filter((p) => p.completed).length
    const totalFocusTime = pomodoros.reduce((sum, p) => sum + (p.completed ? p.duration : 0), 0)

    const today = new Date().toISOString().split("T")[0]
    const todayTasks = tasks.filter((task) => task.completedAt && task.completedAt.split("T")[0] === today).length

    const newStats: UserStats = {
      totalTasks,
      completedTasks,
      totalPomodoros,
      totalFocusTime,
      streak: todayTasks > 0 ? Math.max(stats.streak, 1) : stats.streak,
      lastActiveDate: today,
    }

    setStats(newStats)
  }

  const refreshData = () => {
    loadLocalData()
  }

  return (
    <DataContext.Provider
      value={{
        tasks,
        pomodoros,
        stats,
        loading,
        addTask,
        updateTask,
        deleteTask,
        addPomodoro,
        refreshData,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}
