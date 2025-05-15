import OpenAI from "openai";
import { OPENAI_MODEL, PROMPT_TEMPLATE } from "../config";
import { Allergen, ScanAnalysisResponse } from "@shared/schema";

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
    allergenText = "No specific allergens or restrictions provided. Please analyze all common allergens.";
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
    
    // Provide fallbacks for missing fields
    return {
      productName: result.productName || "Unknown Product",
      isSafe: result.isSafe ?? false,
      detectedAllergens: result.detectedAllergens || [],
      ingredients: result.ingredients || "Could not extract ingredients clearly",
      recommendation: result.recommendation || "Unable to provide a clear recommendation based on the image quality",
      alternativeSuggestion: result.alternativeSuggestion || ""
    };
  } catch (error) {
    console.error("Error analyzing image with OpenAI:", error);
    throw new Error(`Failed to analyze image: ${error.message || 'Unknown error'}`);
  }
}
