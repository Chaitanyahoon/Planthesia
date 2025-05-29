"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Icons.dashboard },
  { name: "Tasks", href: "/dashboard/tasks", icon: Icons.tasks },
  { name: "Calendar", href: "/dashboard/calendar", icon: Icons.calendar },
  { name: "Pomodoro", href: "/dashboard/pomodoro", icon: Icons.timer },
  { name: "Insights", href: "/dashboard/insights", icon: Icons.insights },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white/80 backdrop-blur-sm border-r border-gray-200/50 h-screen sticky top-0">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-blue-600 rounded-xl flex items-center justify-center">
            <Icons.brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Planthesia
            </h1>
            <p className="text-xs text-gray-500">Smart Planning</p>
          </div>
        </div>
      </div>

      <nav className="px-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-emerald-50 to-blue-50 text-emerald-700 border border-emerald-200/50"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-emerald-600" : "text-gray-400")} />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
