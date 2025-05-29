"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Icons } from "@/components/icons"
import { useData } from "@/components/local-data-provider"

interface AIAssistantModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AIAssistantModal({ isOpen, onClose }: AIAssistantModalProps) {
  const [prompt, setPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState("")
  const { tasks, pomodoros, stats } = useData()

  const pendingTasks = tasks.filter((task) => !task.completed)
  const todayPomodoros = pomodoros.filter((session) => {
    const today = new Date().toISOString().split("T")[0]
    return session.startTime.split("T")[0] === today && session.completed
  }).length

  const suggestions = [
    {
      title: "Plan My Week",
      description: `Help me organize my ${pendingTasks.length} pending tasks across the upcoming week based on priorities and deadlines.`,
      icon: Icons.calendar,
      action: "Plan my tasks for this week",
    },
    {
      title: "Schedule Today's Tasks",
      description: `I have tasks to complete today. Help me create an optimal schedule with time blocks and breaks.`,
      icon: Icons.clock,
      action: "Help me schedule today's tasks",
    },
    {
      title: "Task Breakdown & Planning",
      description: "Break down my complex tasks into smaller steps and suggest the best dates to work on them.",
      icon: Icons.target,
      action: "Break down my tasks and suggest dates",
    },
    {
      title: "Productivity Insights",
      description: `Analyze my ${stats.completedTasks} completed tasks and ${todayPomodoros} focus sessions to optimize my workflow.`,
      icon: Icons.trendingUp,
      action: "Analyze my productivity and suggest improvements",
    },
  ]

  const handleSubmit = async (suggestionAction?: string) => {
    const userPrompt = suggestionAction || prompt
    if (!userPrompt.trim()) return

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))

    let aiResponse = ""

    if (userPrompt.includes("plan") && userPrompt.includes("week")) {
      const today = new Date()
      const weekDays = []

      for (let i = 0; i < 7; i++) {
        const date = new Date(today)
        date.setDate(today.getDate() + i)
        weekDays.push({
          day: date.toLocaleDateString("en", { weekday: "long" }),
          date: date.toISOString().split("T")[0],
          shortDate: date.toLocaleDateString("en", { month: "short", day: "numeric" }),
        })
      }

      const highPriorityTasks = pendingTasks.filter((t) => t.priority === "high")
      const mediumPriorityTasks = pendingTasks.filter((t) => t.priority === "medium")
      const lowPriorityTasks = pendingTasks.filter((t) => t.priority === "low")

      aiResponse = `📅 **Weekly Task Planning**

Here's your optimized weekly schedule:

**📋 Task Distribution:**
🔴 High Priority: ${highPriorityTasks.length} tasks
🟡 Medium Priority: ${mediumPriorityTasks.length} tasks  
🟢 Low Priority: ${lowPriorityTasks.length} tasks

**📆 Suggested Weekly Schedule:**

${weekDays
  .map((day, index) => {
    let dayTasks = []

    if (index === 0) {
      // Today
      dayTasks = highPriorityTasks.slice(0, 2).concat(mediumPriorityTasks.slice(0, 1))
    } else if (index === 1) {
      // Tomorrow
      dayTasks = highPriorityTasks.slice(2, 4).concat(mediumPriorityTasks.slice(1, 2))
    } else if (index < 5) {
      // Weekdays
      const remaining = Math.max(0, pendingTasks.length - index * 2)
      dayTasks = pendingTasks.slice(index * 2, index * 2 + 2)
    }

    return `**${day.day} (${day.shortDate})**
${dayTasks.length > 0 ? dayTasks.map((task) => `  • ${task.title} (${task.priority} priority)`).join("\n") : "  • Light day - focus on review and planning"}
${index < 5 ? "  • Recommended: 2-3 Pomodoro sessions" : "  • Weekend: Personal tasks and rest"}`
  })
  .join("\n\n")}

**💡 Planning Tips:**
- Start each day with your highest priority task
- Batch similar tasks together
- Leave buffer time for unexpected items
- Schedule breaks between intense work sessions

Would you like me to help you schedule any specific day in detail?`
    } else if (userPrompt.includes("schedule") && userPrompt.includes("today")) {
      const todayTasks = pendingTasks
        .filter((task) => {
          const today = new Date().toISOString().split("T")[0]
          return !task.dueDate || task.dueDate === today
        })
        .slice(0, 6)

      aiResponse = `⏰ **Today's Optimized Schedule**

**🌅 Morning Block (9:00 AM - 12:00 PM)**
${todayTasks
  .slice(0, 2)
  .map(
    (task, i) =>
      `${9 + i * 1.5}:00 AM - ${task.title} (${task.priority} priority)
  └ Estimated: 25-50 minutes + break`,
  )
  .join("\n")}

**🌞 Afternoon Block (1:00 PM - 4:00 PM)**  
${todayTasks
  .slice(2, 4)
  .map(
    (task, i) =>
      `${1 + i * 1.5}:00 PM - ${task.title} (${task.priority} priority)
  └ Estimated: 25-50 minutes + break`,
  )
  .join("\n")}

**🌆 Evening Block (4:00 PM - 6:00 PM)**
${todayTasks
  .slice(4, 6)
  .map(
    (task, i) =>
      `${4 + i * 1}:00 PM - ${task.title} (${task.priority} priority)
  └ Quick tasks and wrap-up`,
  )
  .join("\n")}

**⚡ Energy Optimization:**
- 🔥 Peak Focus: 9-11 AM (hardest tasks)
- 💪 Good Focus: 1-3 PM (important tasks)  
- 🌅 Wind Down: 4-6 PM (easier tasks)

**🍅 Pomodoro Schedule:**
- Use 25-minute focused sessions
- Take 5-minute breaks between sessions
- Take a 15-30 minute break after every 2 sessions

Ready to start your productive day?`
    } else if (userPrompt.includes("break") && (userPrompt.includes("task") || userPrompt.includes("plan"))) {
      const complexTasks = pendingTasks
        .filter((task) => (task.description && task.description.length > 50) || task.title.length > 30)
        .slice(0, 3)

      aiResponse = `🎯 **Task Breakdown & Scheduling**

${
  complexTasks.length > 0
    ? complexTasks
        .map((task, index) => {
          const steps = [
            "Research and gather requirements",
            "Create outline or plan",
            "Execute main work",
            "Review and refine",
            "Final check and completion",
          ]

          const suggestedDays = []
          for (let i = 0; i < 3; i++) {
            const date = new Date()
            date.setDate(date.getDate() + i)
            suggestedDays.push(date.toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" }))
          }

          return `**${index + 1}. ${task.title}**
📋 **Broken down steps:**
${steps
  .slice(0, 3)
  .map((step, i) => `   ${i + 1}. ${step}`)
  .join("\n")}

📅 **Suggested timeline:**
   • Day 1 (${suggestedDays[0]}): Steps 1-2 (Planning phase)
   • Day 2 (${suggestedDays[1]}): Step 3 (Execution phase)  
   • Day 3 (${suggestedDays[2]}): Steps 4-5 (Review phase)

⏱️ **Time estimate:** 2-3 Pomodoro sessions total`
        })
        .join("\n\n")
    : "No complex tasks found. Your current tasks look manageable!"
}

**🗓️ General Planning Strategy:**
- Break large tasks into 25-minute chunks
- Schedule difficult tasks during your peak energy hours
- Group similar tasks together
- Always include buffer time for unexpected issues

**📝 Next Steps:**
1. Choose which task to break down first
2. Schedule the first step for tomorrow
3. Set reminders for each phase

Which task would you like me to help you plan in more detail?`
    } else {
      // Default comprehensive response
      aiResponse = `🤖 **Your Personal Productivity Assistant**

I'm here to help you plan and organize your tasks effectively! Here's what I can do:

**📅 Task Planning & Scheduling:**
- Plan your entire week with optimal task distribution
- Create detailed daily schedules with time blocks
- Break down complex tasks into manageable steps
- Suggest the best dates and times for different types of work

**📊 Current Overview:**
- 📋 Pending Tasks: ${pendingTasks.length}
- ✅ Completed Today: ${
        tasks.filter((t) => {
          const today = new Date().toISOString().split("T")[0]
          return t.completedAt && t.completedAt.split("T")[0] === today
        }).length
      }
- 🍅 Focus Sessions Today: ${todayPomodoros}
- 🎯 Completion Rate: ${stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%

**💡 Quick Actions:**
- "Plan my week" - Get a full weekly schedule
- "Schedule today" - Optimize today's task timeline  
- "Break down [task name]" - Split complex tasks into steps
- "When should I work on [task]?" - Get timing recommendations

**🎯 Smart Suggestions:**
${pendingTasks.length > 5 ? "• You have many pending tasks - let me help prioritize them" : ""}
${todayPomodoros < 2 ? "• Consider starting a focus session to build momentum" : ""}
${stats.completedTasks > 10 ? "• Great progress! Let's optimize your workflow further" : ""}

What would you like help with today?`
    }

    setResponse(aiResponse)
    setIsLoading(false)
    if (suggestionAction) setPrompt("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Icons.sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl">AI Productivity Assistant</span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!response && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Smart Suggestions</h3>
              <div className="grid gap-4">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="group p-4 bg-gradient-to-r from-emerald-50 via-blue-50 to-violet-50 rounded-xl border border-emerald-200/50 hover:border-emerald-300/50 transition-all duration-200 cursor-pointer"
                    onClick={() => handleSubmit(suggestion.action)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                        <suggestion.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{suggestion.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
                        <Badge variant="outline" className="text-xs bg-white/50">
                          Click to get insights
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Ask Your AI Assistant</h3>
            <Textarea
              placeholder="Ask me anything about productivity, task management, or how to optimize your workflow..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px] resize-none border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
            />

            <Button
              onClick={() => handleSubmit()}
              disabled={!prompt.trim() || isLoading}
              className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white py-3 rounded-xl font-medium"
            >
              {isLoading ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing your data...
                </>
              ) : (
                <>
                  <Icons.sparkles className="mr-2 h-4 w-4" />
                  Get AI Insights
                </>
              )}
            </Button>
          </div>

          {response && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">AI Recommendations</h3>
              <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl border border-gray-200">
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-line text-gray-700 leading-relaxed">{response}</div>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button
                  onClick={() => {
                    setResponse("")
                    setPrompt("")
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Ask Another Question
                </Button>
                <Button onClick={onClose} className="flex-1 bg-gradient-to-r from-emerald-600 to-blue-600">
                  Apply Suggestions
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
