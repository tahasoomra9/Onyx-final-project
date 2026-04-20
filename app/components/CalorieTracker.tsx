import React, { useMemo, useState } from 'react';
import { SelectDropdown } from '@/components/ui/select-dropdown';
import { DatePicker } from '@/components/ui/date-picker';
import { CalorieLog, UserProfile } from '../types';

interface CalorieTrackerProps {
  logs: CalorieLog[];
  userProfile: UserProfile;
  onAddLog: (log: CalorieLog) => void;
  onUpdateProfile: (profile: UserProfile) => void;
}

const panelClass = 'rounded-2xl border border-white/10 bg-black p-6 md:p-8';
const inputClass =
  'h-11 w-full rounded-lg border border-white/10 bg-white/2 px-3 text-sm text-white outline-none transition focus:border-white/30 focus:ring-2 focus:ring-white/20';

const CalorieTracker: React.FC<CalorieTrackerProps> = ({ logs, userProfile, onAddLog, onUpdateProfile }) => {
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [foodLabel, setFoodLabel] = useState('');
  const [cals, setCals] = useState('');

  const groupedByDate = useMemo(() => {
    const grouped = new Map<string, CalorieLog[]>();

    logs.forEach((log) => {
      grouped.set(log.date, [...(grouped.get(log.date) || []), log]);
    });

    return Array.from(grouped.entries())
      .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
      .map(([date, items]) => ({
        date,
        items,
        total: items.reduce((sum, item) => sum + item.calories, 0),
      }));
  }, [logs]);

  const selectedDateGroup = groupedByDate.find((group) => group.date === selectedDate);
  const selectedDateTotal = selectedDateGroup?.total || 0;
  const selectedDateLogs = selectedDateGroup?.items || [];
  const recentDays = groupedByDate.slice(0, 8);

  const hasDailyLimit = userProfile.calorieLimit > 0;
  const progressRatio = hasDailyLimit
    ? Math.min(100, (selectedDateTotal / userProfile.calorieLimit) * 100)
    : 0;
  const isOverLimit = hasDailyLimit && selectedDateTotal > userProfile.calorieLimit;

  const handleDateChange = (value: string | Date) => {
    if (typeof value === 'string') {
      setSelectedDate(value);
      return;
    }

    setSelectedDate(value.toISOString().split('T')[0]);
  };

  const handleAddLog: NonNullable<React.ComponentProps<'form'>['onSubmit']> = (e) => {
    e.preventDefault();

    const parsedCalories = Number.parseInt(cals, 10);
    if (!foodLabel.trim() || Number.isNaN(parsedCalories) || parsedCalories <= 0) return;

    onAddLog({
      id: Math.random().toString(36).slice(2, 11),
      date: selectedDate,
      calories: parsedCalories,
      label: foodLabel.trim(),
    });

    setFoodLabel('');
    setCals('');
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">Nutrition</h2>
        <p className="text-sm text-muted-foreground">Track meals and keep your daily intake on target.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/2 p-4">
          <p className="text-xs text-muted-foreground">Selected day</p>
          <p className="mt-1 text-2xl font-semibold text-white">{selectedDateTotal} kcal</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/2 p-4">
          <p className="text-xs text-muted-foreground">Daily limit</p>
          <p className="mt-1 text-2xl font-semibold text-white">
            {hasDailyLimit ? `${userProfile.calorieLimit} kcal` : 'Not set'}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/2 p-4">
          <p className="text-xs text-muted-foreground">Progress</p>
          <p className="mt-1 text-2xl font-semibold text-white">{hasDailyLimit ? `${Math.round(progressRatio)}%` : '-'}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <section className={`${panelClass} space-y-6 lg:col-span-7`}>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {new Date(selectedDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
              <p className={`text-xs ${isOverLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
                {hasDailyLimit ? `${selectedDateTotal}/${userProfile.calorieLimit} kcal` : 'No limit'}
              </p>
            </div>
            <div className="h-2 rounded-full bg-white/8">
              <div
                className={`h-2 rounded-full transition-all ${isOverLimit ? 'bg-destructive' : 'bg-white'}`}
                style={{ width: `${progressRatio}%` }}
              />
            </div>
          </div>

          <form onSubmit={handleAddLog} className="space-y-4">
            <div>
              <p className="mb-2 text-xs text-muted-foreground">Date</p>
              <DatePicker
                date={selectedDate}
                onDateChange={handleDateChange}
                placeholder="Pick date"
                width="w-full"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="meal-label" className="mb-2 block text-xs text-muted-foreground">
                  Meal
                </label>
                <input
                  id="meal-label"
                  placeholder="e.g. Chicken rice bowl"
                  value={foodLabel}
                  onChange={(e) => setFoodLabel(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="meal-calories" className="mb-2 block text-xs text-muted-foreground">
                  Calories
                </label>
                <input
                  id="meal-calories"
                  type="number"
                  min="1"
                  placeholder="500"
                  value={cals}
                  onChange={(e) => setCals(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <button
              type="submit"
              className="h-11 w-full rounded-lg bg-white text-sm font-medium text-black transition hover:opacity-90"
            >
              Add meal
            </button>
          </form>

          <div className="rounded-lg border border-white/10 bg-white/2 p-4">
            <h3 className="text-base font-semibold text-white">Meals for selected day</h3>
            <div className="mt-3 space-y-2">
              {selectedDateLogs.length > 0 ? (
                selectedDateLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/2 p-3">
                    <p className="text-sm text-white">{log.label}</p>
                    <p className="text-sm font-medium text-white">{log.calories} kcal</p>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-white/10 px-4 py-8 text-center text-sm text-muted-foreground">
                  No meals logged for this day.
                </div>
              )}
            </div>
          </div>
        </section>

        <aside className={`${panelClass} space-y-6 lg:col-span-5`}>
          <section className="rounded-lg border border-white/10 bg-white/2 p-4">
            <h3 className="text-base font-semibold text-white">Recent days</h3>
            <div className="mt-3 space-y-2">
              {recentDays.length > 0 ? (
                recentDays.map((group) => (
                  <button
                    key={group.date}
                    type="button"
                    onClick={() => setSelectedDate(group.date)}
                    className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition ${
                      selectedDate === group.date
                        ? 'border-white bg-white text-black'
                        : 'border-white/10 bg-white/2 text-white hover:bg-white/6'
                    }`}
                  >
                    <span>
                      {new Date(group.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="font-medium">{group.total} kcal</span>
                  </button>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No entries yet.</p>
              )}
            </div>
          </section>

          <section className="rounded-lg border border-white/10 bg-white/2 p-4 space-y-4">
            <h3 className="text-base font-semibold text-white">Nutrition settings</h3>

            <div>
              <label htmlFor="calorie-daily-limit" className="mb-2 block text-xs text-muted-foreground">
                Daily limit
              </label>
              <input
                id="calorie-daily-limit"
                type="number"
                min="0"
                step="50"
                placeholder="e.g. 2200"
                value={userProfile.calorieLimit > 0 ? userProfile.calorieLimit : ''}
                onChange={(e) => {
                  const nextValue = Number.parseInt(e.target.value, 10);
                  onUpdateProfile({
                    ...userProfile,
                    calorieLimit: Number.isNaN(nextValue) ? 0 : nextValue,
                  });
                }}
                className={inputClass}
              />
            </div>

            <div>
              <p className="mb-2 text-xs text-muted-foreground">Goal</p>
              <SelectDropdown
                value={userProfile.goal}
                onValueChange={(value) =>
                  onUpdateProfile({ ...userProfile, goal: value as UserProfile['goal'] })
                }
                options={[
                  { value: 'cut', label: 'Cut' },
                  { value: 'maintain', label: 'Maintain' },
                  { value: 'bulk', label: 'Bulk' },
                ]}
                placeholder="Select goal"
              />
            </div>

            <div>
              <p className="mb-2 text-xs text-muted-foreground">Activity level</p>
              <SelectDropdown
                value={userProfile.activityLevel}
                onValueChange={(value) =>
                  onUpdateProfile({
                    ...userProfile,
                    activityLevel: Number.parseFloat(value as string),
                  })
                }
                options={[
                  { value: '1.2', label: 'Sedentary' },
                  { value: '1.375', label: 'Light' },
                  { value: '1.55', label: 'Moderate' },
                  { value: '1.725', label: 'Active' },
                  { value: '1.9', label: 'Very active' },
                ]}
                placeholder="Select activity"
              />
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default CalorieTracker;

