import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type FavoritesContextType = {
  favorites: string[];
  toggleFavorite: (recipeId: string) => void;
  isFavorite: (recipeId: string) => boolean;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const saved = await AsyncStorage.getItem('favorites');
        if (saved) {
          setFavorites(JSON.parse(saved));
        }
      } catch (e) {
        console.error('Failed to load favorites:', e);
      }
    };
    loadFavorites();
  }, []);

  const toggleFavorite = async (recipeId: string) => {
    try {
      setFavorites((prev) => {
        const nextFavorites = prev.includes(recipeId)
          ? prev.filter((id) => id !== recipeId)
          : [...prev, recipeId];
        
        AsyncStorage.setItem('favorites', JSON.stringify(nextFavorites)).catch((e) => {
          console.error('Failed to save favorites:', e);
        });
        
        return nextFavorites;
      });
    } catch (e) {
      console.error('Error in toggleFavorite:', e);
    }
  };

  const isFavorite = (recipeId: string) => favorites.includes(recipeId);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
