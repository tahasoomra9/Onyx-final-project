import React, { useMemo, useState } from 'react';
import { DatePicker } from '@/components/ui/date-picker';
import { WorkoutSession, Exercise, AIWorkoutPlan, WorkoutTemplate } from '../types';
import { generateWorkoutPlan } from '../services/geminiService';

interface WorkoutLoggerProps {
  workouts: WorkoutSession[];
  templates: WorkoutTemplate[];
  onAddWorkout: (workout: WorkoutSession) => void;
  onSaveTemplate: (template: WorkoutTemplate) => void;
  onDeleteTemplate: (id: string) => void;
}

const COMMON_EXERCISES = [
  { name: 'Bench Press', category: 'Chest' },
  { name: 'Incline DB Press', category: 'Chest' },
  { name: 'Chest Flys', category: 'Chest' },
  { name: 'Deadlift', category: 'Back' },
  { name: 'Pull Ups', category: 'Back' },
  { name: 'Bent Over Rows', category: 'Back' },
  { name: 'Lat Pulldown', category: 'Back' },
  { name: 'Squats', category: 'Legs' },
  { name: 'Leg Press', category: 'Legs' },
  { name: 'Leg Extensions', category: 'Legs' },
  { name: 'Lying Leg Curls', category: 'Legs' },
  { name: 'Overhead Press', category: 'Shoulders' },
  { name: 'Lateral Raises', category: 'Shoulders' },
  { name: 'Face Pulls', category: 'Shoulders' },
  { name: 'Bicep Curls', category: 'Arms' },
  { name: 'Tricep Pushdowns', category: 'Arms' },
  { name: 'Hammer Curls', category: 'Arms' },
  { name: 'Skull Crushers', category: 'Arms' },
  { name: 'Plank', category: 'Core' },
  { name: 'Hanging Leg Raises', category: 'Core' },
];

const panelClass = 'rounded-2xl border border-white/10 bg-black p-6 md:p-8';
const inputClass =
  'h-11 w-full rounded-lg border border-white/10 bg-white/2 px-3 text-sm text-white outline-none transition focus:border-white/30 focus:ring-2 focus:ring-white/20';
const labelClass = 'mb-2 block text-xs text-muted-foreground';

const WorkoutLogger: React.FC<WorkoutLoggerProps> = ({
  workouts,
  templates,
  onAddWorkout,
  onSaveTemplate,
  onDeleteTemplate,
}) => {
  const [exercises, setExercises] = useState<Partial<Exercise>[]>([]);
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeSubTab, setActiveSubTab] = useState<'log' | 'ai'>('log');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const [aiFocus, setAiFocus] = useState('Upper Body Hypertrophy');
  const [aiPlan, setAiPlan] = useState<AIWorkoutPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState('');

  const categories = useMemo(() => Array.from(new Set(COMMON_EXERCISES.map((ex) => ex.category))), []);

  const filteredExercises = useMemo(() => {
    return COMMON_EXERCISES.filter((ex) => {
      const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory ? ex.category === activeCategory : true;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const quickPicks = filteredExercises.slice(0, 8);
  const recentWorkouts = [...workouts].reverse().slice(0, 6);
  const hasInvalidExercise = exercises.some((ex) => !ex.name?.trim());
  const canSaveWorkout = exercises.length > 0 && !hasInvalidExercise;

  const handleDateChange = (date: string | Date) => {
    if (typeof date === 'string') {
      setSessionDate(date);
      return;
    }

    setSessionDate(date.toISOString().split('T')[0]);
  };

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    setAiError('');

    try {
      const plan = await generateWorkoutPlan('Strength & Hypertrophy', aiFocus);
      setAiPlan(plan);
    } catch {
      setAiError('Could not generate a plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const addExercise = (name = '') => {
    setExercises([
      ...exercises,
      {
        id: Math.random().toString(36).slice(2, 11),
        name,
        sets: 3,
        reps: 10,
        weight: 0,
        duration: 0,
      },
    ]);
  };

  const updateExercise = (index: number, field: keyof Exercise, value: string | number) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [field]: value };
    setExercises(updated);
  };

  const handleSaveWorkout = () => {
    if (!canSaveWorkout) return;

    const newSession: WorkoutSession = {
      id: Math.random().toString(36).slice(2, 11),
      date: sessionDate,
      exercises: exercises as Exercise[],
    };

    onAddWorkout(newSession);
    setExercises([]);
  };

  const handleSaveAsTemplate = () => {
    if (exercises.length === 0) return;

    const name = prompt('Enter a template name:');
    if (!name) return;

    const template: WorkoutTemplate = {
      id: Math.random().toString(36).slice(2, 11),
      name,
      exercises: exercises.map((ex) => ({
        name: ex.name || 'Unnamed Exercise',
        sets: ex.sets || 3,
        reps: ex.reps || 10,
      })),
    };

    onSaveTemplate(template);
  };

  const loadTemplate = (template: WorkoutTemplate) => {
    const imported: Partial<Exercise>[] = template.exercises.map((ex) => ({
      id: Math.random().toString(36).slice(2, 11),
      name: ex.name,
      sets: ex.sets,
      reps: ex.reps,
      weight: 0,
      duration: 0,
    }));

    setExercises(imported);
  };

  const importAIPlan = () => {
    if (!aiPlan) return;

    const imported: Partial<Exercise>[] = aiPlan.exercises.map((ex) => ({
      id: Math.random().toString(36).slice(2, 11),
      name: ex.name,
      sets: ex.sets,
      reps: Number.parseInt(ex.reps, 10) || 10,
      weight: 0,
      duration: 0,
    }));

    setExercises(imported);
    setActiveSubTab('log');
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">Workouts</h2>
          <p className="text-sm text-muted-foreground">Log sets, reps, and weight in one place.</p>
        </div>

        <div className="inline-flex rounded-lg border border-white/10 bg-white/2 p-1">
          <button
            type="button"
            onClick={() => setActiveSubTab('log')}
            className={`h-10 rounded-md px-4 text-sm font-medium transition ${
              activeSubTab === 'log' ? 'bg-white text-black' : 'text-muted-foreground hover:text-white'
            }`}
          >
            Log workout
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('ai')}
            className={`h-10 rounded-md px-4 text-sm font-medium transition ${
              activeSubTab === 'ai' ? 'bg-white text-black' : 'text-muted-foreground hover:text-white'
            }`}
          >
            AI plan
          </button>
        </div>
      </div>

      {activeSubTab === 'log' ? (
        <div className="grid gap-6 lg:grid-cols-12">
          <section className={`${panelClass} lg:col-span-8`}>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="w-full md:max-w-xs">
                <p className={labelClass}>Session date</p>
                <DatePicker
                  date={sessionDate}
                  onDateChange={handleDateChange}
                  placeholder="Pick date"
                  width="w-full"
                />
              </div>

              <button
                type="button"
                onClick={handleSaveWorkout}
                disabled={!canSaveWorkout}
                className="h-11 rounded-lg bg-white px-5 text-sm font-medium text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Save workout
              </button>
            </div>

            <div className="mt-6 space-y-3">
              {exercises.length === 0 && (
                <div className="rounded-lg border border-dashed border-white/10 px-4 py-8 text-center text-sm text-muted-foreground">
                  Start by adding an exercise from Quick picks.
                </div>
              )}

              {exercises.map((ex, idx) => {
                const hasName = Boolean(ex.name?.trim());

                return (
                  <div key={ex.id} className="rounded-lg border border-white/10 bg-white/2 p-4">
                    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_88px_88px_110px_auto] md:items-end">
                      <div>
                        <label htmlFor={`exercise-name-${idx}`} className={labelClass}>Exercise</label>
                        <input
                          id={`exercise-name-${idx}`}
                          placeholder="e.g. Bench Press"
                          value={ex.name}
                          onChange={(e) => updateExercise(idx, 'name', e.target.value)}
                          className={`${inputClass} ${
                            hasName
                              ? ''
                              : 'border-destructive/60 focus:border-destructive/60 focus:ring-destructive/20'
                          }`}
                        />
                      </div>

                      <div>
                        <label htmlFor={`exercise-sets-${idx}`} className={labelClass}>Sets</label>
                        <input
                          id={`exercise-sets-${idx}`}
                          type="number"
                          min="1"
                          value={ex.sets}
                          onChange={(e) =>
                            updateExercise(idx, 'sets', Number.parseInt(e.target.value, 10) || 0)
                          }
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label htmlFor={`exercise-reps-${idx}`} className={labelClass}>Reps</label>
                        <input
                          id={`exercise-reps-${idx}`}
                          type="number"
                          min="1"
                          value={ex.reps}
                          onChange={(e) =>
                            updateExercise(idx, 'reps', Number.parseInt(e.target.value, 10) || 0)
                          }
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label htmlFor={`exercise-weight-${idx}`} className={labelClass}>Weight kg</label>
                        <input
                          id={`exercise-weight-${idx}`}
                          type="number"
                          min="0"
                          value={ex.weight}
                          onChange={(e) =>
                            updateExercise(idx, 'weight', Number.parseFloat(e.target.value) || 0)
                          }
                          className={inputClass}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => setExercises(exercises.filter((_, i) => i !== idx))}
                        className="h-11 rounded-lg border border-white/10 bg-transparent px-3 text-sm text-muted-foreground transition hover:bg-white/6 hover:text-white"
                      >
                        Remove
                      </button>
                    </div>

                    {!hasName && (
                      <p className="mt-2 text-xs text-destructive">Exercise name is required.</p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => addExercise()}
                className="h-11 rounded-lg border border-white/10 bg-white/2 px-4 text-sm font-medium text-white transition hover:bg-white/6"
              >
                Add custom exercise
              </button>

              <button
                type="button"
                onClick={handleSaveAsTemplate}
                disabled={exercises.length === 0}
                className="h-11 rounded-lg border border-white/10 bg-transparent px-4 text-sm font-medium text-white transition hover:bg-white/6 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Save as template
              </button>
            </div>
          </section>

          <aside className={`${panelClass} space-y-6 lg:col-span-4`}>
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-semibold text-white">Quick picks</h3>
                <span className="text-xs text-muted-foreground">{filteredExercises.length} found</span>
              </div>

              <input
                type="text"
                placeholder="Search exercises"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={inputClass}
              />

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setActiveCategory(null)}
                  className={`h-8 rounded-md px-3 text-xs font-medium transition ${
                    activeCategory === null
                      ? 'bg-white text-black'
                      : 'border border-white/10 bg-white/2 text-muted-foreground hover:text-white'
                  }`}
                >
                  All
                </button>

                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`h-8 rounded-md px-3 text-xs font-medium transition ${
                      activeCategory === cat
                        ? 'bg-white text-black'
                        : 'border border-white/10 bg-white/2 text-muted-foreground hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="mt-3 space-y-2">
                {quickPicks.length === 0 && <p className="text-sm text-muted-foreground">No matches.</p>}

                {quickPicks.map((ex) => (
                  <button
                    key={ex.name}
                    type="button"
                    onClick={() => addExercise(ex.name)}
                    className="flex h-10 w-full items-center justify-between rounded-lg border border-white/10 bg-white/2 px-3 text-left text-sm text-white transition hover:bg-white/6"
                  >
                    <span>{ex.name}</span>
                    <span className="text-xs text-muted-foreground">Add</span>
                  </button>
                ))}
              </div>
            </section>

            {templates.length > 0 && (
              <section className="rounded-lg border border-white/10 bg-white/2 p-4">
                <h3 className="mb-3 text-base font-semibold text-white">Templates</h3>

                <div className="space-y-2">
                  {templates.map((tpl) => (
                    <div key={tpl.id} className="rounded-lg border border-white/10 bg-white/2 p-3">
                      <p className="truncate text-sm font-medium text-white">{tpl.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{tpl.exercises.length} exercises</p>

                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => loadTemplate(tpl)}
                          className="h-9 flex-1 rounded-md bg-white text-sm font-medium text-black transition hover:opacity-90"
                        >
                          Use
                        </button>

                        <button
                          type="button"
                          onClick={() => onDeleteTemplate(tpl.id)}
                          className="h-9 rounded-md border border-white/10 px-3 text-sm text-muted-foreground transition hover:bg-white/6 hover:text-white"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </aside>
        </div>
      ) : (
        <section className={`${panelClass} space-y-5`}>
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px]">
            <input
              placeholder="Focus area, e.g. Full body"
              value={aiFocus}
              onChange={(e) => setAiFocus(e.target.value)}
              className={inputClass}
            />

            <button
              type="button"
              onClick={handleGenerateAI}
              disabled={isGenerating}
              className="h-11 rounded-lg bg-white px-4 text-sm font-medium text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
            >
              {isGenerating ? 'Generating...' : 'Generate'}
            </button>
          </div>

          {aiError && <p className="text-sm text-destructive">{aiError}</p>}

          {aiPlan && (
            <div className="space-y-4 rounded-lg border border-white/10 bg-white/2 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">{aiPlan.name}</h3>
                  <p className="text-sm text-muted-foreground">{aiPlan.focus}</p>
                </div>

                <button
                  type="button"
                  onClick={importAIPlan}
                  className="h-10 rounded-lg bg-white px-4 text-sm font-medium text-black transition hover:opacity-90"
                >
                  Import to log
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {aiPlan.exercises.map((ex) => (
                  <div key={ex.name} className="rounded-lg border border-white/10 bg-black p-4">
                    <p className="font-medium text-white">{ex.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{ex.sets} sets · {ex.reps} reps</p>
                    <p className="mt-2 text-sm text-muted-foreground">{ex.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      <section className={panelClass}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-white">Recent workouts</h3>
          <span className="text-xs text-muted-foreground">Last {recentWorkouts.length}</span>
        </div>

        {recentWorkouts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No workouts yet.</p>
        ) : (
          <div className="space-y-3">
            {recentWorkouts.map((session) => (
              <div key={session.id} className="rounded-lg border border-white/10 bg-white/2 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-white">
                    {new Date(session.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground">{session.exercises.length} exercises</p>
                </div>

                <ul className="mt-3 space-y-2">
                  {session.exercises.map((ex) => (
                    <li key={`${session.id}-${ex.name}-${ex.sets}-${ex.reps}-${ex.weight}`} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{ex.name}</span>
                      <span className="font-medium text-white">
                        {ex.sets} × {ex.reps} · {ex.weight} kg
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default WorkoutLogger;
