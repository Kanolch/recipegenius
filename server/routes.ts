import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateRecipeRequestSchema } from "@shared/schema";
import { generateRecipes } from "./services/openai"; // remove fallback import

export async function registerRoutes(app: Express): Promise<Server> {
  // Generate recipes endpoint
  app.post("/api/recipes/generate", async (req, res) => {
    try {
      const { ingredients } = generateRecipeRequestSchema.parse(req.body);

      // Generate recipes using OpenAI
      const { recipes, bonus } = await generateRecipes(ingredients);

      // Store the 3 generated recipes in memory storage
      const savedRecipes = await Promise.all(
        recipes.map((recipe) =>
          storage.createRecipe({
            ...recipe,
            originalIngredients: ingredients,
          })
        )
      );

      // Optionally, you can also store the bonus recipe separately if needed
      const savedBonusRecipe = await storage.createRecipe({
        ...bonus,
        originalIngredients: ingredients,
      });

      res.json({
        recipes: savedRecipes,
        bonus: savedBonusRecipe,
        message: "AI generated recipes successfully",
      });
    } catch (error: any) {
      console.error("Recipe generation error:", error);

      if (error.name === "ZodError") {
        return res.status(400).json({
          message: "Invalid request data",
        });
      }

      res.status(500).json({
        message: "Failed to generate recipes. Please try again later.",
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
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
