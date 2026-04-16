
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  streak: number;
}

import {
  LayoutDashboard,
  Dumbbell,
  Moon,
  Flame,
  Utensils,
  Activity
} from 'lucide-react';

const Icons = {
  Dashboard: () => <LayoutDashboard size={20} strokeWidth={2} />,
  Workouts: () => <Dumbbell size={20} strokeWidth={2} />,
  Sleep: () => <Moon size={20} strokeWidth={2} />,
  Calories: () => <Flame size={20} strokeWidth={2} />,
  MealPlanner: () => <Utensils size={20} strokeWidth={2} />,
  Pulse: () => <Activity size={16} strokeWidth={2.5} />
};

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, streak }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <Icons.Dashboard /> },
    { id: 'workouts', label: 'Workouts', icon: <Icons.Workouts /> },
    { id: 'sleep', label: 'Sleep Logs', icon: <Icons.Sleep /> },
    { id: 'calories', label: 'Calorie Tracker', icon: <Icons.Calories /> },
    { id: 'meal-planner', label: 'AI Meal Planner', icon: <Icons.MealPlanner /> },
  ];

  return (
    <div className="flex h-screen overflow-hidden text-foreground">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-72 glass-dark z-20">
        <div className="p-8 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-black font-black text-xl shadow-[0_0_20px_rgba(255,255,255,0.2)]">FP</div>
            <h1 className="text-xl font-black tracking-tight text-white">FitPulse</h1>
          </div>
        </div>
        
        <div className="px-6 mb-6">
           <div className="glass bg-white/5 border-white/5 rounded-2xl p-5 flex items-center gap-4 group">
              <div className="w-12 h-12 bg-chart2/20 border border-chart2/30 rounded-xl flex items-center justify-center text-chart2 shadow-lg shadow-chart2/20">
                <Icons.Pulse />
              </div>
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Consistency Streak</p>
                <p className="text-2xl font-black leading-none text-white">{streak} <span className="text-[10px] font-bold text-muted-foreground">DAYS</span></p>
              </div>
           </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeTab === item.id 
                ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)] translate-x-1' 
                : 'text-muted-foreground hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className={activeTab === item.id ? 'text-white' : 'text-muted-foreground/60'}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <main className="flex-1 overflow-y-auto p-4 md:p-12 scroll-smooth z-10">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
