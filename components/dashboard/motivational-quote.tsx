"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Icons } from "@/components/icons"

const motivationalQuotes = [
  {
    text: "Like a tree, grow your roots deep and reach for the sky.",
    author: "Planthesia Wisdom",
  },
  {
    text: "Every small step is a seed planted for future success.",
    author: "Growth Mindset",
  },
  {
    text: "Productivity blooms when you water it with consistency.",
    author: "Garden of Success",
  },
  {
    text: "Just as plants need sunlight, your goals need daily attention.",
    author: "Nature's Productivity",
  },
  {
    text: "Growth happens slowly, then suddenly - trust the process.",
    author: "Organic Progress",
  },
  {
    text: "Prune away distractions to let your focus flourish.",
    author: "Mindful Gardening",
  },
  {
    text: "The best time to plant a tree was 20 years ago. The second best time is now.",
    author: "Ancient Wisdom",
  },
  {
    text: "Your potential is like a seed - it contains everything needed to grow.",
    author: "Inner Garden",
  },
  {
    text: "Seasons change, but consistent growth creates lasting results.",
    author: "Productivity Seasons",
  },
  {
    text: "Nurture your dreams like a gardener tends their plants.",
    author: "Dream Cultivation",
  },
]

export function MotivationalQuote() {
  const [currentQuote, setCurrentQuote] = useState(motivationalQuotes[0])

  useEffect(() => {
    // Get a random quote based on the current date to ensure consistency throughout the day
    const today = new Date().toDateString()
    const savedDate = localStorage.getItem("planthesia_quote_date")
    const savedQuote = localStorage.getItem("planthesia_daily_quote")

    if (savedDate === today && savedQuote) {
      setCurrentQuote(JSON.parse(savedQuote))
    } else {
      const randomIndex = Math.floor(Math.random() * motivationalQuotes.length)
      const newQuote = motivationalQuotes[randomIndex]
      setCurrentQuote(newQuote)
      localStorage.setItem("planthesia_quote_date", today)
      localStorage.setItem("planthesia_daily_quote", JSON.stringify(newQuote))
    }
  }, [])

  return (
    <Card className="card-organic border-0 shadow-lg animate-grow">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0 animate-leaf-sway">
            <Icons.leaf className="w-6 h-6 text-white icon-leaf" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-green-800 mb-2 flex items-center">
              <Icons.sprout className="w-4 h-4 mr-2" />
              Daily Growth Wisdom
            </h3>
            <blockquote className="text-green-700 italic text-lg leading-relaxed mb-2">
              "{currentQuote.text}"
            </blockquote>
            <cite className="text-sm font-medium text-emerald-600 flex items-center">
              <Icons.flower className="w-3 h-3 mr-1" />— {currentQuote.author}
            </cite>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
