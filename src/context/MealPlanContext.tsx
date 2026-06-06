import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type PlannedMeal = {
  id: string;
  recipeId: string;
  recipeTitle: string;
  servings: number;
  timestamp: number;
};

type MealPlanContextType = {
  meals: PlannedMeal[];
  addToMealPlan: (recipeId: string, title: string, servings: number) => void;
  removeFromMealPlan: (mealId: string) => void;
  removeByRecipeId: (recipeId: string) => void;
  clearMealPlan: () => void;
};

const MealPlanContext = createContext<MealPlanContextType | undefined>(undefined);

export function MealPlanProvider({ children }: { children: React.ReactNode }) {
  const [meals, setMeals] = useState<PlannedMeal[]>([]);

  useEffect(() => {
    const loadMeals = async () => {
      try {
        const saved = await AsyncStorage.getItem('meal_plan');
        if (saved) {
          setMeals(JSON.parse(saved));
        }
      } catch (e) {
        console.error('Failed to load meal plan:', e);
      }
    };
    loadMeals();
  }, []);

  const saveMeals = (updatedMeals: PlannedMeal[]) => {
    AsyncStorage.setItem('meal_plan', JSON.stringify(updatedMeals)).catch((e) => {
      console.error('Failed to save meal plan:', e);
    });
  };

  const addToMealPlan = (recipeId: string, title: string, servings: number) => {
    const newMeal: PlannedMeal = {
      id: Math.random().toString(36).substring(2, 11),
      recipeId,
      recipeTitle: title,
      servings,
      timestamp: Date.now(),
    };
    setMeals((prev) => {
      const updated = [newMeal, ...prev];
      saveMeals(updated);
      return updated;
    });
  };

  const removeFromMealPlan = (mealId: string) => {
    setMeals((prev) => {
      const updated = prev.filter((m) => m.id !== mealId);
      saveMeals(updated);
      return updated;
    });
  };

  const removeByRecipeId = (recipeId: string) => {
    setMeals((prev) => {
      const index = prev.findIndex(m => m.recipeId === recipeId);
      if (index !== -1) {
        const newMeals = [...prev];
        newMeals.splice(index, 1);
        saveMeals(newMeals);
        return newMeals;
      }
      return prev;
    });
  };

  const clearMealPlan = () => {
    setMeals([]);
    AsyncStorage.removeItem('meal_plan').catch((e) => {
      console.error('Failed to clear meal plan:', e);
    });
  };

  return (
    <MealPlanContext.Provider value={{ meals, addToMealPlan, removeFromMealPlan, removeByRecipeId, clearMealPlan }}>
      {children}
    </MealPlanContext.Provider>
  );
}

export function useMealPlan() {
  const context = useContext(MealPlanContext);
  if (context === undefined) {
    throw new Error('useMealPlan must be used within a MealPlanProvider');
  }
  return context;
}
