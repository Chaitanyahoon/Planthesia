"use client"

import { ProductivityCharts } from "@/components/dashboard/productivity-charts"
import { WeeklyStats } from "@/components/dashboard/weekly-stats"
import { ProductivityTrends } from "@/components/dashboard/productivity-trends"

export default function InsightsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Insights
          </h1>
          <p className="text-gray-600 mt-1">Track your productivity patterns and improvements.</p>
        </div>
      </div>

      <WeeklyStats />
      <ProductivityTrends />
      <ProductivityCharts />
    </div>
  )
}
