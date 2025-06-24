import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Allergen, allergenCategories } from '../types';

const ALLERGENS_STORAGE_KEY = 'alergi_ai_allergens';

// Common allergens data - identical to web version
const commonAllergens: Allergen[] = [
  { id: 'milk', name: 'Milk', category: 'common', selected: false },
  { id: 'eggs', name: 'Eggs', category: 'common', selected: false },
  { id: 'fish', name: 'Fish', category: 'common', selected: false },
  { id: 'shellfish', name: 'Shellfish', category: 'common', selected: false },
  { id: 'tree-nuts', name: 'Tree Nuts', category: 'common', selected: false },
  { id: 'peanuts', name: 'Peanuts', category: 'common', selected: false },
  { id: 'wheat', name: 'Wheat', category: 'common', selected: false },
  { id: 'soybeans', name: 'Soybeans', category: 'common', selected: false },
];

const dietaryRestrictions: Allergen[] = [
  { id: 'gluten', name: 'Gluten', category: 'dietary', selected: false },
  { id: 'lactose', name: 'Lactose', category: 'dietary', selected: false },
  { id: 'vegan', name: 'Non-Vegan', category: 'dietary', selected: false },
  { id: 'vegetarian', name: 'Non-Vegetarian', category: 'dietary', selected: false },
  { id: 'keto', name: 'High Carb (Keto)', category: 'dietary', selected: false },
];

const religiousRestrictions: Allergen[] = [
  { id: 'halal', name: 'Non-Halal', category: 'religious', selected: false },
  { id: 'kosher', name: 'Non-Kosher', category: 'religious', selected: false },
  { id: 'pork', name: 'Pork', category: 'religious', selected: false },
  { id: 'alcohol', name: 'Alcohol', category: 'religious', selected: false },
];

export function useAllergens() {
  const [allergens, setAllergens] = useState<Allergen[]>([]);

  // Load allergens from AsyncStorage on mount
  useEffect(() => {
    loadAllergens();
  }, []);

  const loadAllergens = async () => {
    try {
      const stored = await AsyncStorage.getItem(ALLERGENS_STORAGE_KEY);
      if (stored) {
        const parsedAllergens = JSON.parse(stored);
        setAllergens(parsedAllergens);
      } else {
        // Initialize with default allergens
        const defaultAllergens = [
          ...commonAllergens,
          ...dietaryRestrictions,
          ...religiousRestrictions,
        ];
        setAllergens(defaultAllergens);
        await AsyncStorage.setItem(ALLERGENS_STORAGE_KEY, JSON.stringify(defaultAllergens));
      }
    } catch (error) {
      console.error('Failed to load allergens:', error);
      // Fallback to default
      const defaultAllergens = [
        ...commonAllergens,
        ...dietaryRestrictions,
        ...religiousRestrictions,
      ];
      setAllergens(defaultAllergens);
    }
  };

  const saveAllergens = async (newAllergens: Allergen[]) => {
    try {
      await AsyncStorage.setItem(ALLERGENS_STORAGE_KEY, JSON.stringify(newAllergens));
      setAllergens(newAllergens);
    } catch (error) {
      console.error('Failed to save allergens:', error);
    }
  };

  const updateAllergen = async (id: string, selected: boolean) => {
    const updated = allergens.map(allergen =>
      allergen.id === id ? { ...allergen, selected } : allergen
    );
    await saveAllergens(updated);
  };

  const addCustomAllergen = async (name: string) => {
    const customId = `custom-${Date.now()}`;
    const customAllergen: Allergen = {
      id: customId,
      name: name.trim(),
      category: 'custom',
      selected: true,
    };
    
    const updated = [...allergens, customAllergen];
    await saveAllergens(updated);
  };

  const removeCustomAllergen = async (id: string) => {
    const updated = allergens.filter(allergen => allergen.id !== id);
    await saveAllergens(updated);
  };

  const getSelectedAllergens = () => {
    return allergens.filter(allergen => allergen.selected);
  };

  const getAllergensByCategory = (category: string) => {
    return allergens.filter(allergen => allergen.category === category);
  };

  return {
    allergens,
    updateAllergen,
    addCustomAllergen,
    removeCustomAllergen,
    getSelectedAllergens,
    getAllergensByCategory,
  };
}