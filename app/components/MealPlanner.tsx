import React, { useEffect, useMemo, useState } from 'react';
import { generateMealPlan, getMealSuggestions } from '../services/geminiService';
import { WeeklyMealPlan } from '../types';

const panelClass = 'rounded-2xl border border-border bg-card p-6 md:p-8';
const inputClass =
  'h-11 w-full rounded-lg border border-border bg-muted/40 px-3 text-sm text-foreground outline-none transition focus:border-ring/60 focus:ring-2 focus:ring-ring/30';

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
      } catch {
        setSuggestions(['Mediterranean high protein', 'Low carb cut', 'Budget muscle gain', 'Vegetarian bulk']);
      }
    };

    void fetchSuggestions();
  }, [preferences]);

  const handleGenerate = async (q?: string) => {
    const activeQuery = (q || query).trim();
    if (!activeQuery) return;

    setLoading(true);
    setError(null);

    try {
      const plan = await generateMealPlan(activeQuery, preferences);
      setMealPlan(plan);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not generate a meal plan.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const weeklyAverage = useMemo(() => {
    if (!mealPlan || mealPlan.plan.length === 0) return 0;

    const total = mealPlan.plan.reduce((sum, day) => {
      return sum + day.breakfast.calories + day.lunch.calories + day.dinner.calories + (day.snacks?.calories || 0);
    }, 0);

    return Math.round(total / mealPlan.plan.length);
  }, [mealPlan]);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">AI Meals</h2>
        <p className="text-sm text-muted-foreground">Generate a simple 7-day meal plan tailored to your goal.</p>
      </div>

      <section className={`${panelClass} space-y-5`}>
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px]">
          <input
            id="meal-query"
            placeholder="e.g. 2500 kcal high-protein Mediterranean"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => void handleGenerate()}
            disabled={loading}
            className="h-11 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
          >
            {loading ? 'Generating...' : 'Generate plan'}
          </button>
        </div>

        <div>
          <p className="mb-2 text-xs text-muted-foreground">Quick prompts</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setQuery(s);
                  void handleGenerate(s);
                }}
                className="h-9 rounded-md border border-border bg-muted/40 px-3 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </section>

      {mealPlan && (
        <>
          <section className="rounded-lg border border-border bg-muted/40 p-4">
            <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <p className="text-xs text-muted-foreground">Plan length</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{mealPlan.plan.length} days</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <p className="text-xs text-muted-foreground">Average calories</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{weeklyAverage} kcal</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <p className="text-xs text-muted-foreground">Preference</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">High protein</p>
            </div>
            </div>
          </section>

          <section className={panelClass}>
            <h3 className="text-base font-semibold text-foreground">7-day plan</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {mealPlan.plan.map((day) => {
                const dayTotal =
                  day.breakfast.calories + day.lunch.calories + day.dinner.calories + (day.snacks?.calories || 0);

                return (
                  <article key={day.day} className="rounded-lg border border-border bg-muted/40 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-semibold text-foreground">{day.day}</h4>
                      <p className="text-xs text-muted-foreground">{dayTotal} kcal</p>
                    </div>

                    <ul className="mt-3 space-y-2 text-sm">
                      <li className="rounded-md border border-border bg-card px-3 py-2">
                        <p className="text-xs text-muted-foreground">Breakfast</p>
                        <p className="text-foreground">{day.breakfast.name}</p>
                        <p className="text-xs text-muted-foreground">{day.breakfast.calories} kcal</p>
                      </li>
                      <li className="rounded-md border border-border bg-card px-3 py-2">
                        <p className="text-xs text-muted-foreground">Lunch</p>
                        <p className="text-foreground">{day.lunch.name}</p>
                        <p className="text-xs text-muted-foreground">{day.lunch.calories} kcal</p>
                      </li>
                      <li className="rounded-md border border-border bg-card px-3 py-2">
                        <p className="text-xs text-muted-foreground">Dinner</p>
                        <p className="text-foreground">{day.dinner.name}</p>
                        <p className="text-xs text-muted-foreground">{day.dinner.calories} kcal</p>
                      </li>
                      {day.snacks && (
                        <li className="rounded-md border border-border bg-card px-3 py-2">
                          <p className="text-xs text-muted-foreground">Snack</p>
                          <p className="text-foreground">{day.snacks.name}</p>
                          <p className="text-xs text-muted-foreground">{day.snacks.calories} kcal</p>
                        </li>
                      )}
                    </ul>
                  </article>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default MealPlanner;

