import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Recipe } from "@shared/schema";

import Header from "@/components/header";
import IngredientInput from "@/components/ingredient-input";
import LoadingState from "@/components/loading-state";
import RecipeCard from "@/components/recipe-card";
import SavedRecipes from "@/components/saved-recipes";
import { ChefHat, Bot, Utensils } from "lucide-react";

export default function Home() {
  const [generatedRecipes, setGeneratedRecipes] = useState<Recipe[]>([]);
  const [savedRecipes, setSavedRecipes] = useLocalStorage<Recipe[]>("saved-recipes", []);
  const [likedRecipes, setLikedRecipes] = useLocalStorage<string[]>("liked-recipes", []);
  const { toast } = useToast();

  const generateMutation = useMutation({
    mutationFn: async (ingredients: string) => {
      const response = await apiRequest("POST", "/api/recipes/generate", { ingredients });
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedRecipes(data.recipes);
      
      if (data.usedFallback) {
        toast({
          title: "Demo Recipes Generated",
          description: "AI service is unavailable. Showing demo recipes based on your ingredients.",
          variant: "default",
        });
      } else {
        toast({
          title: "Recipes Generated!",
          description: `Created ${data.recipes.length} delicious recipes for you.`,
        });
      }
    },
    onError: (error: Error) => {
      console.error("Recipe generation failed:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate recipes. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerateRecipes = (ingredients: string) => {
    generateMutation.mutate(ingredients);
  };

  const handleSaveRecipe = (recipe: Recipe) => {
    const isAlreadySaved = savedRecipes.some(saved => saved.id === recipe.id);
    
    if (isAlreadySaved) {
      setSavedRecipes(savedRecipes.filter(saved => saved.id !== recipe.id));
      toast({
        title: "Recipe Removed",
        description: "Recipe removed from your saved list.",
      });
    } else {
      setSavedRecipes([...savedRecipes, recipe]);
      toast({
        title: "Recipe Saved!",
        description: "Recipe added to your saved list.",
      });
    }
  };

  const handleLikeRecipe = (recipe: Recipe) => {
    const isAlreadyLiked = likedRecipes.includes(recipe.id);
    
    if (isAlreadyLiked) {
      setLikedRecipes(likedRecipes.filter(id => id !== recipe.id));
    } else {
      setLikedRecipes([...likedRecipes, recipe.id]);
    }
  };

  const handleViewAllSaved = () => {
    // This would navigate to a dedicated saved recipes page
    toast({
      title: "Coming Soon",
      description: "Dedicated saved recipes page will be available soon!",
    });
  };

  return (
    <div className="bg-background min-h-screen">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <IngredientInput 
          onGenerate={handleGenerateRecipes}
          isLoading={generateMutation.isPending}
        />

        {generateMutation.isPending && <LoadingState />}

        {generatedRecipes.length > 0 && (
          <div className="space-y-6" data-testid="section-generated-recipes">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">
                <ChefHat className="text-primary mr-3 inline" size={24} />
                Generated Recipes
              </h2>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Bot size={16} />
                <span>AI Generated</span>
              </div>
            </div>

            {generatedRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onSave={handleSaveRecipe}
                onLike={handleLikeRecipe}
                isSaved={savedRecipes.some(saved => saved.id === recipe.id)}
                isLiked={likedRecipes.includes(recipe.id)}
              />
            ))}
          </div>
        )}

        <SavedRecipes 
          savedRecipes={savedRecipes}
          onViewAll={handleViewAllSaved}
        />
      </main>

      <footer className="bg-card border-t border-border mt-16">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Utensils className="text-primary-foreground" size={16} />
              </div>
              <span className="text-lg font-semibold text-foreground">AI Recipe Generator</span>
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              Transform your ingredients into delicious recipes with the power of AI
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
              <span><Bot className="mr-1 inline" size={14} />Powered by OpenAI</span>
              <span><Utensils className="mr-1 inline" size={14} />Built with Node.js</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
