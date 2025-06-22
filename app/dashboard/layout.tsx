"use client"

import type React from "react"
import { useState } from "react"
import { DataProvider } from "@/components/local-data-provider"
import { Sidebar } from "@/components/dashboard/sidebar"
import { TopNav } from "@/components/dashboard/top-nav"
import { AIAssistantModal } from "@/components/dashboard/ai-assistant-modal"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAIModalOpen, setIsAIModalOpen] = useState(false)

  return (
    <DataProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
        <div className="flex">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <TopNav onAIAssistantClick={() => setIsAIModalOpen(true)} />
            <main className="flex-1 p-6">{children}</main>
          </div>
        </div>

        <AIAssistantModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} />
      </div>
    </DataProvider>
  )
}
