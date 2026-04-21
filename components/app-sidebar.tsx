import * as React from "react"
import { Activity, Dumbbell, Flame, Moon, Scale, Sparkles } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const navItems = [
  { id: "dashboard", title: "Overview", icon: Activity },
  { id: "workouts", title: "Workouts", icon: Dumbbell },
  { id: "sleep", title: "Sleep", icon: Moon },
  { id: "calories", title: "Nutrition", icon: Flame },
  { id: "bmi", title: "BMI", icon: Scale },
  { id: "meal-planner", title: "AI Meals", icon: Sparkles },
]

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  activeTab: string
  setActiveTab: (tab: string) => void
  streak: number
}

export function AppSidebar({ activeTab, setActiveTab, streak, ...props }: Readonly<AppSidebarProps>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader className="gap-3 px-4 pt-4 pb-2">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground">FitPulse</p>
              <p className="mt-1 text-base font-semibold tracking-tight text-foreground">Health tracker</p>
            </div>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-primary text-sm font-semibold text-primary-foreground">
              FP
            </div>
          </div>
          <div className="mt-4 rounded-lg border border-border bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground">Streak</p>
            <p className="mt-1 text-xl font-semibold text-foreground">{streak} days</p>
          </div>
        </div>
      </SidebarHeader>

      
      <SidebarContent>
        <SidebarGroup className="px-2 py-1.5">
          <SidebarGroupLabel className="px-3 text-xs text-muted-foreground/80">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5 px-1.5">
              {navItems.map((item) => {
                const Icon = item.icon

                return (
                  <SidebarMenuItem key={item.id} className="px-1">
                    <SidebarMenuButton
                      type="button"
                      isActive={activeTab === item.id}
                      onClick={() => setActiveTab(item.id)}
                      className="h-11 rounded-lg px-3.5 text-sm font-medium"
                    >
                      <Icon className="size-4" />
                      <span className="truncate">{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
