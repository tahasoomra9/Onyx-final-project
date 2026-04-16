"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import WorkoutLogger from './components/WorkoutLogger';
import SleepLogger from './components/SleepLogger';
import CalorieTracker from './components/CalorieTracker';
import MealPlanner from './components/MealPlanner';
import { WorkoutSession, SleepLog, CalorieLog, UserProfile, WaterLog, WorkoutTemplate } from './types';


const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [workouts, setWorkouts] = useState<WorkoutSession[]>(() => {
    const saved = localStorage.getItem('fp_workouts');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>(() => {
    const saved = localStorage.getItem('fp_sleep');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [calorieLogs, setCalorieLogs] = useState<CalorieLog[]>(() => {
    const saved = localStorage.getItem('fp_calories');
    return saved ? JSON.parse(saved) : [];
  });

  const [waterLogs, setWaterLogs] = useState<WaterLog[]>(() => {
    const saved = localStorage.getItem('fp_water');
    return saved ? JSON.parse(saved) : [];
  });

  const [templates, setTemplates] = useState<WorkoutTemplate[]>(() => {
    const saved = localStorage.getItem('fp_templates');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('fp_profile');
    return saved ? JSON.parse(saved) : {
      id: 'usr_01',
      name: 'User',
      weight: 0,
      height: 0,
      age: 0,
      gender: 'male',
      goal: 'balance',
      activityLevel: 1.2
    };
  });

  useEffect(() => localStorage.setItem('fp_workouts', JSON.stringify(workouts)), [workouts]);
  useEffect(() => localStorage.setItem('fp_sleep', JSON.stringify(sleepLogs)), [sleepLogs]);
  useEffect(() => localStorage.setItem('fp_calories', JSON.stringify(calorieLogs)), [calorieLogs]);
  useEffect(() => localStorage.setItem('fp_water', JSON.stringify(waterLogs)), [waterLogs]);
  useEffect(() => localStorage.setItem('fp_templates', JSON.stringify(templates)), [templates]);
  useEffect(() => localStorage.setItem('fp_profile', JSON.stringify(userProfile)), [userProfile]);

  const streak = useMemo(() => {
    const allDates = new Set([
      ...workouts.map(w => w.date),
      ...sleepLogs.map(s => s.date),
      ...calorieLogs.map(c => c.date)
    ]);
    if (allDates.size === 0) return 0;
    const sortedDates = Array.from(allDates).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const latestDate = sortedDates[0];
    if (latestDate !== today && latestDate !== yesterdayStr) return 0;
    let currentStreak = 0;
    let checkDate = new Date(latestDate);
    for (const _ of sortedDates) {
        const dStr = checkDate.toISOString().split('T')[0];
        if (allDates.has(dStr)) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else { break; }
    }
    return currentStreak;
  }, [workouts, sleepLogs, calorieLogs]);

  const handleAddWater = (date: string, amount: number) => {
    const existing = waterLogs.find(l => l.date === date);
    if (existing) {
      setWaterLogs(waterLogs.map(l => l.date === date ? { ...l, amount: l.amount + amount } : l));
    } else {
      setWaterLogs([...waterLogs, { id: Math.random().toString(36).slice(2, 11), date, amount }]);
    }
  };

  const handleSaveTemplate = (template: WorkoutTemplate) => {
    setTemplates(prev => [...prev, template]);
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard workouts={workouts} sleepLogs={sleepLogs} calorieLogs={calorieLogs} waterLogs={waterLogs} userProfile={userProfile} streak={streak} onAddWater={handleAddWater} />;
      case 'workouts':
        return <WorkoutLogger 
          workouts={workouts} 
          templates={templates}
          onAddWorkout={(w) => setWorkouts([...workouts, w])} 
          onSaveTemplate={handleSaveTemplate}
          onDeleteTemplate={handleDeleteTemplate}
        />;
      case 'sleep':
        return <SleepLogger sleepLogs={sleepLogs} onAddSleep={(s) => setSleepLogs([...sleepLogs, s])} />;
      case 'calories':
        return <CalorieTracker logs={calorieLogs} userProfile={userProfile} onAddLog={(l) => setCalorieLogs([...calorieLogs, l])} onUpdateProfile={setUserProfile} />;
      case 'meal-planner':
        return <MealPlanner />;
      default:
        return <Dashboard workouts={workouts} sleepLogs={sleepLogs} calorieLogs={calorieLogs} waterLogs={waterLogs} userProfile={userProfile} streak={streak} onAddWater={handleAddWater} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} streak={streak}>
      {renderContent()}
    </Layout>
  );
};

export default App;
