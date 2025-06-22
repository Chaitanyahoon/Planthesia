"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"

const navigation = [
  { name: "Growth Hub", href: "/dashboard", icon: Icons.seedling, description: "Your productivity overview" },
  { name: "Tasks Garden", href: "/dashboard/tasks", icon: Icons.leaf, description: "Manage your task ecosystem" },
  { name: "Time Planner", href: "/dashboard/calendar", icon: Icons.sun, description: "Schedule your growth" },
  { name: "Focus Grove", href: "/dashboard/pomodoro", icon: Icons.tree, description: "Deep work sessions" },
  { name: "Growth Insights", href: "/dashboard/insights", icon: Icons.sprout, description: "Track your progress" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-72 bg-gradient-to-b from-slate-50/95 via-blue-50/90 to-indigo-50/85 backdrop-blur-xl border-r border-slate-200/50 h-screen sticky top-0">
      {/* Header */}
      <div className="p-8">
        <div className="flex items-center space-x-4 animate-grow-in">
          <div className="relative">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 via-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-lg animate-leaf-float">
              <Icons.leaf className="w-7 h-7 text-white drop-shadow-sm" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">
              Planthesia
            </h1>
            <p className="text-sm text-slate-600 font-medium">Grow Your Productivity</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-6 space-y-3">
        {navigation.map((item, index) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center space-x-4 px-5 py-4 rounded-3xl text-sm font-medium transition-all duration-300 relative overflow-hidden",
                isActive
                  ? "bg-white/80 backdrop-blur-sm text-slate-700 shadow-lg scale-105 border border-blue-200/50"
                  : "text-slate-600 hover:text-slate-700 hover:bg-white/40 hover:shadow-md",
              )}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Background gradient for active state */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-purple-50/20 rounded-3xl"></div>
              )}

              {/* Icon container */}
              <div
                className={cn(
                  "relative z-10 w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300",
                  isActive
                    ? "bg-gradient-to-br from-emerald-500 to-blue-600 shadow-md text-white"
                    : "bg-slate-100/50 text-slate-500 group-hover:bg-slate-200/60 group-hover:scale-110",
                )}
              >
                <item.icon className="w-5 h-5" />
              </div>

              {/* Text content */}
              <div className="relative z-10 flex-1">
                <div className="font-semibold">{item.name}</div>
                <div className="text-xs text-slate-500 group-hover:text-slate-600 transition-colors">
                  {item.description}
                </div>
              </div>

              {/* Active indicator */}
              {isActive && <div className="relative z-10 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>}
            </Link>
          )
        })}
      </nav>

      {/* Floating decorative elements */}
      <div className="absolute top-32 right-8 w-2 h-2 bg-blue-300/30 rounded-full float-element"></div>
      <div className="absolute top-64 right-12 w-1 h-1 bg-indigo-400/40 rounded-full float-element"></div>
      <div className="absolute top-96 right-6 w-1.5 h-1.5 bg-purple-300/35 rounded-full float-element"></div>
    </div>
  )
}
