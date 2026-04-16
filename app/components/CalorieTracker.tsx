
import React, { useState, useMemo } from 'react';
import { CalorieLog, UserProfile } from '../types';

interface CalorieTrackerProps {
  logs: CalorieLog[];
  userProfile: UserProfile;
  onAddLog: (log: CalorieLog) => void;
  onUpdateProfile: (profile: UserProfile) => void;
}

const CalorieTracker: React.FC<CalorieTrackerProps> = ({ logs, userProfile, onAddLog, onUpdateProfile }) => {
  const [foodLabel, setFoodLabel] = useState('');
  const [cals, setCals] = useState('');

  const targetCalories = useMemo(() => {
    // Mifflin-St Jeor Equation
    let bmr = (10 * userProfile.weight) + (6.25 * userProfile.height) - (5 * userProfile.age);
    bmr = userProfile.gender === 'male' ? bmr + 5 : bmr - 161;
    
    const tdee = bmr * userProfile.activityLevel;
    
    if (userProfile.goal === 'cut') return Math.round(tdee - 500);
    if (userProfile.goal === 'bulk') return Math.round(tdee + 500);
    return Math.round(tdee);
  }, [userProfile]);

  const today = new Date().toISOString().split('T')[0];
  const todaysTotal = logs
    .filter(log => log.date === today)
    .reduce((sum, log) => sum + log.calories, 0);

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cals || !foodLabel) return;
    onAddLog({
      id: Math.random().toString(36).slice(2, 11),
      date: today,
      calories: Number.parseInt(cals, 10),
      label: foodLabel
    });
    setFoodLabel('');
    setCals('');
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="max-w-3xl">
        <h2 className="text-4xl font-black tracking-tighter text-white uppercase">Metabolic Log</h2>
        <p className="text-muted-foreground mt-2 font-medium">Track energy intake against target thresholds.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 space-y-8">
          <div className="glass p-10 rounded-[2.5rem] border-white/10 overflow-hidden relative">
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-6xl font-black tabular-nums tracking-tighter text-white">{todaysTotal}</span>
              <span className="text-muted-foreground font-black text-sm uppercase tracking-widest opacity-50">/ {targetCalories} Kcal</span>
            </div>
            
            <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden mb-12">
              <div 
                className={`h-full transition-all duration-1000 ${todaysTotal > targetCalories ? 'bg-destructive shadow-[0_0_20px_rgba(255,91,91,0.5)]' : 'bg-primary shadow-[0_0_20px_rgba(255,255,255,0.2)]'}`} 
                style={{ width: `${Math.min(100, (todaysTotal / targetCalories) * 100)}%` }}
              ></div>
            </div>

            <form onSubmit={handleAddLog} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="calorie-item-label" className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Item Label</label>
                  <input 
                    id="calorie-item-label"
                    placeholder="e.g. Oats & Whey"
                    value={foodLabel}
                    onChange={(e) => setFoodLabel(e.target.value)}
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-1 focus:ring-white text-sm font-bold"
                  />
                </div>
                <div>
                  <label htmlFor="calorie-unit-value" className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Unit Value (Kcal)</label>
                  <input 
                    id="calorie-unit-value"
                    type="number"
                    placeholder="500"
                    value={cals}
                    onChange={(e) => setCals(e.target.value)}
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-1 focus:ring-white text-sm font-bold"
                  />
                </div>
              </div>
              <button className="w-full bg-white text-black py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:opacity-90 transition shadow-[0_0_30px_rgba(255,255,255,0.12)]">
                Register Intake
              </button>
            </form>
          </div>

          <div className="glass p-8 rounded-[2rem] border-white/10">
            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-6">Daily Feed</h3>
            <div className="space-y-4">
              {logs.filter(l => l.date === today).map(log => (
                <div key={log.id} className="flex justify-between items-center py-4 border-b border-white/5 last:border-0 group">
                  <span className="text-white font-semibold group-hover:text-chart2 transition-colors">{log.label}</span>
                  <span className="font-black text-white tabular-nums">{log.calories} <span className="text-[10px] font-bold text-muted-foreground uppercase">kcal</span></span>
                </div>
              ))}
              {logs.filter(l => l.date === today).length === 0 && (
                <div className="py-10 text-center flex flex-col items-center opacity-30">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2"><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/><path d="M12 9v4"/><path d="M12 16v.01"/></svg>
                  <p className="text-[10px] font-black uppercase tracking-widest">No consumption events detected.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-full md:w-80 space-y-8">
          <h3 className="text-2xl font-black tracking-tighter text-white uppercase border-b border-white/5 pb-4">Core Settings</h3>
          <div className="glass p-8 rounded-[2rem] border-white/10 space-y-8">
            <div>
              <label htmlFor="calorie-goal" className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">Objective Mode</label>
              <select 
                id="calorie-goal"
                value={userProfile.goal}
                onChange={(e) => onUpdateProfile({ ...userProfile, goal: e.target.value as UserProfile['goal'] })}
                className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-white appearance-none cursor-pointer"
              >
                <option value="cut">Lipid Reduction (Cut)</option>
                <option value="maintain">Static Mass (Maintain)</option>
                <option value="bulk">Hypertrophy (Bulk)</option>
              </select>
            </div>
            <div>
              <label htmlFor="calorie-activity" className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">Activity Index</label>
              <select 
                id="calorie-activity"
                value={userProfile.activityLevel}
                onChange={(e) => onUpdateProfile({ ...userProfile, activityLevel: Number.parseFloat(e.target.value) })}
                className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-white appearance-none cursor-pointer"
              >
                <option value="1.2">Low / Sedentary</option>
                <option value="1.375">Light Movement</option>
                <option value="1.55">Standard / Moderate</option>
                <option value="1.725">High Frequency</option>
                <option value="1.9">Extreme Intensity</option>
              </select>
            </div>
            <div className="pt-8 border-t border-white/5">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 opacity-50">Recommended Limit</p>
              <p className="text-3xl font-black text-chart2 tabular-nums">{targetCalories} <span className="text-[10px] font-bold text-muted-foreground">KCAL/DAY</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalorieTracker;
