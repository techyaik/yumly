export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface Instruction {
  step: number;
  text: string;
  timerSeconds?: number;
}

export interface Recipe {
  id: string;
  title: string;
  summary: string;
  isVeg: boolean;
  images: {
    thumbnail: string;
    hero: string;
  };
  metadata: {
    prepTimeMinutes: number;
    totalTimeMinutes: number;
    difficulty: "Easy" | "Medium" | "Hard" | string;
    calories: number;
    servings: number;
  };
  category: string;
  ingredients: Ingredient[];
  instructions: Instruction[];
}
