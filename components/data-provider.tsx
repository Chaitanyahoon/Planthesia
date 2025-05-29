"use client"

import { createContext, useContext, useState, ReactNode } from "react"

interface Task {
  id: string
  title: string
  completed: boolean
}

interface PomodoroSession {
  startTime: string
  endTime: string
  duration: number
  taskId?: string
  completed: boolean
}

interface DataContextType {
  tasks: Task[]
  pomodoros: PomodoroSession[]
  addTask: (task: Omit<Task, "id">) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  addPomodoro: (session: Omit<PomodoroSession, "id">) => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [pomodoros, setPomodoros] = useState<PomodoroSession[]>([])

  const addTask = (task: Omit<Task, "id">) => {
    const newTask: Task = {
      ...task,
      id: Math.random().toString(36).substr(2, 9),
    }
    setTasks((prev) => [...prev, newTask])
  }

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, ...updates } : task))
    )
  }

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }

  const addPomodoro = (session: Omit<PomodoroSession, "id">) => {
    setPomodoros((prev) => [...prev, session])
  }

  return (
    <DataContext.Provider
      value={{
        tasks,
        pomodoros,
        addTask,
        updateTask,
        deleteTask,
        addPomodoro,
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