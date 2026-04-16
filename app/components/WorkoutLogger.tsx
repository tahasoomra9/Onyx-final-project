
import React, { useState, useMemo } from 'react';
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

const Icons = {
  Book: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M8 7h6"/><path d="M8 11h8"/></svg>,
  Trash: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>,
  Save: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
};

const WorkoutLogger: React.FC<WorkoutLoggerProps> = ({ workouts, templates, onAddWorkout, onSaveTemplate, onDeleteTemplate }) => {
  const [exercises, setExercises] = useState<Partial<Exercise>[]>([]);
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeSubTab, setActiveSubTab] = useState<'log' | 'ai'>('log');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  // AI State
  const [aiFocus, setAiFocus] = useState('Upper Body Hypertrophy');
  const [aiPlan, setAiPlan] = useState<AIWorkoutPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const categories = useMemo(() => Array.from(new Set(COMMON_EXERCISES.map(ex => ex.category))), []);

  const filteredExercises = useMemo(() => {
    return COMMON_EXERCISES.filter(ex => {
      const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory ? ex.category === activeCategory : true;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
      const plan = await generateWorkoutPlan('Strength & Hypertrophy', aiFocus);
      setAiPlan(plan);
    } catch (e) {
      alert("AI Generation failed. Check API key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const addExercise = (name: string = '') => {
    setExercises([...exercises, { 
      id: Math.random().toString(36).substr(2, 9), 
      name, 
      sets: 3, 
      reps: 10, 
      weight: 0, 
      duration: 0 
    }]);
  };

  const updateExercise = (index: number, field: keyof Exercise, value: string | number) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [field]: value };
    setExercises(updated);
  };

  const handleSave = () => {
    if (exercises.length === 0) return;
    const newSession: WorkoutSession = {
      id: Math.random().toString(36).substr(2, 9),
      date: sessionDate,
      exercises: exercises as Exercise[]
    };
    onAddWorkout(newSession);
    setExercises([]);
  };

  const handleSaveAsTemplate = () => {
    if (exercises.length === 0) return;
    const name = prompt("Enter a name for this routine template:");
    if (!name) return;

    const template: WorkoutTemplate = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      exercises: exercises.map(ex => ({
        name: ex.name || 'Unnamed Exercise',
        sets: ex.sets || 3,
        reps: ex.reps || 10
      }))
    };
    onSaveTemplate(template);
  };

  const loadTemplate = (template: WorkoutTemplate) => {
    const imported: Partial<Exercise>[] = template.exercises.map(ex => ({
      id: Math.random().toString(36).substr(2, 9),
      name: ex.name,
      sets: ex.sets,
      reps: ex.reps,
      weight: 0,
      duration: 0
    }));
    setExercises(imported);
  };

  const importAIPlan = () => {
    if (!aiPlan) return;
    const imported: Partial<Exercise>[] = aiPlan.exercises.map(ex => ({
      id: Math.random().toString(36).substr(2, 9),
      name: ex.name,
      sets: ex.sets,
      reps: parseInt(ex.reps) || 10,
      weight: 0,
      duration: 0
    }));
    setExercises(imported);
    setActiveSubTab('log');
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-white uppercase">Training Records</h2>
          <p className="text-muted-foreground mt-2 font-medium">Quantify your physical output and progression.</p>
        </div>
        <div className="flex p-1 glass rounded-2xl">
          <button 
            onClick={() => setActiveSubTab('log')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeSubTab === 'log' ? 'bg-white text-black shadow-lg' : 'text-muted-foreground hover:text-white'}`}
          >
            Manual Log
          </button>
          <button 
            onClick={() => setActiveSubTab('ai')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeSubTab === 'ai' ? 'bg-white text-black shadow-lg' : 'text-muted-foreground hover:text-white'}`}
          >
            AI Assistant
          </button>
        </div>
      </div>

      {activeSubTab === 'log' ? (
        <div className="space-y-10">
          {/* Templates Shelf */}
          {templates.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-chart2"><Icons.Book /></span>
                <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Routine Templates</h3>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                {templates.map(tpl => (
                  <div key={tpl.id} className="min-w-[200px] glass p-5 rounded-2xl border-white/5 group hover:border-white/20 transition-all flex flex-col justify-between">
                    <div>
                      <p className="text-sm font-black text-white truncate">{tpl.name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-1">{tpl.exercises.length} Exercises</p>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button 
                        onClick={() => loadTemplate(tpl)}
                        className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-white transition-all"
                      >
                        Load
                      </button>
                      <button 
                        onClick={() => onDeleteTemplate(tpl.id)}
                        className="p-1.5 bg-white/5 hover:bg-destructive/20 text-muted-foreground hover:text-destructive rounded-lg transition-all"
                      >
                        <Icons.Trash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Add Library */}
          <div className="glass p-8 rounded-[3rem] space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Exercise Library</h3>
              <div className="w-full md:w-64">
                <input 
                  type="text" 
                  placeholder="Search exercises..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-white"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setActiveCategory(null)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${!activeCategory ? 'bg-white text-black' : 'bg-white/5 text-muted-foreground hover:text-white'}`}
              >
                All
              </button>
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-white text-black' : 'bg-white/5 text-muted-foreground hover:text-white'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
              {filteredExercises.map(ex => (
                <button 
                  key={ex.name}
                  onClick={() => addExercise(ex.name)}
                  className="px-4 py-2 bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 rounded-xl text-xs font-bold text-white transition-all whitespace-nowrap"
                >
                  {ex.name}
                </button>
              ))}
              <button 
                onClick={() => addExercise()}
                className="px-4 py-2 bg-chart2/10 border border-chart2/20 hover:bg-chart2/20 rounded-xl text-xs font-bold text-chart2 transition-all"
              >
                + Custom Exercise
              </button>
            </div>
          </div>

          {/* Logging Form */}
          <div className="glass p-10 rounded-[3rem] space-y-10">
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-end">
              <div className="flex-1 w-full">
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">Session Date</label>
                <input 
                  type="date" 
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-white outline-none text-white font-bold"
                />
              </div>
            </div>

            <div className="space-y-4">
              {exercises.length === 0 && (
                <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[2.5rem] opacity-30">
                  <p className="text-[10px] font-black uppercase tracking-widest">Add exercises to start your workout log.</p>
                </div>
              )}
              {exercises.map((ex, idx) => (
                <div key={ex.id} className="p-8 glass rounded-3xl bg-white/5 flex flex-wrap gap-6 items-end relative group animate-in slide-in-from-left-4 duration-300">
                  <button 
                    onClick={() => setExercises(exercises.filter((_, i) => i !== idx))}
                    className="absolute top-4 right-4 w-8 h-8 bg-white/5 text-muted-foreground rounded-full flex items-center justify-center hover:bg-destructive hover:text-white transition-all opacity-0 group-hover:opacity-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
                  
                  <div className="flex-1 min-w-[280px]">
                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">Exercise</label>
                    <input 
                      placeholder="e.g. Incline DB Press"
                      value={ex.name}
                      onChange={(e) => updateExercise(idx, 'name', e.target.value)}
                      className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold focus:ring-1 focus:ring-white outline-none"
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">Sets</label>
                    <input type="number" value={ex.sets} onChange={(e) => updateExercise(idx, 'sets', parseInt(e.target.value))} className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold" />
                  </div>
                  <div className="w-24">
                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">Reps</label>
                    <input type="number" value={ex.reps} onChange={(e) => updateExercise(idx, 'reps', parseInt(e.target.value))} className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold" />
                  </div>
                  <div className="w-28">
                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">Weight (Kg)</label>
                    <input type="number" value={ex.weight} onChange={(e) => updateExercise(idx, 'weight', parseFloat(e.target.value))} className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold" />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={handleSave}
                disabled={exercises.length === 0}
                className="flex-[2] bg-white text-black py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:opacity-90 transition disabled:opacity-20 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
              >
                Save Workout Log
              </button>
              <button 
                onClick={handleSaveAsTemplate}
                disabled={exercises.length === 0}
                className="flex-1 glass border-white/20 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-white/5 transition disabled:opacity-20 flex items-center justify-center gap-3"
              >
                <Icons.Save />
                Save as Template
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass p-10 rounded-[3rem] space-y-10">
          <div className="max-w-xl">
             <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">Workout Strategy Focus</label>
             <div className="flex gap-4">
               <input 
                placeholder="e.g. Explosive Leg Day"
                value={aiFocus}
                onChange={(e) => setAiFocus(e.target.value)}
                className="flex-1 px-6 py-4 glass border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-white font-bold"
               />
               <button 
                onClick={handleGenerateAI}
                disabled={isGenerating}
                className="px-8 py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 disabled:opacity-20 flex items-center gap-2"
               >
                 {isGenerating ? 'Analyzing...' : 'Generate Plan'}
               </button>
             </div>
          </div>

          {aiPlan && (
            <div className="p-8 glass bg-white/5 rounded-[2.5rem] space-y-8 animate-in slide-in-from-top-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-6">
                <div>
                  <h4 className="text-2xl font-black text-white uppercase tracking-tighter">{aiPlan.name}</h4>
                  <p className="text-xs font-bold text-chart2 uppercase tracking-widest mt-1">{aiPlan.focus}</p>
                </div>
                <button onClick={importAIPlan} className="px-6 py-2 glass hover:bg-white/10 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all">Import to Log</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {aiPlan.exercises.map((ex, i) => (
                  <div key={i} className="glass bg-white/5 p-6 rounded-2xl group border-white/5">
                    <p className="text-lg font-bold text-white mb-2">{ex.name}</p>
                    <div className="flex gap-4 mb-4">
                      <span className="text-[10px] font-black bg-white/10 px-3 py-1 rounded-md text-white uppercase tracking-widest">{ex.sets} Sets</span>
                      <span className="text-[10px] font-black bg-white/10 px-3 py-1 rounded-md text-white uppercase tracking-widest">{ex.reps} Reps</span>
                    </div>
                    <p className="text-xs text-muted-foreground italic font-medium">"{ex.description}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Historical Logs */}
      <div className="space-y-8">
        <h3 className="text-2xl font-black text-white uppercase tracking-tighter border-b border-white/5 pb-6">Activity History</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {workouts.slice().reverse().map(session => (
            <div key={session.id} className="glass p-8 rounded-[2.5rem] group hover:bg-white/5 transition-all">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-xl font-black text-white">{new Date(session.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  <p className="text-[10px] text-chart2 uppercase font-black tracking-widest mt-1">Training Session</p>
                </div>
                <span className="text-[10px] font-black bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-muted-foreground uppercase tracking-widest">{session.exercises.length} Exercises</span>
              </div>
              <ul className="space-y-4">
                {session.exercises.map((ex, i) => (
                  <li key={i} className="flex justify-between text-sm items-center border-b border-white/5 pb-4 last:border-0 last:pb-0">
                    <span className="text-muted-foreground group-hover:text-white transition-colors font-bold">{ex.name}</span>
                    <span className="font-black text-white tabular-nums">{ex.sets} × {ex.reps} <span className="text-[10px] font-bold text-muted-foreground uppercase ml-1">{ex.weight}kg</span></span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkoutLogger;
