import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface GeneratedRecipe {
  title: string;
  ingredients: string[];
  instructions: string[];
  cookingTime: string;
  servings: string;
  difficulty: string;
  suggestedAdditions: string[];
}

export async function generateRecipes(ingredients: string): Promise<GeneratedRecipe[]> {
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
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a professional chef and recipe creator. Generate creative, practical, and delicious recipes based on the provided ingredients. Always respond with valid JSON in the exact format requested."
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    if (!result.recipes || !Array.isArray(result.recipes)) {
      throw new Error("Invalid response format from OpenAI");
    }

    return result.recipes;
  } catch (error: any) {
    console.error("OpenAI API Error:", error);
    throw new Error(`Failed to generate recipes: ${error.message || "Unknown error occurred"}`);
  }
}
