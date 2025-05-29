"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Icons } from "@/components/icons"

const motivationalQuotes = [
  {
    text: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney",
  },
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
  },
  {
    text: "Don't watch the clock; do what it does. Keep going.",
    author: "Sam Levenson",
  },
  {
    text: "The future depends on what you do today.",
    author: "Mahatma Gandhi",
  },
  {
    text: "It is during our darkest moments that we must focus to see the light.",
    author: "Aristotle",
  },
  {
    text: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt",
  },
  {
    text: "The only impossible journey is the one you never begin.",
    author: "Tony Robbins",
  },
  {
    text: "Success is walking from failure to failure with no loss of enthusiasm.",
    author: "Winston Churchill",
  },
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
  },
  {
    text: "Life is what happens to you while you're busy making other plans.",
    author: "John Lennon",
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
    <Card className="bg-gradient-to-r from-emerald-50 via-blue-50 to-indigo-50 border-0 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <Icons.sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Daily Motivation</h3>
            <blockquote className="text-gray-700 italic text-lg leading-relaxed mb-2">"{currentQuote.text}"</blockquote>
            <cite className="text-sm font-medium text-emerald-600">— {currentQuote.author}</cite>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
