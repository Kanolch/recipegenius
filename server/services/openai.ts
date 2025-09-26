import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export interface GeneratedRecipe {
  title: string;
  ingredients: string[];
  instructions: string[];
  cookingTime: string;
  servings: string;
  difficulty: string;
}

export interface BonusRecipe {
  shoppingList: string[];
  title: string;
  ingredients: string[];
  instructions: string[];
  cookingTime: string;
  servings: string;
  difficulty: string;
}

export async function generateRecipes(ingredients: string): Promise<{
  recipes: GeneratedRecipe[];
  bonus: BonusRecipe;
}> {
  const prompt = `The user has these base ingredients: ${ingredients}.

Your tasks:
1. Create exactly 3 diverse and creative dishes **only using the provided ingredients** plus basic pantry staples (oil, salt, pepper, water).
2. Each dish must include:
   - A creative and appetizing title
   - A complete list of ingredients (only from the user list + pantry staples)
   - Step-by-step cooking instructions
   - Estimated cooking time
   - Number of servings
   - Difficulty level (Easy, Medium, or Hard)

3. Also create a 4th option:
   - A shopping list of new ingredients to buy
   - A new recipe that combines these new ingredients with the user’s base ingredients
   - Include title, full ingredients, instructions, cooking time, servings, and difficulty.

Return your answer as valid JSON with this exact structure:

{
  "recipes": [
    {
      "title": "...",
      "ingredients": [...],
      "instructions": [...],
      "cookingTime": "...",
      "servings": "...",
      "difficulty": "Easy/Medium/Hard"
    }
  ],
  "bonus": {
    "shoppingList": ["ingredient1", "ingredient2", ...],
    "title": "...",
    "ingredients": [...],
    "instructions": [...],
    "cookingTime": "...",
    "servings": "...",
    "difficulty": "Easy/Medium/Hard"
  }
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content:
          "You are a creative and skilled chef. Always strictly follow the constraints given, use only the allowed ingredients for the first 3 recipes, and always respond with valid JSON in the requested format."
      },
      { role: "user", content: prompt }
    ],
    response_format: { type: "json_object" }
  });

  const raw = response.choices[0].message.content || "{}";
  console.log("AI raw output:", raw);

  const result = JSON.parse(raw);

  if (!result.recipes || !Array.isArray(result.recipes) || !result.bonus) {
    throw new Error("Invalid response format from OpenAI");
  }

  return result;
}
