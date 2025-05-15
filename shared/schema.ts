import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Define allergen categories
export const allergenCategories = [
  'common',     // Common allergens like peanuts, milk, etc.
  'dietary',    // Dietary restrictions like gluten, lactose
  'religious',  // Religious restrictions like pork, beef
  'custom'      // User-defined custom restrictions
] as const;

export type AllergenCategory = typeof allergenCategories[number];

// Define the allergen interface
export interface Allergen {
  id: string;
  name: string;
  category: AllergenCategory;
  selected: boolean;
}

// Define the scan result interface
export interface ScanResult {
  id: string;
  timestamp: number;
  productName: string;
  imageUrl: string;
  base64Image: string;
  isSafe: boolean;
  detectedAllergens: {
    name: string;
    found: string;
    severity: 'unsafe' | 'caution';
  }[];
  ingredients: string;
  recommendation: string;
  alternativeSuggestion: string;
}

// Schema for the scan analysis request
export const scanAnalysisSchema = z.object({
  base64Image: z.string(),
  allergens: z.array(z.object({
    id: z.string(),
    name: z.string(),
    category: z.enum(allergenCategories),
    selected: z.boolean()
  }))
});

export type ScanAnalysisRequest = z.infer<typeof scanAnalysisSchema>;

// Schema for the scan analysis response
export const scanAnalysisResponseSchema = z.object({
  productName: z.string(),
  isSafe: z.boolean(),
  detectedAllergens: z.array(z.object({
    name: z.string(),
    found: z.string(),
    severity: z.enum(['unsafe', 'caution'])
  })),
  ingredients: z.string(),
  recommendation: z.string(),
  alternativeSuggestion: z.string()
});

export type ScanAnalysisResponse = z.infer<typeof scanAnalysisResponseSchema>;
