"use client"

import type React from "react"
import { useState, useCallback, useMemo, memo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Icons } from "@/components/icons"
import { useData } from "@/components/local-data-provider"

interface AIAssistantModalProps {
  isOpen: boolean
  onClose: () => void
}

interface ChatMessage {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface UserContext {
  today: string
  todayTasks: number
  todayPomodoros: number
  overdueTasks: number
  pendingTasks: number
  completionRate: number
  totalTasks: number
  totalPomodoros: number
  streak: number
}

// 100% Offline Local AI Engine - No External Dependencies
class LocalProductivityAI {
  private static instance: LocalProductivityAI
  private responseCache = new Map<string, string>()
  private readonly MAX_CACHE_SIZE = 100

  // Pre-compiled regex patterns for optimal performance
  private readonly patterns = {
    greeting: /\b(hello|hi|hey|good\s+(morning|afternoon|evening)|what'?s\s+up|how\s+are\s+you)\b/i,
    progress: /\b(progress|analysis|how\s+am\s+i\s+doing|stats|performance|today|dashboard|metrics)\b/i,
    productivity: /\b(productive|productivity|tips|advice|improve|better|efficient|techniques|optimize)\b/i,
    motivation: /\b(motivation|motivated|inspire|lazy|stuck|energy|confidence|burnout)\b/i,
    focus: /\b(focus|concentration|pomodoro|distracted|sessions|deep\s+work|attention)\b/i,
    tasks: /\b(tasks|todo|organize|plan|schedule|priority|deadline|manage)\b/i,
    emotional: /\b(frustrated|overwhelmed|anxious|stressed|worried|sad|happy|excited|tired)\b/i,
    time: /\b(time|busy|procrastination|delay|schedule|calendar|deadline)\b/i,
    habits: /\b(habit|habits|routine|consistency|daily|streak)\b/i,
    goals: /\b(goals|goal|objectives|targets|plan|planning)\b/i,
    wellness: /\b(wellness|health|break|breaks|rest|sleep|stress)\b/i,
  }

  // Response templates for intelligent conversations
  private readonly templates = {
    greeting: [
      "Hello! 🌱 I'm your Growth AI assistant, ready to help you cultivate productivity!",
      "Hi there! 🌟 Welcome to your productivity garden! How can I help you grow today?",
      "Hey! 🚀 Your personal AI coach is here. What would you like to work on?",
    ],
    quickTips: [
      "🍅 Try the Pomodoro Technique: 25 minutes focused work + 5 minute breaks",
      "🎯 Use the 'Rule of 3' - pick only 3 main tasks per day",
      "⚡ Apply the 2-minute rule: if it takes less than 2 minutes, do it now",
      "🌅 Tackle your most important task first thing in the morning",
      "📱 Put your phone in another room during focus sessions",
      "🧘 Take breaks before you feel tired, not after",
      "📝 Write down distracting thoughts to address later",
      "🎵 Use background music or white noise for focus",
    ],
    motivationalQuotes: [
      "Progress, not perfection! 🌱",
      "Every expert was once a beginner 💪",
      "Small steps lead to big changes 🚀",
      "You're stronger than you think! 🌟",
      "Focus on what you can control 🎯",
      "Consistency beats perfection 🔄",
      "Your future self will thank you 🙏",
      "Growth happens outside your comfort zone 🌿",
    ],
    focusStrategies: [
      "🎯 Single-tasking: Focus on one thing at a time",
      "🧹 Clean workspace: Clear space, clear mind",
      "⏰ Time boxing: Set specific time limits for tasks",
      "🔕 Distraction blocking: Remove temptations from sight",
      "💧 Stay hydrated: Keep water nearby for brain function",
      "🌬️ Deep breathing: 4-7-8 technique for instant calm",
    ],
  }

  static getInstance(): LocalProductivityAI {
    if (!LocalProductivityAI.instance) {
      LocalProductivityAI.instance = new LocalProductivityAI()
    }
    return LocalProductivityAI.instance
  }

  generateResponse(message: string, context: UserContext): string {
    const cacheKey = this.getCacheKey(message, context)

    // Check cache first for instant responses
    if (this.responseCache.has(cacheKey)) {
      return this.responseCache.get(cacheKey)!
    }

    const response = this.processMessage(message, context)

    // Cache management with LRU-style eviction
    if (this.responseCache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this.responseCache.keys().next().value
      this.responseCache.delete(firstKey)
    }

    this.responseCache.set(cacheKey, response)
    return response
  }

  private getCacheKey(message: string, context: UserContext): string {
    return `${message.toLowerCase().trim()}_${context.todayTasks}_${context.todayPomodoros}_${context.overdueTasks}`
  }

  private processMessage(message: string, context: UserContext): string {
    const lowerMessage = message.toLowerCase()

    // Fast pattern matching with early returns
    if (this.patterns.greeting.test(lowerMessage)) {
      return this.buildGreeting(context)
    }
    if (this.patterns.progress.test(lowerMessage)) {
      return this.buildProgressAnalysis(context)
    }
    if (this.patterns.productivity.test(lowerMessage)) {
      return this.buildProductivityAdvice(context)
    }
    if (this.patterns.motivation.test(lowerMessage)) {
      return this.buildMotivation(context)
    }
    if (this.patterns.focus.test(lowerMessage)) {
      return this.buildFocusAdvice(context)
    }
    if (this.patterns.tasks.test(lowerMessage)) {
      return this.buildTaskAdvice(context)
    }
    if (this.patterns.emotional.test(lowerMessage)) {
      return this.buildEmotionalSupport(lowerMessage, context)
    }
    if (this.patterns.time.test(lowerMessage)) {
      return this.buildTimeManagementAdvice(context)
    }
    if (this.patterns.habits.test(lowerMessage)) {
      return this.buildHabitsAdvice(context)
    }
    if (this.patterns.goals.test(lowerMessage)) {
      return this.buildGoalsAdvice(context)
    }
    if (this.patterns.wellness.test(lowerMessage)) {
      return this.buildWellnessAdvice(context)
    }

    return this.buildContextualResponse(context)
  }

  private buildGreeting(context: UserContext): string {
    const greeting = this.getRandomItem(this.templates.greeting)
    let response = `${greeting}\n\n`

    if (context.todayTasks > 0 || context.todayPomodoros > 0) {
      response += `🎉 **Great progress today!**\n• ${context.todayTasks} tasks completed\n• ${context.todayPomodoros} focus sessions\n\n`
    }

    response += `💡 **I can help you with:**\n• Productivity tips and analysis\n• Task management and planning\n• Focus and motivation strategies\n• Progress insights and support\n• Emotional guidance and wellness\n\nWhat would you like to explore? 🚀`

    return response
  }

  private buildProgressAnalysis(context: UserContext): string {
    const score = this.calculateProductivityScore(context)
    const focusTime = (context.todayPomodoros * 25) / 60

    let analysis = `📊 **Today's Progress Analysis**\n\n🌱 **Today's Growth:**\n• Tasks Completed: ${context.todayTasks}\n• Focus Sessions: ${context.todayPomodoros}\n• Deep Work Time: ${focusTime.toFixed(1)} hours\n• Productivity Score: ${score}/10\n• Overall Completion Rate: ${context.completionRate}%\n\n`

    if (context.overdueTasks > 0) {
      analysis += `⚠️ **Action Needed:** ${context.overdueTasks} overdue tasks need attention\n\n`
    }

    const weeklyAvg = Math.round(context.totalPomodoros / Math.max(context.streak, 1))
    analysis += `📈 **Weekly Trends:**\n• Current Streak: ${context.streak} days\n• Average Sessions/Day: ${weeklyAvg}\n• Total Focus Sessions: ${context.totalPomodoros}\n\n`

    analysis += this.getInsight(context.completionRate, context.todayPomodoros)
    return analysis
  }

  private buildProductivityAdvice(context: UserContext): string {
    let advice = `🚀 **Personalized Productivity Boost**\n\n`

    if (context.todayPomodoros === 0) {
      advice += `🍅 **Start with Focus:** Try one 25-minute Pomodoro session right now!\n\n`
    } else if (context.todayPomodoros < 4) {
      advice += `💪 **Building Momentum:** You're at ${context.todayPomodoros} sessions. Aim for 4-6 for optimal productivity!\n\n`
    } else {
      advice += `🔥 **Focus Master:** ${context.todayPomodoros} sessions today! You're in the zone!\n\n`
    }

    if (context.overdueTasks > 0) {
      advice += `⚠️ **Priority Alert:** Tackle your ${context.overdueTasks} overdue tasks first using the "Eat the Frog" technique.\n\n`
    }

    const tips = this.getRandomItems(this.templates.quickTips, 4)
    advice += `💡 **Proven Techniques:**\n${tips.map((tip) => `• ${tip}`).join("\n")}\n\n`

    advice += `🎯 **Action Plan:**\n• Choose 1 technique to try right now\n• Apply it for the next 25 minutes\n• Track your results and adjust\n\n✨ **Remember:** Small consistent actions lead to big results!`

    return advice
  }

  private buildMotivation(context: UserContext): string {
    const quote = this.getRandomItem(this.templates.motivationalQuotes)

    let motivation = `🌟 **Motivation & Energy Boost**\n\n💭 **Today's Inspiration:** "${quote}"\n\n`

    if (context.todayTasks > 0 || context.todayPomodoros > 0) {
      motivation += `🎉 **You're already winning today!**\n• ${context.todayTasks} tasks completed\n• ${context.todayPomodoros} focus sessions done\n• You're building unstoppable momentum!\n\n`
    } else {
      motivation += `🌱 **Fresh Start Energy:**\n• Every moment is a new opportunity\n• Your ${context.totalTasks} total tasks show your ambition\n• Today is your chance to add to your success story!\n\n`
    }

    motivation += `🔥 **Instant Energy Boosters:**\n• Start with your easiest task for momentum\n• Celebrate every small win (seriously!)\n• Remember your 'why' - what drives you?\n• Take 3 deep breaths and begin now\n• Visualize completing your top task\n\n`

    if (context.streak > 0) {
      motivation += `⚡ **Streak Power:** Your ${context.streak}-day streak proves you're consistent! Don't break the chain!\n\n`
    }

    motivation += `🚀 **You've got this! Every step forward counts, no matter how small.**`

    return motivation
  }

  private buildFocusAdvice(context: UserContext): string {
    const focusLevel = this.getFocusLevel(context.todayPomodoros)

    let advice = `🎯 **Focus Enhancement Guide**\n\n📊 **Your Focus Profile:**\n• Today's Sessions: ${context.todayPomodoros}\n• Focus Level: ${focusLevel}\n• Total Sessions: ${context.totalPomodoros}\n\n`

    if (context.todayPomodoros === 0) {
      advice += `🌱 **Getting Started (Beginner Mode):**\n• Set timer for just 15 minutes (easier start)\n• Choose one specific, small task\n• Remove ALL distractions (phone, notifications)\n• Start immediately - no preparation needed!\n• Reward yourself after completion\n\n`
    } else if (context.todayPomodoros < 4) {
      advice += `💪 **Building Focus Muscle:**\n• You're at ${context.todayPomodoros}/6 optimal sessions\n• Take proper 5-minute breaks between sessions\n• Stay hydrated and stretch during breaks\n• Gradually increase session difficulty\n\n`
    } else {
      advice += `🔥 **Focus Master Mode:**\n• Excellent focus today with ${context.todayPomodoros} sessions!\n• Ensure you're taking adequate breaks\n• Vary task types to prevent mental fatigue\n• Consider longer deep work blocks for complex tasks\n\n`
    }

    const strategies = this.getRandomItems(this.templates.focusStrategies, 3)
    advice += `🧠 **Advanced Focus Strategies:**\n${strategies.map((strategy) => `• ${strategy}`).join("\n")}\n\n`

    advice += `🎯 **Next Action:** ${this.getFocusRecommendation(context.todayPomodoros)}`

    return advice
  }

  private buildTaskAdvice(context: UserContext): string {
    let advice = `📋 **Smart Task Management**\n\n📊 **Current Task Landscape:**\n• Pending Tasks: ${context.pendingTasks}\n• Overdue Tasks: ${context.overdueTasks}\n• Completion Rate: ${context.completionRate}%\n\n`

    if (context.overdueTasks > 0) {
      advice += `🚨 **Immediate Action Required:**\n• You have ${context.overdueTasks} overdue tasks\n• Apply "Damage Control" strategy:\n  1. List all overdue items\n  2. Estimate time needed for each\n  3. Tackle quickest wins first\n  4. Communicate delays for larger items\n\n`
    }

    advice += `⚡ **Task Organization Strategies:**\n\n`

    if (context.pendingTasks > 10) {
      advice += `**Task Overload Management:**\n• Use the "Rule of 3" - pick only 3 main tasks today\n• Apply 80/20 rule - focus on high-impact tasks\n• Consider delegating or eliminating low-priority items\n\n`
    }

    advice += `**Eisenhower Matrix Application:**\n• Urgent + Important: Do first (overdue tasks)\n• Important + Not Urgent: Schedule (high priority)\n• Urgent + Not Important: Delegate if possible\n• Neither: Eliminate or defer\n\n`

    advice += `**Time Estimation Tips:**\n• Break large tasks into 25-minute chunks\n• Add 25% buffer time to estimates\n• Track actual vs. estimated time to improve\n• Use "Swiss Cheese" method for big projects\n\n`

    advice += `🎯 **Recommended Focus:** ${this.getTaskFocusRecommendation(context)}`

    return advice
  }

  private buildEmotionalSupport(message: string, context: UserContext): string {
    let support = `💚 **Emotional Support & Understanding**\n\n`

    if (message.includes("overwhelmed") || message.includes("stressed")) {
      support += `🫂 **Feeling overwhelmed is completely normal** - it shows you care about your progress!\n\n🌱 **Immediate Relief Techniques:**\n• Take 3 deep breaths right now (4 counts in, 7 hold, 8 out)\n• Write down everything on your mind\n• Pick just ONE thing to focus on\n• Remember: you don't have to do everything today\n• Use the "Good Enough" principle\n\n💪 **You're stronger than you think. One step at a time.**`
    } else if (message.includes("frustrated") || message.includes("angry")) {
      support += `😤 **Frustration shows you're pushing boundaries** - that's actually growth!\n\n🔄 **Channel it positively:**\n• Take a 5-10 minute break (seriously, step away)\n• Break the challenging task into smaller pieces\n• Try a completely different approach\n• Remember: every expert was once a beginner\n• Ask yourself: "What can this teach me?"\n\n🚀 **Your persistence will pay off! This feeling is temporary.**`
    } else if (message.includes("anxious") || message.includes("worried")) {
      support += `🤗 **Anxiety is normal** - let's create some clarity and calm:\n\n🧘 **5-4-3-2-1 Grounding Technique:**\n• Name 5 things you can see\n• 4 things you can touch\n• 3 things you can hear\n• 2 things you can smell\n• 1 thing you can taste\n\n💡 **Anxiety Management:**\n• Focus only on what you CAN control\n• Break worries into "actionable" vs "not actionable"\n• Set a "worry time" - 10 minutes to think, then stop\n\n🌟 **You've handled challenges before, and you can handle this too.**`
    } else if (message.includes("tired") || message.includes("exhausted")) {
      support += `😴 **Feeling tired is your body's wisdom** - listen to it!\n\n🔋 **Energy Management:**\n• Take a 10-20 minute power nap if possible\n• Get some natural light exposure\n• Do 5 minutes of light movement or stretching\n• Stay hydrated - dehydration causes fatigue\n• Consider if you need a longer break\n\n⚡ **Sustainable Productivity:**\n• Quality over quantity in work sessions\n• Rest is productive too - it prevents burnout\n• Your best work comes from a rested mind\n\n🌱 **Be kind to yourself - rest is part of growth.**`
    } else if (message.includes("happy") || message.includes("excited")) {
      support += `🎉 **I love your positive energy!** This is fantastic!\n\n✨ **Harness this momentum:**\n• Use this energy to tackle challenging tasks\n• Share your success with others for extra motivation\n• Document what led to this feeling\n• Ride this wave while being mindful not to overcommit\n• Celebrate this moment - you deserve it!\n\n🚀 **Your positive attitude is contagious and powerful - keep shining!**`
    } else {
      support += `🤝 **Whatever you're feeling is completely valid.** Emotions are information about our experience.\n\n💡 **Gentle reminders:**\n• All feelings are temporary and normal\n• Progress isn't always linear - ups and downs are natural\n• Small steps still count as progress\n• Tomorrow is always a fresh start\n• You're doing better than you think\n• It's okay to have "off" days\n\n🌱 **Be compassionate with yourself - you're growing every single day.**`
    }

    return support
  }

  private buildTimeManagementAdvice(context: UserContext): string {
    const efficiency = Math.min(10, Math.round(context.completionRate / 10))

    let advice = `⏰ **Time Management Mastery**\n\n📊 **Your Time Profile:**\n• Completion Rate: ${context.completionRate}%\n• Time Efficiency: ${efficiency}/10\n• Current Streak: ${context.streak} days\n\n`

    if (context.overdueTasks > 0 || context.completionRate < 60) {
      advice += `🚨 **Time Challenge Identified:**\n`
      if (context.overdueTasks > 0) {
        advice += `• ${context.overdueTasks} overdue tasks suggest time estimation issues\n`
      }
      if (context.completionRate < 60) {
        advice += `• Low completion rate indicates possible overcommitment\n`
      }
      advice += `\n**Immediate Solutions:**\n• Conduct a 3-day time audit\n• Identify your biggest time wasters\n• Practice saying "no" to non-essential requests\n• Use time-blocking for important tasks\n\n`
    }

    advice += `🎯 **Proven Time Strategies:**\n\n**Time Blocking Method:**\n• Schedule specific times for different activities\n• Include buffer time between tasks (15-30 minutes)\n• Protect your most productive hours\n• Block time for email and communication\n\n**Energy-Based Scheduling:**\n• High energy: Complex, creative tasks\n• Medium energy: Routine work, meetings\n• Low energy: Administrative tasks, planning\n\n**Batch Processing:**\n• Group similar tasks together\n• Minimize context switching\n• Set specific times for email/messages\n• Batch errands and phone calls\n\n`

    advice += `⚡ **Quick Time Hacks:**\n• Use Parkinson's Law - set shorter deadlines\n• Apply the "Good Enough" principle\n• Use transition rituals between tasks\n• Practice the "Swiss Cheese" method for big projects\n\n`

    advice += `🎯 **This Week's Focus:** ${this.getTimeManagementGoal(context)}`

    return advice
  }

  private buildHabitsAdvice(context: UserContext): string {
    const habitStrength = context.streak > 21 ? "Strong" : context.streak > 7 ? "Developing" : "Building"

    let advice = `🔄 **Habits & Consistency Mastery**\n\n📊 **Your Habit Profile:**\n• Current Streak: ${context.streak} days\n• Habit Strength: ${habitStrength}\n• Consistency Score: ${Math.min(10, context.streak)}/10\n\n`

    advice += `🌱 **The Science of Habit Formation:**\n\n**The Habit Loop:**\n• Cue: Environmental trigger (time, location, emotion)\n• Routine: The behavior itself\n• Reward: Positive reinforcement\n• Tracking: Monitor progress visually\n\n**Habit Stacking Technique:**\n• Link new habits to existing ones\n• "After I [existing habit], I will [new habit]"\n• Start with tiny, 2-minute versions\n• Gradually increase complexity over time\n\n`

    if (context.streak === 0) {
      advice += `🚀 **Getting Started:**\n• Choose ONE tiny habit (2 minutes max)\n• Stack it with an existing routine\n• Track it visually (calendar, app, journal)\n• Focus on consistency over perfection\n• Celebrate every single day you do it\n\n`
    } else if (context.streak < 21) {
      advice += `💪 **Building Momentum (Days 1-21):**\n• You're at day ${context.streak} - great start!\n• Focus on not breaking the chain\n• Make it easier, not harder\n• Prepare for obstacles in advance\n• Use environmental design to help\n\n`
    } else {
      advice += `🏆 **Habit Master (21+ days):**\n• Congratulations! Your habit is becoming automatic\n• Consider adding a complementary habit\n• Help others build similar habits\n• Reflect on how this habit has changed you\n\n`
    }

    advice += `💡 **Habit Success Strategies:**\n• Start ridiculously small (1 push-up, 1 page, 1 minute)\n• Use the "2-minute rule" for new habits\n• Design your environment for success\n• Track visually (habit tracker, calendar)\n• Never miss twice in a row\n• Celebrate small wins immediately\n\n`

    advice += `🎯 **Next Habit Goal:** ${this.getHabitRecommendation(context)}`

    return advice
  }

  private buildGoalsAdvice(context: UserContext): string {
    const planningScore = context.totalTasks > 0 ? Math.round((context.completionRate / 100) * 10) : 5

    let advice = `🎯 **Goal Setting & Strategic Planning**\n\n📊 **Planning Assessment:**\n• Goal Achievement Rate: ${context.completionRate}%\n• Planning Score: ${planningScore}/10\n• Active Goals: ${context.pendingTasks}\n\n`

    advice += `🎯 **SMART Goals Framework:**\n\n**S - Specific:** Clear, well-defined objectives\n**M - Measurable:** Quantifiable progress indicators\n**A - Achievable:** Realistic and attainable\n**R - Relevant:** Aligned with your values and priorities\n**T - Time-bound:** Clear deadlines and milestones\n\n`

    advice += `📋 **Goal Planning Strategies:**\n\n**Weekly Planning Ritual:**\n• Sunday: Review previous week and plan ahead\n• Identify 3 main goals for the week\n• Break goals into daily actions\n• Schedule important tasks first\n• Build in buffer time for unexpected items\n\n**Daily Planning Method:**\n• Evening: Plan tomorrow's top 3 tasks\n• Morning: Review and adjust plan\n• Midday: Check progress and realign if needed\n• Evening: Reflect and celebrate wins\n\n**Goal Hierarchy System:**\n• Life Vision (10+ years)\n• Long-term Goals (1-3 years)\n• Quarterly Objectives (3 months)\n• Monthly Targets (1 month)\n• Weekly Priorities (1 week)\n• Daily Actions (today)\n\n`

    advice += `🌟 **Goal Achievement Tips:**\n• Use the "Rule of 3" for daily priorities\n• Connect daily tasks to bigger goals\n• Review and adjust plans regularly\n• Celebrate milestone achievements\n• Learn from setbacks and adjust\n• Share goals with accountability partners\n\n`

    advice += `🎯 **Next Planning Step:** ${this.getPlanningRecommendation(context)}`

    return advice
  }

  private buildWellnessAdvice(context: UserContext): string {
    const focusTime = (context.todayPomodoros * 25) / 60
    const balanceScore = Math.min(10, Math.max(1, 10 - Math.floor(focusTime)))
    const burnoutRisk = context.todayPomodoros > 8 || focusTime > 8

    let advice = `🌿 **Wellness & Sustainable Productivity**\n\n💚 **Wellness Check:**\n• Daily Focus Time: ${focusTime.toFixed(1)} hours\n• Work-Life Balance: ${balanceScore}/10\n• Burnout Risk: ${burnoutRisk ? "Monitor Closely" : "Low"}\n\n`

    if (burnoutRisk) {
      advice += `⚠️ **Burnout Prevention Alert:**\n• You've had ${context.todayPomodoros} sessions today (${focusTime.toFixed(1)} hours)\n• High activity is great, but balance is crucial\n• Consider taking longer breaks\n• Ensure you're getting adequate rest\n• Listen to your body's signals\n\n`
    }

    advice += `🧘 **Holistic Wellness Approach:**\n\n**Physical Wellness:**\n• Take a 5-minute break every 25 minutes\n• Stand and stretch regularly\n• Stay hydrated throughout the day (8 glasses)\n• Maintain good posture while working\n• Get natural light exposure daily\n• Move your body for at least 30 minutes\n\n**Mental Wellness:**\n• Practice mindfulness during breaks\n• Limit multitasking to reduce stress\n• Set boundaries between work and personal time\n• Practice gratitude for completed tasks\n• Accept that perfection isn't necessary\n• Take mental health days when needed\n\n**Emotional Wellness:**\n• Celebrate small wins regularly\n• Be compassionate with yourself\n• Connect with others during breaks\n• Express feelings through journaling\n• Seek support when needed\n• Practice saying "no" to protect your energy\n\n`

    advice += `🌱 **Sustainable Productivity Habits:**\n• Start small and build gradually\n• Focus on consistency over intensity\n• Create supportive environments\n• Regular self-assessment and adjustment\n• Prioritize sleep (7-9 hours nightly)\n• Maintain social connections\n\n`

    advice += `🎯 **Wellness Goal:** ${this.getWellnessRecommendation(context, burnoutRisk)}`

    return advice
  }

  private buildContextualResponse(context: UserContext): string {
    let response = `💡 **I'm here to help you grow!**\n\n🌱 **Smart suggestions based on your data:**\n`

    const suggestions = []
    if (context.todayTasks === 0) suggestions.push("• Start with completing one small task for momentum")
    if (context.todayPomodoros === 0) suggestions.push("• Try a 25-minute focus session")
    if (context.overdueTasks > 0) suggestions.push(`• Address ${context.overdueTasks} overdue tasks`)
    if (context.pendingTasks > 10) suggestions.push("• Consider prioritizing your task list")

    response += suggestions.length > 0 ? suggestions.join("\n") + "\n\n" : ""

    response += `🎯 **I can help with:**\n• **Productivity:** Tips, techniques, and strategies\n• **Progress:** Analysis, insights, and tracking\n• **Motivation:** Inspiration and energy boosts\n• **Focus:** Concentration and deep work guidance\n• **Tasks:** Organization and prioritization\n• **Emotions:** Support and understanding\n• **Time:** Management and efficiency\n• **Habits:** Building and maintaining routines\n• **Goals:** Setting and achieving objectives\n• **Wellness:** Balance and sustainable practices\n\nWhat specific area would you like to explore? Just ask me anything! 🚀`

    return response
  }

  // Utility methods for intelligent responses
  private calculateProductivityScore(context: UserContext): number {
    let score = 5
    score += Math.min(context.todayTasks * 1.5, 3)
    score += Math.min(context.todayPomodoros * 0.5, 2)
    score -= Math.min(context.overdueTasks * 0.5, 2)
    return Math.max(1, Math.min(10, Math.round(score)))
  }

  private getInsight(completionRate: number, todayPomodoros: number): string {
    let insight = ""
    if (completionRate >= 80) {
      insight += `🎉 **Excellent!** You're maintaining outstanding productivity momentum!\n`
    } else if (completionRate >= 60) {
      insight += `💪 **Good progress!** Consider time-blocking for even better results.\n`
    } else {
      insight += `🌱 **Growth opportunity!** Try the 2-minute rule for quick wins.\n`
    }

    if (todayPomodoros >= 6) {
      insight += `🔥 **Focus Champion:** ${todayPomodoros} sessions today - you're in peak performance mode!`
    } else if (todayPomodoros >= 4) {
      insight += `⚡ **Great Focus:** ${todayPomodoros} sessions puts you in the optimal productivity range!`
    } else if (todayPomodoros > 0) {
      insight += `🌱 **Building Focus:** ${todayPomodoros} sessions completed - aim for 4-6 for peak productivity!`
    } else {
      insight += `🍅 **Focus Opportunity:** Start with one 25-minute Pomodoro session to build momentum!`
    }

    return insight
  }

  private getFocusLevel(todayPomodoros: number): string {
    if (todayPomodoros === 0) return "Getting Started 🌱"
    if (todayPomodoros < 3) return "Building Momentum 💪"
    if (todayPomodoros < 6) return "In the Zone 🎯"
    if (todayPomodoros < 9) return "Focus Master 🔥"
    return "Peak Performance ⚡"
  }

  private getFocusRecommendation(todayPomodoros: number): string {
    if (todayPomodoros === 0) return "Start your first 25-minute focus session right now!"
    if (todayPomodoros < 4) return `Complete ${4 - todayPomodoros} more sessions to reach the optimal 4-6 range`
    if (todayPomodoros < 6) return "You're in the optimal range! Maintain this excellent momentum"
    return "Outstanding focus today! Ensure you're taking proper breaks to maintain quality"
  }

  private getTaskFocusRecommendation(context: UserContext): string {
    if (context.overdueTasks > 0) return "Immediately address overdue tasks to prevent further delays"
    if (context.pendingTasks > 15) return "Use the 'Rule of 3' - focus on only 3 main tasks today"
    if (context.completionRate < 50) return "Focus on completing existing tasks before adding new ones"
    return "Maintain steady progress with your current balanced approach"
  }

  private getTimeManagementGoal(context: UserContext): string {
    if (context.overdueTasks > 0) return "Implement time-blocking to prevent future overdue tasks"
    if (context.completionRate < 70) return "Focus on realistic time estimation and task completion"
    return "Optimize your peak productivity hours for high-impact activities"
  }

  private getHabitRecommendation(context: UserContext): string {
    if (context.streak === 0) return "Start a simple daily habit: complete one task every day"
    if (context.streak < 7) return "Focus on consistency - maintain your streak for 7 days"
    if (context.streak < 21) return "You're building strong habits! Aim for 21 days to make it automatic"
    return "Consider adding a complementary productivity habit to your routine"
  }

  private getPlanningRecommendation(context: UserContext): string {
    if (context.completionRate < 50) return "Focus on setting realistic, achievable daily goals"
    if (context.pendingTasks > 20) return "Review and prioritize your task list - consider archiving low-priority items"
    return "Create a weekly planning ritual to maintain your excellent progress"
  }

  private getWellnessRecommendation(context: UserContext, burnoutRisk: boolean): string {
    if (burnoutRisk) return "Take a longer break and ensure you're getting adequate rest tonight"
    if (context.todayPomodoros === 0) return "Balance productivity with self-care - start with one focus session"
    return "Maintain your healthy productivity rhythm with regular breaks and self-care"
  }

  private getRandomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)]
  }

  private getRandomItems<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
  }
}

// Memoized components for optimal performance
const SuggestionCard = memo(({ suggestion, onClick }: { suggestion: any; onClick: () => void }) => (
  <div
    className="group p-4 bg-white border border-gray-200 rounded-xl hover:border-emerald-300 hover:shadow-md transition-all duration-200 cursor-pointer"
    onClick={onClick}
  >
    <div className="flex items-start space-x-3">
      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
        <suggestion.icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1">
        <h5 className="font-semibold text-gray-900 mb-1">{suggestion.title}</h5>
        <p className="text-sm text-gray-600">{suggestion.description}</p>
      </div>
    </div>
  </div>
))

SuggestionCard.displayName = "SuggestionCard"

const ChatMessage = memo(({ message }: { message: ChatMessage }) => (
  <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
    <div
      className={`max-w-[80%] p-4 rounded-xl ${
        message.role === "user"
          ? "bg-gradient-to-r from-emerald-600 to-blue-600 text-white"
          : "bg-gray-100 text-gray-900"
      }`}
    >
      <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
      <div className={`text-xs mt-2 ${message.role === "user" ? "text-emerald-100" : "text-gray-500"}`}>
        {message.timestamp.toLocaleTimeString()}
      </div>
    </div>
  </div>
))

ChatMessage.displayName = "ChatMessage"

export function AIAssistantModal({ isOpen, onClose }: AIAssistantModalProps) {
  const [prompt, setPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const { tasks, pomodoros, stats } = useData()

  // Memoized context calculation for optimal performance
  const userContext = useMemo((): UserContext => {
    const today = new Date().toISOString().split("T")[0]
    const todayTasks = tasks.filter((task) => task.completedAt?.split("T")[0] === today).length
    const todayPomodoros = pomodoros.filter(
      (session) => session.completed && session.startTime.split("T")[0] === today,
    ).length
    const overdueTasks = tasks.filter((task) => task.dueDate && task.dueDate < today && !task.completed).length
    const pendingTasks = tasks.filter((task) => !task.completed).length
    const completionRate = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0

    return {
      today,
      todayTasks,
      todayPomodoros,
      overdueTasks,
      pendingTasks,
      completionRate,
      totalTasks: stats.totalTasks,
      totalPomodoros: stats.totalPomodoros,
      streak: stats.streak,
    }
  }, [tasks, pomodoros, stats])

  // Memoized suggestions for better performance
  const suggestions = useMemo(
    () => [
      {
        title: "Analyze Today's Progress",
        description: `Review today's ${userContext.todayPomodoros} focus sessions and completed tasks.`,
        icon: Icons.trendingUp,
        prompt: "How am I doing today? Give me a detailed progress analysis.",
      },
      {
        title: "Get Productivity Tips",
        description: "Receive personalized recommendations based on your patterns.",
        icon: Icons.sparkles,
        prompt: "Give me some productivity tips and advice to improve my workflow.",
      },
      {
        title: "Plan My Week",
        description: `Help organize my ${userContext.pendingTasks} pending tasks effectively.`,
        icon: Icons.calendar,
        prompt: "Help me plan my week and organize my tasks strategically.",
      },
      {
        title: "Focus & Motivation",
        description: "Get strategies for better focus and motivation boost.",
        icon: Icons.target,
        prompt: "I need help with focus and motivation. What can you suggest?",
      },
    ],
    [userContext.todayPomodoros, userContext.pendingTasks],
  )

  // Optimized submit handler
  const handleSubmit = useCallback(
    async (suggestionPrompt?: string) => {
      const userPrompt = suggestionPrompt || prompt
      if (!userPrompt.trim()) return

      const userMessage: ChatMessage = {
        role: "user",
        content: userPrompt,
        timestamp: new Date(),
      }

      setChatHistory((prev) => [...prev, userMessage])
      setIsLoading(true)
      setPrompt("")

      // Simulate realistic AI response time
      requestAnimationFrame(() => {
        setTimeout(
          () => {
            try {
              const ai = LocalProductivityAI.getInstance()
              const response = ai.generateResponse(userPrompt, userContext)

              const assistantMessage: ChatMessage = {
                role: "assistant",
                content: response,
                timestamp: new Date(),
              }

              setChatHistory((prev) => [...prev, assistantMessage])
            } catch (error) {
              console.error("AI Error:", error)
              const errorMessage: ChatMessage = {
                role: "assistant",
                content:
                  "I apologize, but I'm having trouble processing that right now. Please try asking something else! 🌱",
                timestamp: new Date(),
              }
              setChatHistory((prev) => [...prev, errorMessage])
            } finally {
              setIsLoading(false)
            }
          },
          150 + Math.random() * 100,
        )
      })
    },
    [prompt, userContext],
  )

  const clearChat = useCallback(() => {
    setChatHistory([])
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSubmit()
      }
    },
    [handleSubmit],
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Icons.sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl">Growth AI Assistant</span>
              <p className="text-sm text-gray-500 font-normal">🌱 100% Free • Offline • Lightning Fast</p>
            </div>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Your personal AI productivity assistant that works completely offline and responds instantly to any
            productivity question.
          </DialogDescription>
          {chatHistory.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearChat}>
              Clear Chat
            </Button>
          )}
        </DialogHeader>

        <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
          {chatHistory.length === 0 ? (
            <div className="space-y-4">
              <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-blue-50 rounded-xl border border-emerald-200/50">
                <Icons.sparkles className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to your Local Growth AI! 🌱</h3>
                <p className="text-gray-600">
                  Completely offline, lightning-fast responses, and comprehensive productivity support - all free and
                  private!
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Quick Actions</h4>
                <div className="grid gap-3">
                  {suggestions.map((suggestion, index) => (
                    <SuggestionCard
                      key={index}
                      suggestion={suggestion}
                      onClick={() => handleSubmit(suggestion.prompt)}
                    />
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200/50">
                <h4 className="font-semibold text-blue-900 mb-2">💬 Ask Me Anything!</h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
                  <div>• "I'm feeling overwhelmed"</div>
                  <div>• "How do I stop procrastinating?"</div>
                  <div>• "I need motivation"</div>
                  <div>• "Help me build better habits"</div>
                  <div>• "Explain time blocking"</div>
                  <div>• "I'm struggling with focus"</div>
                </div>
              </div>
            </div>
          ) : (
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                {chatHistory.map((message, index) => (
                  <ChatMessage key={`${message.timestamp.getTime()}-${index}`} message={message} />
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-4 rounded-xl">
                      <div className="flex items-center space-x-2">
                        <Icons.spinner className="w-4 h-4 animate-spin" />
                        <span className="text-sm text-gray-600">AI thinking... ⚡</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}

          <div className="space-y-3 border-t pt-4">
            <Textarea
              placeholder="Ask me anything about productivity, motivation, focus, habits, goals, or wellness! ⚡"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[80px] resize-none border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
              onKeyDown={handleKeyDown}
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                  🌱 100% Free
                </Badge>
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                  ⚡ Offline & Fast
                </Badge>
                <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                  🔒 Private
                </Badge>
                <Badge variant="outline" className="text-xs">
                  📊 {userContext.totalTasks} tasks
                </Badge>
              </div>

              <Button
                onClick={() => handleSubmit()}
                disabled={!prompt.trim() || isLoading}
                className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white"
              >
                {isLoading ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Thinking...
                  </>
                ) : (
                  <>
                    <Icons.sparkles className="mr-2 h-4 w-4" />
                    Send
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 text-center">Press Enter to send • Completely offline and private ⚡</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
