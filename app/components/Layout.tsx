
import React from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  streak: number;
}

const tabLabels: Record<string, string> = {
  dashboard: 'Overview',
  workouts: 'Workouts',
  sleep: 'Sleep',
  calories: 'Nutrition',
  bmi: 'BMI',
  'meal-planner': 'AI Meals',
};

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, streak }) => {
  const currentTabLabel = tabLabels[activeTab] ?? 'Dashboard';

  return (
    <SidebarProvider>
      <AppSidebar activeTab={activeTab} setActiveTab={setActiveTab} streak={streak} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-white/10 bg-black px-4 md:px-6">
          <SidebarTrigger className="-ml-1 text-white hover:bg-white/5 focus-visible:ring-white" />
          <Separator orientation="vertical" className="h-4 bg-white/10" />
          <h1 className="text-base font-semibold text-white">{currentTabLabel}</h1>
        </header>

        <div className="flex flex-1 flex-col p-4 md:p-6">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Layout;
