import OpenAI from "openai";
import { OPENAI_MODEL, PROMPT_TEMPLATE } from "../config";
import { Allergen, ScanAnalysisResponse } from "@shared/schema";

/**
 * Map of allergens to their related ingredients that could cause reactions
 */
const ALLERGEN_RELATED_INGREDIENTS: Record<string, string[]> = {
  "Pepper": ["capsicum", "capsaicin", "paprika", "chili", "chilli", "cayenne", "jalapeño", "pimento", "bell pepper", "red pepper", "green pepper", "capsicum extract", "pepper extract", "pepper oleoresin"],
  "Peppers": ["capsicum", "capsaicin", "paprika", "chili", "chilli", "cayenne", "jalapeño", "pimento", "bell pepper", "red pepper", "green pepper", "capsicum extract", "pepper extract", "pepper oleoresin"],
  "Milk": ["dairy", "lactose", "whey", "casein", "butter", "cream", "cheese", "yogurt", "buttermilk", "curd"],
  "Dairy": ["milk", "lactose", "whey", "casein", "butter", "cream", "cheese", "yogurt", "buttermilk", "curd"],
  "Wheat": ["gluten", "flour", "bread", "pasta", "bulgur", "semolina", "couscous", "bran", "starch"],
  "Gluten": ["wheat", "barley", "rye", "malt", "oats", "beer", "spelt", "triticale", "kamut"]
};

/**
 * Enhance allergen detection by checking for related ingredients
 * that might not have been caught by the initial AI analysis
 */
function enhanceAllergenDetection(
  result: ScanAnalysisResponse, 
  userAllergens: Allergen[]
): ScanAnalysisResponse {
  // If no ingredients or already marked unsafe, return as is
  if (!result.ingredients || result.isSafe === false) {
    return result;
  }
  
  const ingredients = result.ingredients.toLowerCase();
  const detectedAllergens = [...result.detectedAllergens];
  let isSafe = result.isSafe;
  
  // Check each user allergen against our related ingredients map
  for (const allergen of userAllergens) {
    const allergenName = allergen.name;
    const relatedIngredients = ALLERGEN_RELATED_INGREDIENTS[allergenName];
    
    if (relatedIngredients) {
      // Check if any related ingredients are in the ingredients list
      for (const relatedIngredient of relatedIngredients) {
        if (ingredients.includes(relatedIngredient.toLowerCase())) {
          // Check if this related ingredient is already detected
          const alreadyDetected = detectedAllergens.some(
            detected => detected.found.toLowerCase().includes(relatedIngredient.toLowerCase())
          );
          
          if (!alreadyDetected) {
            // Add this as a caution (may contain) allergen
            detectedAllergens.push({
              name: allergenName,
              found: `${relatedIngredient} (may be related to ${allergenName})`,
              severity: 'caution'
            });
            
            // Mark as unsafe if we're confident this is a direct allergen match
            if (
              // Direct matches for pepper/capsicum
              (allergenName.toLowerCase().includes('pepper') && 
               relatedIngredient.toLowerCase().includes('capsicum')) ||
              // Other very strong relationships can be added here
              false
            ) {
              isSafe = false;
            }
          }
        }
      }
    }
  }
  
  // Update recommendation if needed
  let recommendation = result.recommendation;
  if (detectedAllergens.length > result.detectedAllergens.length) {
    const cautionAllergens = detectedAllergens
      .filter(a => a.severity === 'caution')
      .map(a => a.name)
      .join(', ');
      
    recommendation = 
      `This product may contain ingredients related to your allergens (${cautionAllergens}). ` +
      `While these might not be direct matches, we recommend caution. ` + 
      (result.recommendation || '');
  }
  
  return {
    ...result,
    isSafe,
    detectedAllergens,
    recommendation
  };
}

// Initialize OpenAI client
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || '' 
});

/**
 * Generates a prompt with the user's allergens for the OpenAI analysis
 */
function generatePrompt(allergens: Allergen[]): string {
  // Format allergens grouped by category
  const allergensByCategory = allergens.reduce((acc, allergen) => {
    if (!acc[allergen.category]) {
      acc[allergen.category] = [];
    }
    acc[allergen.category].push(allergen.name);
    return acc;
  }, {} as Record<string, string[]>);

  // Build allergen list text
  let allergenText = '';
  
  if (allergensByCategory.common && allergensByCategory.common.length > 0) {
    allergenText += `Common Allergens: ${allergensByCategory.common.join(', ')}\n`;
  }
  
  if (allergensByCategory.dietary && allergensByCategory.dietary.length > 0) {
    allergenText += `Dietary Restrictions: ${allergensByCategory.dietary.join(', ')}\n`;
  }
  
  if (allergensByCategory.religious && allergensByCategory.religious.length > 0) {
    allergenText += `Religious/Ethical Restrictions: ${allergensByCategory.religious.join(', ')}\n`;
  }
  
  if (allergensByCategory.custom && allergensByCategory.custom.length > 0) {
    allergenText += `Custom Restrictions: ${allergensByCategory.custom.join(', ')}\n`;
  }
  
  // If no allergens, specify that
  if (!allergenText) {
    allergenText = "No specific allergens or restrictions provided. In this case, the product should be considered SAFE by default unless there are clear warnings about common allergens.";
  }
  
  return PROMPT_TEMPLATE.replace('{{allergens}}', allergenText);
}

/**
 * Analyzes a food packaging image for allergens
 */
export async function analyzeImage(base64Image: string, allergens: Allergen[]): Promise<ScanAnalysisResponse> {
  try {
    const prompt = generatePrompt(allergens);
    
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content;
    
    if (!content) {
      throw new Error("Empty response from OpenAI");
    }
    
    // Parse the response
    const result = JSON.parse(content) as ScanAnalysisResponse;
    
    // Check if the ingredients are clearly visible
    const isIngredientsUnclear = 
      result.ingredients?.toLowerCase().includes("cannot") || 
      result.ingredients?.toLowerCase().includes("unclear") || 
      result.ingredients?.toLowerCase().includes("not visible") ||
      result.ingredients?.toLowerCase().includes("poor quality") ||
      result.ingredients?.toLowerCase().includes("poor image") ||
      result.ingredients?.toLowerCase().includes("incomplete") ||
      result.ingredients?.toLowerCase().includes("partial") ||
      result.ingredients?.toLowerCase().includes("illegible") ||
      result.ingredients?.toLowerCase().includes("blurry") ||
      result.ingredients?.toLowerCase().includes("can't see") ||
      result.ingredients?.toLowerCase().includes("can't read") ||
      result.ingredients?.toLowerCase().includes("unable to read") ||
      result.ingredients?.toLowerCase().includes("not able to") ||
      result.productName?.toLowerCase().includes("unknown") ||
      result.recommendation?.toLowerCase().includes("retake") ||
      result.recommendation?.toLowerCase().includes("clearer") ||
      result.recommendation?.toLowerCase().includes("better photo") ||
      result.recommendation?.toLowerCase().includes("better picture") ||
      result.recommendation?.toLowerCase().includes("better image") ||
      result.recommendation?.toLowerCase().includes("unclear") ||
      result.ingredients === "Could not extract ingredients clearly" ||
      !result.ingredients ||
      result.ingredients.length < 15 ||
      // Force unclear mode if we're getting a small number of ingredients with "safe" indication
      (result.isSafe === true && result.detectedAllergens.length === 0 && result.ingredients.length < 50);
    
    // Check for ingredients that might be related to user's allergens
    const enhancedResult = enhanceAllergenDetection(result, allergens);
    
    // Provide fallbacks for missing fields
    return {
      productName: enhancedResult.productName || "Unable to identify product",
      // If ingredients are unclear, mark as "unclear" rather than safe/unsafe
      isSafe: isIngredientsUnclear ? null : (enhancedResult.isSafe ?? false),
      detectedAllergens: enhancedResult.detectedAllergens || [],
      ingredients: isIngredientsUnclear ? 
        "Could not clearly identify all ingredients. Please take a clearer picture of the ingredients list." : 
        enhancedResult.ingredients,
      recommendation: isIngredientsUnclear ? 
        "Please retake a clearer photo of the ingredients list. For best results, ensure good lighting and focus directly on the text." : 
        (enhancedResult.recommendation || "No specific recommendation available."),
      alternativeSuggestion: isIngredientsUnclear ? 
        "Try holding the camera closer to the ingredients list and ensure good lighting." :
        (enhancedResult.alternativeSuggestion || "")
    };
  } catch (error: any) {
    console.error("Error analyzing image with OpenAI:", error);
    throw new Error(`Failed to analyze image: ${error.message || 'Unknown error'}`);
  }
}
