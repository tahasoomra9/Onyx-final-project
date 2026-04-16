
import React, { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { WorkoutSession, SleepLog, CalorieLog, UserProfile, WaterLog } from '../types';

interface DashboardProps {
  workouts: WorkoutSession[];
  sleepLogs: SleepLog[];
  calorieLogs: CalorieLog[];
  waterLogs: WaterLog[];
  userProfile: UserProfile;
  streak: number;
  onAddWater: (date: string, amount: number) => void;
}

const Icons = {
  Pulse: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  Water: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
};

const Dashboard: React.FC<DashboardProps> = ({ workouts, sleepLogs, calorieLogs, waterLogs, userProfile, streak, onAddWater }) => {
  const today = new Date().toISOString().split('T')[0];
  const [selectedWaterDate, setSelectedWaterDate] = useState(today);

  const stats = useMemo(() => {
    const todaysCalories = calorieLogs.filter(log => log.date === today).reduce((sum, log) => sum + log.calories, 0);
    const todaysWater = waterLogs.filter(log => log.date === today).reduce((sum, log) => sum + log.amount, 0);
    const avgSleep = sleepLogs.length > 0 ? sleepLogs.reduce((sum, log) => sum + log.duration, 0) / sleepLogs.length : 0;
    const totalVolume = workouts.reduce((total, w) => total + w.exercises.reduce((sum, ex) => sum + (ex.sets * ex.reps * ex.weight), 0), 0);
    return { todaysCalories, todaysWater, avgSleep, totalVolume, totalWorkouts: workouts.length };
  }, [workouts, sleepLogs, calorieLogs, waterLogs]);

  const selectedWaterTotal = useMemo(() => {
    return waterLogs.filter(log => log.date === selectedWaterDate).reduce((sum, log) => sum + log.amount, 0);
  }, [waterLogs, selectedWaterDate]);

  const recentWaterDays = useMemo(() => {
    const totalsByDate = new Map<string, number>();
    waterLogs.forEach(log => {
      totalsByDate.set(log.date, (totalsByDate.get(log.date) || 0) + log.amount);
    });

    return Array.from(totalsByDate.entries())
      .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
      .slice(0, 5)
      .map(([date, amount]) => ({
        date,
        label: new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        amount
      }));
  }, [waterLogs]);

  const workoutChartData = useMemo(() => {
    return workouts.slice(-10).map(w => ({
      date: new Date(w.date).toLocaleDateString('en-US', { weekday: 'short' }),
      volume: w.exercises.reduce((sum, ex) => sum + (ex.sets * ex.reps * ex.weight), 0)
    }));
  }, [workouts]);

  const sleepChartData = useMemo(() => {
    return [...sleepLogs]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-10)
      .map(log => ({
        date: new Date(log.date).toLocaleDateString('en-US', { weekday: 'short' }),
        hours: log.duration
      }));
  }, [sleepLogs]);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-white uppercase">System Dashboard</h2>
          <p className="text-muted-foreground mt-2 font-medium">Holistic biological status and progression metrics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass p-8 rounded-[2.5rem] group hover:bg-white/5 transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-chart2/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-chart2/10 transition-colors"></div>
          <div className="flex items-center gap-5 mb-8">
            <div className="w-14 h-14 bg-chart2/10 rounded-2xl flex items-center justify-center text-chart2 transition-transform group-hover:scale-110">
              <Icons.Pulse />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Consistency</p>
              <h3 className="text-3xl font-black text-white">{streak} <span className="text-xs font-normal text-muted-foreground">Days</span></h3>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-40">Uninterrupted momentum</p>
        </div>

        <div className="glass p-8 rounded-[2.5rem] group hover:bg-white/5 transition-all">
          <div className="flex items-center gap-5 mb-8">
            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-white transition-transform group-hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Metabolic Fuel</p>
              <h3 className="text-3xl font-black text-white">{stats.todaysCalories} <span className="text-xs font-normal text-muted-foreground">Kcal</span></h3>
            </div>
          </div>
          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
            <div className="bg-white h-full transition-all duration-1000 shadow-[0_0_15px_rgba(255,255,255,0.4)]" style={{ width: `${Math.min(100, (stats.todaysCalories / 2500) * 100)}%` }}></div>
          </div>
        </div>

        <div className="glass p-8 rounded-[2.5rem] group hover:bg-white/5 transition-all">
          <div className="flex items-center gap-5 mb-8">
            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-white transition-transform group-hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">System Repair</p>
              <h3 className="text-3xl font-black text-white">{stats.avgSleep.toFixed(1)} <span className="text-xs font-normal text-muted-foreground">Hrs</span></h3>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-40">7-Day average recovery</p>
        </div>

        <div className="glass p-8 rounded-[2.5rem] group hover:bg-white/5 transition-all">
          <div className="flex items-center gap-5 mb-8">
            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-white transition-transform group-hover:scale-110">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="12" x="3" y="6" rx="2"/><path d="M3 12h18"/><path d="M9 18h6"/></svg>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Gross Volume</p>
              <h3 className="text-3xl font-black text-white">{stats.totalVolume.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">Kg</span></h3>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-40">Cumulative load across all sets</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* Workout Chart */}
          <div className="glass p-10 rounded-[3rem] h-100">
            <div className="flex justify-between items-center mb-10">
              <h4 className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground">Force-Production Intensity</h4>
              <div className="flex gap-2">
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                   <span className="text-[10px] font-black uppercase text-muted-foreground">Volume</span>
                 </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height="80%">
              <AreaChart data={workoutChartData}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="rgba(255,255,255,0.2)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="rgba(255,255,255,0)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontWeight: 'bold' }} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '12px' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="volume" stroke="#fff" strokeWidth={3} fillOpacity={1} fill="url(#colorVolume)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Sleep Chart */}
          <div className="glass p-10 rounded-[3rem] h-100">
            <div className="flex justify-between items-center mb-10">
              <h4 className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground">Recovery Efficiency Trend</h4>
              <div className="flex gap-2">
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-chart2 shadow-[0_0_10px_rgba(38,113,244,0.5)]"></div>
                   <span className="text-[10px] font-black uppercase text-muted-foreground">Hours</span>
                 </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height="80%">
              <AreaChart data={sleepChartData}>
                <defs>
                  <linearGradient id="colorSleep" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '12px' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="hours" stroke="var(--chart-2)" strokeWidth={3} fillOpacity={1} fill="url(#colorSleep)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="glass p-10 rounded-[3rem] flex flex-col items-center justify-center text-center space-y-8">
             <div className="w-24 h-24 bg-chart2/10 rounded-full flex items-center justify-center text-chart2 relative group">
               <div className="absolute inset-0 bg-chart2/20 rounded-full scale-125 animate-pulse opacity-20"></div>
               <Icons.Water />
             </div>
             <div>
               <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2">Hydration Index</h4>
               <p className="text-5xl font-black text-white">{selectedWaterTotal} <span className="text-xs font-normal text-muted-foreground">ml</span></p>
               <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-3">{new Date(selectedWaterDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
             </div>
             <div className="w-full text-left space-y-3">
               <label htmlFor="water-date" className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground">Log Day</label>
               <input
                 id="water-date"
                 type="date"
                 value={selectedWaterDate}
                 onChange={(e) => setSelectedWaterDate(e.target.value)}
                 className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none focus:ring-1 focus:ring-white"
               />
             </div>
             <div className="flex gap-2 w-full">
               <button onClick={() => onAddWater(selectedWaterDate, 250)} className="flex-1 py-3 glass hover:bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95">+ 250ml</button>
               <button onClick={() => onAddWater(selectedWaterDate, 500)} className="flex-1 py-3 glass hover:bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95">+ 500ml</button>
             </div>
             <p className="text-[10px] text-muted-foreground font-medium max-w-50 mx-auto">Choose a day, then add intake in meaningful increments.</p>
             <div className="w-full pt-6 border-t border-white/5 text-left space-y-3">
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Recent Logs</p>
               <div className="space-y-2">
                 {recentWaterDays.length > 0 ? recentWaterDays.map(entry => (
                   <button
                     key={entry.date}
                     type="button"
                     onClick={() => setSelectedWaterDate(entry.date)}
                     className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border transition-all ${selectedWaterDate === entry.date ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
                   >
                     <span className="text-[10px] font-black uppercase tracking-widest">{entry.label}</span>
                     <span className={selectedWaterDate === entry.date ? 'text-xs font-black' : 'text-xs font-black text-chart2'}>{entry.amount} ml</span>
                   </button>
                 )) : (
                   <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">No water logs yet.</div>
                 )}
               </div>
             </div>
          </div>

          <div className="glass p-10 rounded-[3rem]">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-6">Profile Snapshot</h4>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-muted-foreground">Weight</span>
                <span className="font-black text-white">{userProfile.weight}kg</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-muted-foreground">Objective</span>
                <span className="font-black text-white uppercase">{userProfile.goal}</span>
              </div>
              <div className="flex justify-between items-center pt-6 border-t border-white/5">
                <span className="text-sm font-bold text-muted-foreground">Total Logs</span>
                <span className="font-black text-chart2 tabular-nums">{stats.totalWorkouts}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
