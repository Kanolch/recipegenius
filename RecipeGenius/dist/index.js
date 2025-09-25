// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import { randomUUID } from "crypto";
var MemStorage = class {
  users;
  recipes;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.recipes = /* @__PURE__ */ new Map();
  }
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = randomUUID();
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  async createRecipe(insertRecipe) {
    const id = randomUUID();
    const recipe = {
      id,
      title: insertRecipe.title,
      ingredients: insertRecipe.ingredients,
      instructions: insertRecipe.instructions,
      cookingTime: insertRecipe.cookingTime || null,
      servings: insertRecipe.servings || null,
      difficulty: insertRecipe.difficulty || null,
      suggestedAdditions: insertRecipe.suggestedAdditions || null,
      originalIngredients: insertRecipe.originalIngredients,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.recipes.set(id, recipe);
    return recipe;
  }
  async getRecipesByIngredients(ingredients) {
    return Array.from(this.recipes.values()).filter(
      (recipe) => recipe.originalIngredients.toLowerCase().includes(ingredients.toLowerCase())
    );
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var recipes = pgTable("recipes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  ingredients: jsonb("ingredients").$type().notNull(),
  instructions: jsonb("instructions").$type().notNull(),
  cookingTime: text("cooking_time"),
  servings: text("servings"),
  difficulty: text("difficulty"),
  suggestedAdditions: jsonb("suggested_additions").$type(),
  originalIngredients: text("original_ingredients").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var insertRecipeSchema = createInsertSchema(recipes).omit({
  id: true,
  createdAt: true
});
var generateRecipeRequestSchema = z.object({
  ingredients: z.string().min(1, "Please provide at least one ingredient")
});

// server/services/openai.ts
import OpenAI from "openai";
var openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});
async function generateRecipes(ingredients) {
  try {
    const prompt = `I have these ingredients: ${ingredients}. 

Please generate exactly 3 diverse and creative recipes I can make using these ingredients. For each recipe, provide:
1. A creative and appetizing title
2. A complete list of ingredients needed (including the ones I provided plus any additional basic ingredients)
3. Step-by-step cooking instructions
4. Estimated cooking time
5. Number of servings
6. Difficulty level (Easy, Medium, or Hard)
7. 2-3 suggested additional ingredients that would enhance the recipe

Respond with a JSON object containing an array of recipes. Each recipe should have this exact structure:
{
  "recipes": [
    {
      "title": "Recipe Name",
      "ingredients": ["ingredient 1", "ingredient 2", ...],
      "instructions": ["step 1", "step 2", ...],
      "cookingTime": "X mins",
      "servings": "X servings",
      "difficulty": "Easy/Medium/Hard",
      "suggestedAdditions": ["suggestion 1", "suggestion 2", ...]
    }
  ]
}

Make sure the recipes are practical, delicious, and use the ingredients I provided as main components.`;
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional chef and recipe creator. Generate creative, practical, and delicious recipes based on the provided ingredients. Always respond with valid JSON in the exact format requested."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });
    const result = JSON.parse(response.choices[0].message.content || "{}");
    if (!result.recipes || !Array.isArray(result.recipes)) {
      throw new Error("Invalid response format from OpenAI");
    }
    return result.recipes;
  } catch (error) {
    console.error("OpenAI API Error:", error);
    throw error;
  }
}
async function generateFallbackRecipes(ingredients) {
  console.log("Generating fallback demo recipes for ingredients:", ingredients);
  const ingredientList = ingredients.toLowerCase().split(",").map((i) => i.trim());
  return [
    {
      title: `Mediterranean ${ingredientList[0] || "Ingredient"} Bowl`,
      ingredients: [
        ...ingredientList.slice(0, 3),
        "lemon juice",
        "oregano",
        "olive oil",
        "feta cheese"
      ],
      instructions: [
        "Season chicken breast with salt, pepper, and oregano",
        "Heat olive oil in a large pan over medium-high heat",
        "Cook chicken breast for 6-7 minutes per side until golden",
        "Remove chicken and set aside, then saut\xE9 onions and bell peppers",
        "Add garlic and cook for 1 minute until fragrant",
        "Cook rice according to package instructions",
        "Slice chicken and serve over rice with vegetables",
        "Drizzle with lemon juice and crumble feta on top"
      ],
      cookingTime: "25 mins",
      servings: "4 servings",
      difficulty: "Easy",
      suggestedAdditions: ["cherry tomatoes", "kalamata olives", "fresh basil"]
    },
    {
      title: `Asian-Style ${ingredientList[0] || "Ingredient"} Stir Fry`,
      ingredients: [
        ...ingredientList.slice(0, 4),
        "soy sauce",
        "ginger",
        "sesame oil"
      ],
      instructions: [
        "Cut chicken into bite-sized pieces",
        "Heat olive oil in a wok or large pan",
        "Stir-fry chicken pieces until cooked through",
        "Add bell peppers and onions, stir-fry for 3-4 minutes",
        "Add minced garlic and ginger, cook for 1 minute",
        "Add soy sauce and sesame oil, toss to coat",
        "Serve hot over steamed rice"
      ],
      cookingTime: "20 mins",
      servings: "3 servings",
      difficulty: "Easy",
      suggestedAdditions: ["broccoli florets", "cashews", "green onions"]
    },
    {
      title: `Spanish ${ingredientList[0] || "Ingredient"} Paella`,
      ingredients: [
        ...ingredientList.slice(0, 5),
        "saffron",
        "chicken broth",
        "paprika"
      ],
      instructions: [
        "Heat olive oil in a large paella pan or skillet",
        "Brown chicken pieces on all sides, then remove",
        "Saut\xE9 onions and bell peppers until softened",
        "Add garlic and cook for 1 minute",
        "Stir in rice, coating with the oil and vegetables",
        "Add saffron, paprika, and hot chicken broth",
        "Return chicken to pan and simmer for 20 minutes",
        "Let rest for 5 minutes before serving"
      ],
      cookingTime: "40 mins",
      servings: "6 servings",
      difficulty: "Medium",
      suggestedAdditions: ["green peas", "artichoke hearts", "lemon wedges"]
    }
  ];
}

// server/routes.ts
async function registerRoutes(app2) {
  app2.post("/api/recipes/generate", async (req, res) => {
    try {
      const { ingredients } = generateRecipeRequestSchema.parse(req.body);
      let generatedRecipes;
      let usedFallback = false;
      try {
        generatedRecipes = await generateRecipes(ingredients);
      } catch (aiError) {
        console.log("OpenAI failed, using fallback recipes");
        generatedRecipes = await generateFallbackRecipes(ingredients);
        usedFallback = true;
      }
      const savedRecipes = await Promise.all(
        generatedRecipes.map(
          (recipe) => storage.createRecipe({
            ...recipe,
            originalIngredients: ingredients
          })
        )
      );
      res.json({
        recipes: savedRecipes,
        usedFallback,
        message: usedFallback ? "AI service unavailable - showing demo recipes" : void 0
      });
    } catch (error) {
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
  app2.get("/api/recipes", async (req, res) => {
    try {
      const { ingredients } = req.query;
      if (!ingredients || typeof ingredients !== "string") {
        return res.status(400).json({ message: "Ingredients query parameter is required" });
      }
      const recipes2 = await storage.getRecipesByIngredients(ingredients);
      res.json({ recipes: recipes2 });
    } catch (error) {
      console.error("Get recipes error:", error);
      res.status(500).json({
        message: "Failed to retrieve recipes"
      });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
async function getPlugins() {
  const plugins = [react(), runtimeErrorOverlay()];
  if (process.env.NODE_ENV !== "production" && process.env.REPL_ID) {
    const { cartographer } = await import("@replit/vite-plugin-cartographer");
    const { devBanner } = await import("@replit/vite-plugin-dev-banner");
    plugins.push(cartographer(), devBanner());
  }
  return plugins;
}
var vite_config_default = async () => {
  const plugins = await getPlugins();
  return defineConfig({
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "client/src"),
        "@shared": path.resolve(__dirname, "shared"),
        "@assets": path.resolve(__dirname, "attached_assets")
      }
    },
    root: path.resolve(__dirname, "client"),
    // your frontend root
    build: {
      outDir: path.resolve(__dirname, "dist"),
      // build output
      emptyOutDir: true
    },
    server: {
      fs: { strict: true, deny: ["**/.*"] }
    }
  });
};

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "dist",
        "index.html"
        // updated to dist
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "../dist");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(port, "127.0.0.1", () => {
    log(`Server running on http://127.0.0.1:${port}`);
  });
})();
