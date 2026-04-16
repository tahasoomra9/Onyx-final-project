
import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SleepLog } from '../types';

interface SleepLoggerProps {
  sleepLogs: SleepLog[];
  onAddSleep: (log: SleepLog) => void;
}

const SleepLogger: React.FC<SleepLoggerProps> = ({ sleepLogs, onAddSleep }) => {
  const [duration, setDuration] = useState(8);
  const [quality, setQuality] = useState(3);
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddSleep({
      id: Math.random().toString(36).slice(2, 11),
      date,
      duration,
      quality,
      notes
    });
    setNotes('');
  };

  const getQualityLabel = (q: number) => {
    switch (q) {
      case 1: return 'POOR';
      case 2: return 'FAIR';
      case 3: return 'GOOD';
      case 4: return 'GREAT';
      case 5: return 'ELITE';
      default: return '';
    }
  };

  const chartData = useMemo(() => {
    return [...sleepLogs]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-14)
      .map(log => ({
        date: new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        hours: log.duration,
      }));
  }, [sleepLogs]);

  const getQualityDotClass = (q: number) => {
    if (q >= 4) return 'bg-chart2';
    if (q >= 3) return 'bg-chart1';
    return 'bg-destructive';
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="max-w-3xl">
        <h2 className="text-4xl font-black tracking-tighter text-white uppercase">Sleep Recovery</h2>
        <p className="text-muted-foreground mt-2 font-medium">Optimize your circadian rhythm and rest periods.</p>
      </div>

      {/* Sleep History Chart */}
      <div className="glass p-10 rounded-[3rem] h-[380px]">
        <div className="flex justify-between items-center mb-10">
          <h4 className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground">Recovery Cycle Trend</h4>
          <span className="text-[10px] font-black uppercase text-muted-foreground opacity-30">Last 14 Records</span>
        </div>
        <ResponsiveContainer width="100%" height="80%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorSleep" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.45}/>
                <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontWeight: 'bold' }} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} 
              domain={[0, 15]}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '12px' }}
              itemStyle={{ color: '#fff', fontWeight: 'bold' }}
            />
            <Area 
              type="monotone" 
              dataKey="hours" 
              stroke="var(--chart-2)" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#colorSleep)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5">
          <form onSubmit={handleSubmit} className="glass p-8 rounded-[2.5rem] border-white/10 space-y-8 h-fit">
            <div>
              <label htmlFor="sleep-date" className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">Recording Date</label>
              <input 
                id="sleep-date"
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none focus:ring-1 focus:ring-white"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <label htmlFor="sleep-duration" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Duration</label>
                <span className="text-xl font-black text-white">{duration} <span className="text-[10px] font-bold text-muted-foreground">HRS</span></span>
              </div>
              <input 
                id="sleep-duration"
                type="range" 
                min="0" 
                max="15" 
                step="0.5"
                value={duration}
                onChange={(e) => setDuration(Number.parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <label htmlFor="sleep-quality-1" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">System Quality</label>
                <span className="text-[10px] font-black bg-white text-black px-2 py-0.5 rounded tracking-widest">{getQualityLabel(quality)}</span>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(q => (
                  <button
                    id={`sleep-quality-${q}`}
                    key={q}
                    type="button"
                    onClick={() => setQuality(q)}
                    className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${
                      quality === q ? 'bg-white text-black' : 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="sleep-notes" className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">Rest Notes</label>
              <textarea 
                id="sleep-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observed fatigue or REM notes..."
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl h-28 resize-none text-sm outline-none focus:ring-1 focus:ring-white"
              />
            </div>

            <button className="w-full bg-white text-black py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:opacity-90 transition shadow-[0_0_30px_rgba(255,255,255,0.12)]">
              Update Bio-Data
            </button>
          </form>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <h3 className="text-2xl font-black tracking-tighter text-white uppercase border-b border-white/5 pb-4">Sleep Archives</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {sleepLogs.slice().reverse().map(log => (
              <div key={log.id} className="glass p-8 rounded-[2rem] border-white/10 group hover:bg-white/5 transition-all relative overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  <div className={`w-3 h-3 rounded-full ${getQualityDotClass(log.quality)}`} />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-white">{log.duration}</span>
                  <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">Hours</span>
                </div>
                <div className="mt-4 pt-4 border-t border-white/5">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Quality Score: {log.quality}/5</p>
                  {log.notes && <p className="text-sm text-muted-foreground/80 font-medium leading-relaxed italic line-clamp-2">&ldquo;{log.notes}&rdquo;</p>}
                </div>
              </div>
            ))}
            {sleepLogs.length === 0 && (
              <div className="col-span-full py-24 text-center text-muted-foreground glass rounded-[2.5rem] border-2 border-dashed border-white/10 flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-30"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                <p className="font-bold uppercase text-[10px] tracking-widest opacity-40">No sleep data recorded in system.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SleepLogger;
