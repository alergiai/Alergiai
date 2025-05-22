import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { scanAnalysisSchema, ScanAnalysisResponse } from "@shared/schema";
import { analyzeImage } from "./services/openai";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API route to analyze a food packaging image
  app.post('/api/analyze', async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validation = scanAnalysisSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          message: 'Invalid request data', 
          errors: validation.error.format() 
        });
      }
      
      const { base64Image, allergens } = validation.data;
      
      // If no base64Image or it's invalid
      if (!base64Image || base64Image.trim() === '') {
        return res.status(400).json({ message: 'Missing or invalid image data' });
      }
      
      // Log the allergens being processed
      console.log(`Processing scan with ${allergens.length} selected allergens:`, 
        allergens.map(a => a.name).join(', '));
      
      // Analyze the image using OpenAI
      const analysisResult = await analyzeImage(base64Image, allergens);
      
      // Return the analysis results
      return res.status(200).json(analysisResult);
      
    } catch (error) {
      console.error('Error analyzing image:', error);
      return res.status(500).json({ 
        message: 'Failed to analyze image', 
        error: error.message 
      });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
  });

  const httpServer = createServer(app);

  return httpServer;
}
