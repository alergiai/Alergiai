// Core types - identical to web version
export type TabType = 'scan' | 'history' | 'allergens';

export const allergenCategories = [
  'common',
  'dietary', 
  'religious',
  'custom'
] as const;

export type AllergenCategory = typeof allergenCategories[number];

export interface Allergen {
  id: string;
  name: string;
  category: AllergenCategory;
  selected: boolean;
}

export interface CommonAllergensGroup {
  category: 'common';
  title: string;
  allergens: Allergen[];
}

export interface DietaryRestrictionsGroup {
  category: 'dietary';
  title: string;
  allergens: Allergen[];
}

export interface ReligiousRestrictionsGroup {
  category: 'religious';
  title: string;
  allergens: Allergen[];
}

export interface CustomRestrictionsGroup {
  category: 'custom';
  title: string;
  allergens: Allergen[];
}

export type AllergenGroup = 
  | CommonAllergensGroup 
  | DietaryRestrictionsGroup 
  | ReligiousRestrictionsGroup 
  | CustomRestrictionsGroup;

export type CameraStatus = 'inactive' | 'active' | 'loading' | 'result' | 'retry';

export interface ScanResult {
  id: string;
  timestamp: number;
  productName: string;
  imageUrl: string;
  base64Image: string;
  isSafe: boolean | null;
  detectedAllergens: {
    name: string;
    found: string;
    severity: 'unsafe' | 'caution';
  }[];
  ingredients: string;
  recommendation: string;
  alternativeSuggestion: string;
}

export interface ScanAnalysisRequest {
  image: string;
  allergens: Allergen[];
}

export interface ScanAnalysisResponse {
  productName: string;
  isSafe: boolean | null;
  detectedAllergens: {
    name: string;
    found: string;
    severity: 'unsafe' | 'caution';
  }[];
  ingredients: string;
  recommendation: string;
  alternativeSuggestion: string;
}

// Navigation types for React Navigation
export type RootStackParamList = {
  Onboarding: undefined;
  Home: undefined;
  History: undefined;
  Allergens: undefined;
  ScanResult: { scanId: string };
};