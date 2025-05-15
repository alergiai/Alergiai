import { 
  Allergen,
  ScanResult,
  AllergenCategory, 
  ScanAnalysisRequest, 
  ScanAnalysisResponse 
} from "@shared/schema";

export type { 
  Allergen, 
  ScanResult, 
  AllergenCategory, 
  ScanAnalysisRequest, 
  ScanAnalysisResponse 
};

export type TabType = 'scan' | 'history' | 'allergens';

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
