
import React, { useState, useEffect } from 'react';
import { generateMealPlan, getMealSuggestions } from '../services/geminiService';
import { WeeklyMealPlan } from '../types';

const MealPlanner: React.FC = () => {
  const [query, setQuery] = useState('');
  const preferences = 'High Protein, Clean Eating';
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [mealPlan, setMealPlan] = useState<WeeklyMealPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const data = await getMealSuggestions(preferences);
        setSuggestions(data);
      } catch (error) {
        console.error(error);
        setSuggestions(["Mediterranean Bulk", "Keto Strength", "Vegan Muscle", "Low-Carb Shred"]);
      }
    };
    fetchSuggestions();
  }, [preferences]);

  const handleGenerate = async (q?: string) => {
    const activeQuery = q || query;
    if (!activeQuery) return;
    setLoading(true);
    setError(null);
    try {
      const plan = await generateMealPlan(activeQuery, preferences);
      setMealPlan(plan);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Meal plan generation failed.";
      setError(message);
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="max-w-3xl">
        <h2 className="text-4xl font-black tracking-tighter text-white uppercase">Nutritional Synthesis</h2>
        <p className="text-muted-foreground mt-2 font-medium">Algorithmic macro distribution for peak anabolic recovery.</p>
      </div>

      <div className="glass p-10 rounded-[3rem] space-y-10">
        <div className="space-y-6">
          <label htmlFor="meal-query" className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest">Biological Input Vector</label>
          <div className="flex flex-col md:flex-row gap-4">
            <input 
              id="meal-query"
              placeholder="e.g. 2500kcal Mediterranean with extra protein..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 px-8 py-5 glass border-white/10 rounded-4xl outline-none focus:ring-2 focus:ring-white font-bold"
            />
            <button 
              onClick={() => handleGenerate()}
              disabled={loading}
              className="px-12 py-5 bg-white text-black font-black text-xs uppercase tracking-[0.2em] rounded-4xl hover:opacity-90 transition disabled:opacity-20 shadow-xl flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : 'Synthesize Diet'}
            </button>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-6 opacity-40">Preset Matrices</p>
          <div className="flex flex-wrap gap-3">
            {suggestions.map((s) => (
              <button 
                key={s}
                onClick={() => { setQuery(s); handleGenerate(s); }}
                className="px-6 py-3 glass hover:bg-white/10 border-white/5 text-muted-foreground hover:text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-200">
            {error}
          </div>
        )}
      </div>

      {mealPlan && (
        <div className="space-y-10 animate-in slide-in-from-bottom-6 duration-1000">
          <h3 className="text-3xl font-black text-white uppercase tracking-tighter border-b border-white/5 pb-8">7-Day Protocol Stream</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
            {mealPlan.plan.map((day) => (
              <div key={day.day} className="glass p-10 rounded-[3.5rem] group hover:bg-white/5 transition-all space-y-8 relative overflow-hidden">
                <div className="pb-6 border-b border-white/5 flex justify-between items-center">
                  <h4 className="text-2xl font-black text-white uppercase tracking-tighter">{day.day}</h4>
                  <span className="text-[10px] font-black bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-white uppercase tracking-widest">
                    {(day.breakfast.calories + day.lunch.calories + day.dinner.calories + (day.snacks?.calories || 0)).toLocaleString()} KCAL
                  </span>
                </div>
                
                <div className="space-y-8">
                  <div className="group/item">
                    <p className="text-[10px] font-black text-chart1 uppercase tracking-[0.2em] mb-2 opacity-60">01 AM REFUEL</p>
                    <p className="text-lg font-bold text-white leading-tight group-hover/item:text-chart1 transition-colors">{day.breakfast.name}</p>
                    <p className="text-[10px] text-muted-foreground font-black uppercase mt-2 tracking-widest">{day.breakfast.calories} KCAL</p>
                  </div>
                  <div className="group/item">
                    <p className="text-[10px] font-black text-chart2 uppercase tracking-[0.2em] mb-2 opacity-60">02 MID-DAY SURGE</p>
                    <p className="text-lg font-bold text-white leading-tight group-hover/item:text-chart2 transition-colors">{day.lunch.name}</p>
                    <p className="text-[10px] text-muted-foreground font-black uppercase mt-2 tracking-widest">{day.lunch.calories} KCAL</p>
                  </div>
                  <div className="group/item">
                    <p className="text-[10px] font-black text-green-400 uppercase tracking-[0.2em] mb-2 opacity-60">03 PM RECOVERY</p>
                    <p className="text-lg font-bold text-white leading-tight group-hover/item:text-green-400 transition-colors">{day.dinner.name}</p>
                    <p className="text-[10px] text-muted-foreground font-black uppercase mt-2 tracking-widest">{day.dinner.calories} KCAL</p>
                  </div>
                  {day.snacks && (
                    <div className="group/item pt-4 border-t border-white/5">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 opacity-40">04 AUXILIARY FUEL</p>
                      <p className="font-bold text-white group-hover/item:text-white transition-colors">{day.snacks.name}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MealPlanner;
