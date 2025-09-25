import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateRecipeRequestSchema } from "@shared/schema";
import { generateRecipes, generateFallbackRecipes } from "./services/openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Generate recipes endpoint
  app.post("/api/recipes/generate", async (req, res) => {
    try {
      const { ingredients } = generateRecipeRequestSchema.parse(req.body);
      
      let generatedRecipes;
      let usedFallback = false;
      
      try {
        // Try to generate recipes using OpenAI
        generatedRecipes = await generateRecipes(ingredients);
      } catch (aiError: any) {
        console.log("OpenAI failed, using fallback recipes");
        generatedRecipes = await generateFallbackRecipes(ingredients);
        usedFallback = true;
      }
      
      // Store recipes in memory storage
      const savedRecipes = await Promise.all(
        generatedRecipes.map(recipe => 
          storage.createRecipe({
            ...recipe,
            originalIngredients: ingredients
          })
        )
      );
      
      res.json({ 
        recipes: savedRecipes,
        usedFallback,
        message: usedFallback ? "AI service unavailable - showing demo recipes" : undefined
      });
    } catch (error: any) {
      console.error("Recipe generation error:", error);
      
      if (error.name === "ZodError") {
        return res.status(400).json({ 
          message: "Invalid request data"
        });
      }
      
      res.status(500).json({ 
        message: "Failed to generate recipes. Please try again later."
      });
    }
  });

  // Get recipes by ingredients
  app.get("/api/recipes", async (req, res) => {
    try {
      const { ingredients } = req.query;
      
      if (!ingredients || typeof ingredients !== "string") {
        return res.status(400).json({ message: "Ingredients query parameter is required" });
      }
      
      const recipes = await storage.getRecipesByIngredients(ingredients);
      res.json({ recipes });
    } catch (error: any) {
      console.error("Get recipes error:", error);
      res.status(500).json({ 
        message: "Failed to retrieve recipes"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
