import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateRecipeRequestSchema } from "@shared/schema";
import { generateRecipes } from "./services/openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Generate recipes endpoint
  app.post("/api/recipes/generate", async (req, res) => {
    try {
      const { ingredients } = generateRecipeRequestSchema.parse(req.body);
      
      // Generate recipes using OpenAI
      const generatedRecipes = await generateRecipes(ingredients);
      
      // Store recipes in memory storage
      const savedRecipes = await Promise.all(
        generatedRecipes.map(recipe => 
          storage.createRecipe({
            ...recipe,
            originalIngredients: ingredients
          })
        )
      );
      
      res.json({ recipes: savedRecipes });
    } catch (error: any) {
      console.error("Recipe generation error:", error);
      
      if (error.name === "ZodError") {
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: error.errors 
        });
      }
      
      if (error.message && (error.message.includes("OpenAI") || error.message.includes("API"))) {
        return res.status(503).json({ 
          message: "Recipe generation service is temporarily unavailable. Please try again later.",
          error: error.message
        });
      }
      
      res.status(500).json({ 
        message: "Failed to generate recipes. Please check your ingredients and try again.",
        error: error.message || "Unknown error occurred"
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
        message: "Failed to retrieve recipes",
        error: error.message || "Unknown error occurred"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
