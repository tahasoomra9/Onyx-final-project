
export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  duration: number; // in minutes
}

export interface WorkoutSession {
  id: string;
  date: string;
  exercises: Exercise[];
  type?: string;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: Array<{
    name: string;
    sets: number;
    reps: number;
  }>;
}

export interface SleepLog {
  id: string;
  date: string;
  duration: number; // hours
  quality: number; // 1-5
  notes: string;
}

export interface CalorieLog {
  id: string;
  date: string;
  calories: number;
  label: string;
}

export interface WaterLog {
  id: string;
  date: string;
  amount: number; // ml
}

export interface UserProfile {
  id: string;
  name: string;
  weight: number; // kg
  height: number; // cm
  age: number;
  gender: 'male' | 'female' | 'other';
  goal: 'cut' | 'maintain' | 'bulk';
  activityLevel: number; // 1.2 to 1.9
  avatar?: string;
}

export interface Meal {
  name: string;
  calories: number;
  protein: string;
  carbs: string;
  fat: string;
}

export interface DailyMealPlan {
  day: string;
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  snacks: Meal;
}

export interface WeeklyMealPlan {
  plan: DailyMealPlan[];
}

export interface AIWorkoutPlan {
  name: string;
  focus: string;
  exercises: {
    name: string;
    sets: number;
    reps: string;
    description: string;
  }[];
}
