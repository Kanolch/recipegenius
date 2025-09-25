import OpenAI from "openai";

// Using GPT-4 for better recipe generation quality
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
      model: "gpt-4",
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
    
    // Re-throw the error to let the routes handle it properly
    // This allows the API to return appropriate error responses to the client
    throw error;
  }
}

export async function generateFallbackRecipes(ingredients: string): Promise<GeneratedRecipe[]> {
  console.log("Generating fallback demo recipes for ingredients:", ingredients);
  
  // Create ingredient-aware fallback recipes
  const ingredientList = ingredients.toLowerCase().split(',').map(i => i.trim());
  
  return [
      {
        title: `Mediterranean ${ingredientList[0] || 'Ingredient'} Bowl`,
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
          "Remove chicken and set aside, then sauté onions and bell peppers",
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
        title: `Asian-Style ${ingredientList[0] || 'Ingredient'} Stir Fry`,
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
        title: `Spanish ${ingredientList[0] || 'Ingredient'} Paella`,
        ingredients: [
          ...ingredientList.slice(0, 5),
          "saffron",
          "chicken broth",
          "paprika"
        ],
        instructions: [
          "Heat olive oil in a large paella pan or skillet",
          "Brown chicken pieces on all sides, then remove",
          "Sauté onions and bell peppers until softened",
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
