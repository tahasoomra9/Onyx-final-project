
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
  onLoadDemo?: () => void;
}

const tabLabels: Record<string, string> = {
  dashboard: 'Overview',
  workouts: 'Workouts',
  sleep: 'Sleep',
  calories: 'Nutrition',
  bmi: 'BMI',
  'meal-planner': 'AI Meals',
};

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, streak, onLoadDemo }) => {
  const currentTabLabel = tabLabels[activeTab] ?? 'Dashboard';

  return (
    <SidebarProvider>
      <AppSidebar activeTab={activeTab} setActiveTab={setActiveTab} streak={streak} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-card px-4 md:px-6">
          <SidebarTrigger className="-ml-1 text-foreground hover:bg-muted focus-visible:ring-ring" />
          <Separator orientation="vertical" className="h-4 bg-border" />
          <h1 className="text-base font-semibold text-foreground">{currentTabLabel}</h1>
          <div className="ml-auto flex items-center gap-2">
            {onLoadDemo ? (
              <button
                type="button"
                onClick={onLoadDemo}
                className="h-8 rounded-lg border border-border bg-muted/40 px-3 text-sm font-medium text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Demo
              </button>
            ) : null}
          </div>
        </header>

        <div className="flex flex-1 flex-col p-4 md:p-6">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Layout;
