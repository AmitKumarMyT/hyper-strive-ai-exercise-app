'use client';

import React, { createContext, useContext, useState } from 'react';

export type Meal = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  time: string;
  imageUrl?: string;
};

export type Exercise = {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  instructions: string;
  targetDurationSeconds?: number;
};

type AppState = {
  meals: Meal[];
  addMeal: (meal: Meal) => void;
  setMeals: React.Dispatch<React.SetStateAction<Meal[]>>;
  workoutPlan: Exercise[] | null;
  setWorkoutPlan: (plan: Exercise[] | null) => void;
  credits: number;
  setCredits: React.Dispatch<React.SetStateAction<number>>;
  exerciseVisuals: Record<string, string>;
  setExerciseVisual(name: string, url: string): void;
  dailyCaloriesGoal: number;
  setDailyCaloriesGoal: React.Dispatch<React.SetStateAction<number>>;
  dailyProteinGoal: number;
  setDailyProteinGoal: React.Dispatch<React.SetStateAction<number>>;
};

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [meals, setMeals] = useState<Meal[]>([
    { 
      id: '1', 
      name: 'Breakfast', 
      calories: 450, 
      protein: 32, 
      time: '08:30 AM', 
      imageUrl: 'https://picsum.photos/seed/breakfast/200/200' 
    },
    { 
      id: '2', 
      name: 'Grilled Chicken & Quinoa', 
      calories: 620, 
      protein: 58, 
      time: '01:15 PM', 
      imageUrl: 'https://picsum.photos/seed/lunch/200/200' 
    }
  ]);
  
  const [workoutPlan, setWorkoutPlan] = useState<Exercise[] | null>(null);
  const [credits, setCredits] = useState(10);
  const [exerciseVisuals, setExerciseVisuals] = useState<Record<string, string>>({});
  const [dailyCaloriesGoal, setDailyCaloriesGoal] = useState(2500);
  const [dailyProteinGoal, setDailyProteinGoal] = useState(190);

  const addMeal = (meal: Meal) => setMeals(prev => [...prev, meal]);
  const setExerciseVisual = (name: string, url: string) => {
    setExerciseVisuals(prev => ({ ...prev, [name]: url }));
  };

  return (
    <AppContext.Provider value={{ 
      meals, 
      addMeal, 
      setMeals,
      workoutPlan, 
      setWorkoutPlan, 
      credits, 
      setCredits, 
      exerciseVisuals, 
      setExerciseVisual,
      dailyCaloriesGoal,
      setDailyCaloriesGoal,
      dailyProteinGoal,
      setDailyProteinGoal
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppStore must be used within AppProvider');
  return context;
};
