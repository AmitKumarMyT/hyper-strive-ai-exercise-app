'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '@/firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, User } from 'firebase/auth';
import { doc, setDoc, onSnapshot, collection, deleteDoc, getDocFromServer, getDocs } from 'firebase/firestore';

export type Meal = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  time: string;
  imageUrl?: string;
  userId?: string;
  createdAt?: string;
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
  user: User | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isAuthReady: boolean;
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
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [workoutPlan, setWorkoutPlan] = useState<Exercise[] | null>(null);
  const [credits, setCredits] = useState(10);
  const [exerciseVisuals, setExerciseVisuals] = useState<Record<string, string>>({});
  const [dailyCaloriesGoal, setDailyCaloriesGoal] = useState(2500);
  const [dailyProteinGoal, setDailyProteinGoal] = useState(190);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthReady) return;
    if (!user) {
      setMeals([]);
      setWorkoutPlan(null);
      return;
    }

    // Sync user profile
    const userRef = doc(db, 'users', user.uid);
    const unsubUser = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.dailyCaloriesGoal) setDailyCaloriesGoal(data.dailyCaloriesGoal);
        if (data.dailyProteinGoal) setDailyProteinGoal(data.dailyProteinGoal);
        if (data.credits !== undefined) setCredits(data.credits);
        if (data.workoutPlan) {
          try {
            setWorkoutPlan(JSON.parse(data.workoutPlan));
          } catch (e) {
            console.error(e);
          }
        } else {
          setWorkoutPlan(null);
        }
      } else {
        // Initialize user profile
        setDoc(userRef, {
          dailyCaloriesGoal: 2500,
          dailyProteinGoal: 190,
          credits: 10,
          workoutPlan: null
        }).catch(console.error);
      }
    }, (error) => {
      console.error("Firestore user sync error", error);
    });

    // Sync meals
    const mealsRef = collection(db, 'users', user.uid, 'meals');
    const unsubMeals = onSnapshot(mealsRef, (snapshot) => {
      const fetchedMeals: Meal[] = [];
      snapshot.forEach((doc) => {
        fetchedMeals.push({ id: doc.id, ...doc.data() } as Meal);
      });
      // Sort by time or createdAt if needed
      setMeals(fetchedMeals);
    }, (error) => {
      console.error("Firestore meals sync error", error);
    });

    return () => {
      unsubUser();
      unsubMeals();
    };
  }, [user, isAuthReady]);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const addMeal = async (meal: Meal) => {
    if (!user) return;
    const mealRef = doc(db, 'users', user.uid, 'meals', meal.id);
    await setDoc(mealRef, {
      ...meal,
      userId: user.uid,
      createdAt: new Date().toISOString()
    }).catch(console.error);
  };

  const handleSetMeals: React.Dispatch<React.SetStateAction<Meal[]>> = async (action) => {
    if (!user) return;
    // If setting to empty array (clear log)
    if (typeof action === 'function') {
      // Not fully supported for complex state updates in this simple wrapper
      const newMeals = action(meals);
      if (newMeals.length === 0) {
        const mealsRef = collection(db, 'users', user.uid, 'meals');
        const snapshot = await getDocs(mealsRef);
        snapshot.forEach((d) => deleteDoc(d.ref));
      }
    } else if (Array.isArray(action) && action.length === 0) {
      const mealsRef = collection(db, 'users', user.uid, 'meals');
      const snapshot = await getDocs(mealsRef);
      snapshot.forEach((d) => deleteDoc(d.ref));
    }
  };

  const handleSetWorkoutPlan = async (plan: Exercise[] | null) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, { workoutPlan: plan ? JSON.stringify(plan) : null }, { merge: true }).catch(console.error);
  };

  const handleSetCredits: React.Dispatch<React.SetStateAction<number>> = async (action) => {
    if (!user) return;
    const newCredits = typeof action === 'function' ? action(credits) : action;
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, { credits: newCredits }, { merge: true }).catch(console.error);
  };

  const handleSetDailyCaloriesGoal: React.Dispatch<React.SetStateAction<number>> = async (action) => {
    if (!user) return;
    const newGoal = typeof action === 'function' ? action(dailyCaloriesGoal) : action;
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, { dailyCaloriesGoal: newGoal }, { merge: true }).catch(console.error);
  };

  const handleSetDailyProteinGoal: React.Dispatch<React.SetStateAction<number>> = async (action) => {
    if (!user) return;
    const newGoal = typeof action === 'function' ? action(dailyProteinGoal) : action;
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, { dailyProteinGoal: newGoal }, { merge: true }).catch(console.error);
  };

  const setExerciseVisual = (name: string, url: string) => {
    setExerciseVisuals(prev => ({ ...prev, [name]: url }));
  };

  return (
    <AppContext.Provider value={{ 
      user,
      login,
      logout,
      isAuthReady,
      meals, 
      addMeal, 
      setMeals: handleSetMeals,
      workoutPlan, 
      setWorkoutPlan: handleSetWorkoutPlan, 
      credits, 
      setCredits: handleSetCredits, 
      exerciseVisuals, 
      setExerciseVisual,
      dailyCaloriesGoal,
      setDailyCaloriesGoal: handleSetDailyCaloriesGoal,
      dailyProteinGoal,
      setDailyProteinGoal: handleSetDailyProteinGoal
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
