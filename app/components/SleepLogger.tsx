
import React, { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DatePicker } from '@/components/ui/date-picker';
import { Slider } from '@/components/ui/slider';
import { SleepLog } from '../types';

interface SleepLoggerProps {
  sleepLogs: SleepLog[];
  onAddSleep: (log: SleepLog) => void;
}

const panelClass = 'rounded-2xl border border-white/10 bg-black p-6 md:p-8';
const inputClass =
  'w-full rounded-lg border border-white/10 bg-white/2 px-3 py-3 text-sm text-white outline-none transition focus:border-white/30 focus:ring-2 focus:ring-white/20';

const SleepLogger: React.FC<SleepLoggerProps> = ({ sleepLogs, onAddSleep }) => {
  const [duration, setDuration] = useState(8);
  const [quality, setQuality] = useState(3);
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleDateChange = (value: string | Date) => {
    if (typeof value === 'string') {
      setDate(value);
      return;
    }

    setDate(value.toISOString().split('T')[0]);
  };

  const handleSubmit: NonNullable<React.ComponentProps<'form'>['onSubmit']> = (e) => {
    e.preventDefault();
    onAddSleep({
      id: Math.random().toString(36).slice(2, 11),
      date,
      duration,
      quality,
      notes,
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
      .slice(-10)
      .map((log) => ({
        date: new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        hours: log.duration,
      }));
  }, [sleepLogs]);

  const recentLogs = [...sleepLogs].reverse().slice(0, 8);
  const avgSleep =
    sleepLogs.length > 0 ? sleepLogs.reduce((sum, log) => sum + log.duration, 0) / sleepLogs.length : 0;

  const getQualityDotClass = (q: number) => {
    if (q >= 4) return 'bg-chart2';
    if (q >= 3) return 'bg-chart1';
    return 'bg-destructive';
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">Sleep</h2>
        <p className="text-sm text-muted-foreground">Log sleep in seconds and review your trend.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/2 p-4">
          <p className="text-xs text-muted-foreground">Average</p>
          <p className="mt-1 text-2xl font-semibold text-white">{avgSleep.toFixed(1)}h</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/2 p-4">
          <p className="text-xs text-muted-foreground">Entries</p>
          <p className="mt-1 text-2xl font-semibold text-white">{sleepLogs.length}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/2 p-4">
          <p className="text-xs text-muted-foreground">Current quality</p>
          <p className="mt-1 text-2xl font-semibold text-white">{getQualityLabel(quality).toLowerCase()}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <form onSubmit={handleSubmit} className={`${panelClass} space-y-6 lg:col-span-5`}>
          <div>
            <p className="mb-2 text-xs text-muted-foreground">Date</p>
            <DatePicker
              date={date}
              onDateChange={handleDateChange}
              placeholder="Pick date"
              width="w-full"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="text-sm font-medium text-white">{duration} h</p>
            </div>
            <Slider
              min={0}
              max={15}
              step={0.5}
              value={[duration]}
              onValueChange={(value) => setDuration(value[0])}
              className="w-full"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Quality</p>
              <p className="text-sm font-medium text-white">{getQualityLabel(quality).toLowerCase()}</p>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setQuality(q)}
                  className={`h-10 rounded-lg border text-sm font-medium transition ${quality === q ? 'border-white bg-white text-black' : 'border-white/10 bg-white/2 text-muted-foreground hover:text-white'}`}
                  aria-label={`Set sleep quality to ${q}`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="sleep-notes" className="mb-2 block text-xs text-muted-foreground">Notes (optional)</label>
            <textarea
              id="sleep-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did you feel?"
              className={`${inputClass} min-h-24 resize-none`}
            />
          </div>

          <button type="submit" className="h-11 w-full rounded-lg bg-white text-sm font-medium text-black transition hover:opacity-90">
            Save sleep entry
          </button>
        </form>

        <div className="space-y-6 lg:col-span-7">
          <section className={panelClass}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">Sleep trend</h3>
              <span className="text-xs text-muted-foreground">Last 10 nights</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 8, right: 0, left: -8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.98)',
                      borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,0.12)',
                      fontSize: '12px',
                    }}
                    itemStyle={{ color: '#fff', fontWeight: 600 }}
                    labelStyle={{ color: 'rgba(255,255,255,0.68)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="hours"
                    stroke="var(--chart-2)"
                    strokeWidth={2.5}
                    fill="var(--chart-2)"
                    fillOpacity={0.22}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className={panelClass}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">Recent entries</h3>
              <span className="text-xs text-muted-foreground">Last {recentLogs.length}</span>
            </div>

            {recentLogs.length > 0 ? (
              <div className="space-y-3">
                {recentLogs.map((log) => (
                  <div key={log.id} className="rounded-lg border border-white/10 bg-white/2 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-white">
                        {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className={`h-2.5 w-2.5 rounded-full ${getQualityDotClass(log.quality)}`} />
                        <span className="text-xs text-muted-foreground">{log.quality}/5</span>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-white">{log.duration} hours</p>
                    {log.notes && <p className="mt-2 text-sm text-muted-foreground">{log.notes}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-white/10 px-4 py-8 text-center text-sm text-muted-foreground">
                No sleep entries yet.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default SleepLogger;
