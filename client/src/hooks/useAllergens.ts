import { useState, useEffect } from 'react';
import { Allergen, AllergenGroup } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Default allergen groups with initial values
const defaultAllergenGroups: AllergenGroup[] = [
  {
    category: 'common',
    title: 'Common Allergens',
    allergens: [
      { id: uuidv4(), name: 'Peanuts', category: 'common', selected: false },
      { id: uuidv4(), name: 'Tree Nuts', category: 'common', selected: false },
      { id: uuidv4(), name: 'Milk', category: 'common', selected: false },
      { id: uuidv4(), name: 'Eggs', category: 'common', selected: false },
      { id: uuidv4(), name: 'Fish', category: 'common', selected: false },
      { id: uuidv4(), name: 'Shellfish', category: 'common', selected: false },
      { id: uuidv4(), name: 'Wheat', category: 'common', selected: false },
      { id: uuidv4(), name: 'Soy', category: 'common', selected: false },
      { id: uuidv4(), name: 'Sesame', category: 'common', selected: false },
    ]
  },
  {
    category: 'dietary',
    title: 'Dietary Restrictions',
    allergens: [
      { id: uuidv4(), name: 'Lactose Intolerance', category: 'dietary', selected: false },
      { id: uuidv4(), name: 'Gluten Sensitivity/Celiac Disease', category: 'dietary', selected: false },
      { id: uuidv4(), name: 'Caffeine Sensitivity', category: 'dietary', selected: false },
      { id: uuidv4(), name: 'Histamine Sensitivity', category: 'dietary', selected: false },
    ]
  },
  {
    category: 'religious',
    title: 'Religious/Ethical Restrictions',
    allergens: [
      { id: uuidv4(), name: 'No Pork', category: 'religious', selected: false },
      { id: uuidv4(), name: 'No Beef', category: 'religious', selected: false },
      { id: uuidv4(), name: 'No Animal Products (Vegan)', category: 'religious', selected: false },
      { id: uuidv4(), name: 'No Alcohol', category: 'religious', selected: false },
    ]
  },
  {
    category: 'custom',
    title: 'Custom Restrictions',
    allergens: []
  }
];

export function useAllergens() {
  const [allergenGroups, setAllergenGroups] = useState<AllergenGroup[]>(defaultAllergenGroups);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved allergens from localStorage on initial render
  useEffect(() => {
    try {
      const savedAllergens = localStorage.getItem('allergenGroups');
      if (savedAllergens) {
        setAllergenGroups(JSON.parse(savedAllergens));
      }
      setIsLoaded(true);
    } catch (error) {
      console.error('Error loading saved allergens:', error);
      setIsLoaded(true);
    }
  }, []);

  // Save allergens to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('allergenGroups', JSON.stringify(allergenGroups));
    }
  }, [allergenGroups, isLoaded]);

  // Toggle an allergen's selected state
  const toggleAllergen = (id: string) => {
    setAllergenGroups(prevGroups => 
      prevGroups.map(group => ({
        ...group,
        allergens: group.allergens.map(allergen => 
          allergen.id === id 
            ? { ...allergen, selected: !allergen.selected } 
            : allergen
        )
      }))
    );
  };

  // Add a custom allergen
  const addCustomAllergen = (name: string) => {
    if (!name.trim()) return;
    
    setAllergenGroups(prevGroups => 
      prevGroups.map(group => 
        group.category === 'custom' 
          ? {
              ...group,
              allergens: [
                ...group.allergens,
                {
                  id: uuidv4(),
                  name: name.trim(),
                  category: 'custom',
                  selected: true
                }
              ]
            }
          : group
      )
    );
  };

  // Remove a custom allergen
  const removeCustomAllergen = (id: string) => {
    setAllergenGroups(prevGroups => 
      prevGroups.map(group => 
        group.category === 'custom'
          ? {
              ...group,
              allergens: group.allergens.filter(allergen => allergen.id !== id)
            }
          : group
      )
    );
  };

  // Get all selected allergens
  const getSelectedAllergens = (): Allergen[] => {
    return allergenGroups.flatMap(group => 
      group.allergens.filter(allergen => allergen.selected)
    );
  };

  return {
    allergenGroups,
    toggleAllergen,
    addCustomAllergen,
    removeCustomAllergen,
    getSelectedAllergens,
    isLoaded
  };
}
