
import React, { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DatePicker } from '@/components/ui/date-picker';
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
  Pulse: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  Water: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
};

const sectionCard = 'rounded-2xl border border-white/10 bg-black p-6 md:p-8';

const formatLabel = (date: string, format: Intl.DateTimeFormatOptions) =>
  new Date(date).toLocaleDateString('en-US', format);

interface StatTileProps {
  label: string;
  value: string;
  icon: React.ReactNode;
}

const StatTile: React.FC<StatTileProps> = ({ label, value, icon }) => (
  <div className="rounded-xl border border-white/10 bg-white/2 p-4">
    <div className="mb-4 flex items-center justify-between gap-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white">
        {icon}
      </div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
    </div>
    <p className="text-2xl font-semibold tracking-tight text-white">{value}</p>
  </div>
);

interface ChartPanelProps {
  title: string;
  valueLabel: string;
  stroke: string;
  fill: string;
  data: Array<Record<string, string | number>>;
  dataKey: string;
}

const ChartPanel: React.FC<ChartPanelProps> = ({ title, valueLabel, stroke, fill, data, dataKey }) => (
  <section className={sectionCard}>
    <div className="mb-5 flex items-center justify-between">
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <span className="text-xs text-muted-foreground">{valueLabel}</span>
    </div>
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 0, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
          <YAxis hide />
          <Tooltip
            cursor={{ stroke: 'rgba(255,255,255,0.16)' }}
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.98)',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.12)',
              fontSize: '12px',
            }}
            itemStyle={{ color: '#fff', fontWeight: 600 }}
            labelStyle={{ color: 'rgba(255,255,255,0.68)' }}
          />
          <Area type="monotone" dataKey={dataKey} stroke={stroke} strokeWidth={2.5} fill={fill} fillOpacity={0.22} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </section>
);

const Dashboard: React.FC<DashboardProps> = ({ workouts, sleepLogs, calorieLogs, waterLogs, userProfile, streak, onAddWater }) => {
  const today = new Date().toISOString().split('T')[0];
  const [selectedWaterDate, setSelectedWaterDate] = useState(today);

  const stats = useMemo(() => {
    const todaysCalories = calorieLogs.filter(log => log.date === today).reduce((sum, log) => sum + log.calories, 0);
    const avgSleep = sleepLogs.length > 0 ? sleepLogs.reduce((sum, log) => sum + log.duration, 0) / sleepLogs.length : 0;
    return { todaysCalories, avgSleep, totalWorkouts: workouts.length };
  }, [today, workouts, sleepLogs, calorieLogs]);

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
      .slice(0, 4)
      .map(([date, amount]) => ({
        date,
        label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        amount
      }));
  }, [waterLogs]);

  const workoutChartData = useMemo(() => {
    return workouts.slice(-7).map(w => ({
      date: formatLabel(w.date, { weekday: 'short' }),
      volume: w.exercises.reduce((sum, ex) => sum + (ex.sets * ex.reps * ex.weight), 0)
    }));
  }, [workouts]);

  const sleepChartData = useMemo(() => {
    return [...sleepLogs]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7)
      .map(log => ({
        date: formatLabel(log.date, { weekday: 'short' }),
        hours: log.duration
      }));
  }, [sleepLogs]);

  const dashboardStats = [
    {
      label: 'Streak',
      value: `${streak} days`,
      icon: <Icons.Pulse />,
    },
    {
      label: 'Calories',
      value: `${stats.todaysCalories}`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" /></svg>
      ),
    },
    {
      label: 'Sleep',
      value: `${stats.avgSleep.toFixed(1)}h`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>
      ),
    }
  ];

  return (
    <div className="space-y-6">
      <section className={sectionCard}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{formatLabel(today, { weekday: 'long', month: 'short', day: 'numeric' })}</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">Today</h2>
            <p className="mt-2 text-sm text-muted-foreground">A quick view of training, sleep, and water.</p>
          </div>
          <div className="grid w-full gap-3 sm:grid-cols-3 lg:w-auto lg:min-w-110">
            {dashboardStats.map((stat) => (
              <StatTile
                key={stat.label}
                label={stat.label}
                value={stat.value}
                icon={stat.icon}
              />
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-12">
        <section className={`${sectionCard} lg:col-span-4`}>
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">Hydration</h3>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white">
              <Icons.Water />
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/2 p-4">
            <p className="text-xs text-muted-foreground">Selected day</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-white">{selectedWaterTotal} ml</p>
            <p className="mt-1 text-sm text-muted-foreground">{formatLabel(selectedWaterDate, { month: 'short', day: 'numeric' })}</p>
          </div>

          <div className="mt-4">
            <DatePicker
              date={selectedWaterDate}
              onDateChange={(date) => {
                setSelectedWaterDate(typeof date === 'string' ? date : date.toISOString().split('T')[0]);
              }}
              placeholder="Pick date"
              width="w-full"
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onAddWater(selectedWaterDate, 250)}
              className="h-11 rounded-lg border border-white/10 bg-white text-sm font-medium text-black transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Add 250 ml
            </button>
            <button
              type="button"
              onClick={() => onAddWater(selectedWaterDate, 500)}
              className="h-11 rounded-lg border border-white/10 bg-white/2 text-sm font-medium text-white transition hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Add 500 ml
            </button>
          </div>

          <div className="mt-5 border-t border-white/10 pt-4">
            <p className="text-xs text-muted-foreground">Recent</p>
            <div className="mt-3 space-y-2">
              {recentWaterDays.length > 0 ? recentWaterDays.map((entry) => (
                <button
                  key={entry.date}
                  type="button"
                  onClick={() => setSelectedWaterDate(entry.date)}
                  className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${selectedWaterDate === entry.date ? 'border-white bg-white text-black' : 'border-white/10 bg-white/2 text-white hover:bg-white/6'}`}
                >
                  <span>{entry.label}</span>
                  <span className="font-semibold">{entry.amount} ml</span>
                </button>
              )) : (
                <div className="rounded-lg border border-dashed border-white/10 px-3 py-4 text-sm text-muted-foreground">
                  No logs yet
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="space-y-6 lg:col-span-8">
          <ChartPanel
            title="Training volume"
            valueLabel="Last 7 workouts"
            stroke="var(--chart-1)"
            fill="var(--chart-1)"
            data={workoutChartData}
            dataKey="volume"
          />

          <ChartPanel
            title="Sleep hours"
            valueLabel="Last 7 nights"
            stroke="var(--chart-2)"
            fill="var(--chart-2)"
            data={sleepChartData}
            dataKey="hours"
          />

          <section className={sectionCard}>
            <h3 className="text-base font-semibold text-white">Profile</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-white/10 bg-white/2 p-4">
                <p className="text-xs text-muted-foreground">Weight</p>
                <p className="mt-1 text-lg font-semibold text-white">{userProfile.weight} kg</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/2 p-4">
                <p className="text-xs text-muted-foreground">Goal</p>
                <p className="mt-1 text-lg font-semibold capitalize text-white">{userProfile.goal}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/2 p-4">
                <p className="text-xs text-muted-foreground">Workouts</p>
                <p className="mt-1 text-lg font-semibold text-white">{stats.totalWorkouts}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
