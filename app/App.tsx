"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import WorkoutLogger from './components/WorkoutLogger';
import SleepLogger from './components/SleepLogger';
import CalorieTracker from './components/CalorieTracker';
import MealPlanner from './components/MealPlanner';
import BMICalculator from './components/BMICalculator';
import { WorkoutSession, SleepLog, CalorieLog, UserProfile, WaterLog, WorkoutTemplate } from './types';
import { readFromStorage, writeToStorage } from '@/lib/local-storage';


const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState(() => readFromStorage('fp_active_tab', 'dashboard'));

  const defaultProfile: UserProfile = {
    id: 'usr_01',
    name: 'User',
    weight: 0,
    height: 0,
    age: 0,
    gender: 'male',
    goal: 'maintain',
    activityLevel: 1.2,
    calorieLimit: 0
  };
  
  const [workouts, setWorkouts] = useState<WorkoutSession[]>(() => readFromStorage('fp_workouts', []));
  
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>(() => readFromStorage('fp_sleep', []));
  
  const [calorieLogs, setCalorieLogs] = useState<CalorieLog[]>(() => readFromStorage('fp_calories', []));

  const [waterLogs, setWaterLogs] = useState<WaterLog[]>(() => readFromStorage('fp_water', []));

  const [templates, setTemplates] = useState<WorkoutTemplate[]>(() => readFromStorage('fp_templates', []));
  
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const parsed = readFromStorage<Partial<UserProfile> | null>('fp_profile', null);
    if (!parsed) {
      return defaultProfile;
    }

    const safeGoal = parsed.goal === 'cut' || parsed.goal === 'maintain' || parsed.goal === 'bulk'
      ? parsed.goal
      : 'maintain';

    return {
      ...defaultProfile,
      ...parsed,
      goal: safeGoal,
      calorieLimit: typeof parsed.calorieLimit === 'number' ? parsed.calorieLimit : 0,
    };
  });

  useEffect(() => writeToStorage('fp_active_tab', activeTab), [activeTab]);
  useEffect(() => writeToStorage('fp_workouts', workouts), [workouts]);
  useEffect(() => writeToStorage('fp_sleep', sleepLogs), [sleepLogs]);
  useEffect(() => writeToStorage('fp_calories', calorieLogs), [calorieLogs]);
  useEffect(() => writeToStorage('fp_water', waterLogs), [waterLogs]);
  useEffect(() => writeToStorage('fp_templates', templates), [templates]);
  useEffect(() => writeToStorage('fp_profile', userProfile), [userProfile]);

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
    const checkDate = new Date(latestDate);
    for (let i = 0; i < sortedDates.length; i += 1) {
      const dStr = checkDate.toISOString().split('T')[0];
      if (allDates.has(dStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
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
      case 'bmi':
        return <BMICalculator />;
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
