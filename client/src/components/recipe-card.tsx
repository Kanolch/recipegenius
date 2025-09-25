import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Clock, Users, Flame, Bookmark, Heart, Check, Plus } from "lucide-react";
import { Recipe } from "@shared/schema";

interface RecipeCardProps {
  recipe: Recipe;
  onSave: (recipe: Recipe) => void;
  onLike: (recipe: Recipe) => void;
  isSaved: boolean;
  isLiked: boolean;
}

export default function RecipeCard({ recipe, onSave, onLike, isSaved, isLiked }: RecipeCardProps) {
  return (
    <div className="recipe-card bg-card rounded-lg shadow-sm border border-border p-6 fade-in" data-testid={`card-recipe-${recipe.id}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-foreground mb-2" data-testid={`text-recipe-title-${recipe.id}`}>
            {recipe.title}
          </h3>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span data-testid={`text-cooking-time-${recipe.id}`}>
              <Clock className="mr-1 inline" size={14} />
              {recipe.cookingTime}
            </span>
            <span data-testid={`text-servings-${recipe.id}`}>
              <Users className="mr-1 inline" size={14} />
              {recipe.servings}
            </span>
            <span data-testid={`text-difficulty-${recipe.id}`}>
              <Flame className="mr-1 inline" size={14} />
              {recipe.difficulty}
            </span>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSave(recipe)}
            className="text-muted-foreground hover:text-accent transition-colors p-2"
            data-testid={`button-save-${recipe.id}`}
          >
            <Bookmark className={isSaved ? "fill-current" : ""} size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onLike(recipe)}
            className="text-muted-foreground hover:text-red-500 transition-colors p-2"
            data-testid={`button-like-${recipe.id}`}
          >
            <Heart className={isLiked ? "fill-current text-red-500" : ""} size={16} />
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-foreground mb-3 flex items-center">
            <Check className="text-primary mr-2" size={16} />
            Ingredients Needed
          </h4>
          <ul className="space-y-2" data-testid={`list-ingredients-${recipe.id}`}>
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="flex items-start text-foreground" data-testid={`item-ingredient-${recipe.id}-${index}`}>
                <Check className="text-primary mr-2 mt-1 flex-shrink-0" size={12} />
                <span>{ingredient}</span>
              </li>
            ))}
          </ul>

          {recipe.suggestedAdditions && recipe.suggestedAdditions.length > 0 && (
            <div className="mt-4 p-3 bg-accent/10 rounded-lg">
              <h5 className="font-medium text-accent mb-2">
                <Plus className="mr-1 inline" size={14} />
                Suggested Additions
              </h5>
              <ul className="text-sm text-accent space-y-1" data-testid={`list-suggestions-${recipe.id}`}>
                {recipe.suggestedAdditions.map((addition, index) => (
                  <li key={index} data-testid={`item-suggestion-${recipe.id}-${index}`}>• {addition}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div>
          <h4 className="font-medium text-foreground mb-3 flex items-center">
            <Check className="text-primary mr-2" size={16} />
            Instructions
          </h4>
          <ol className="space-y-3" data-testid={`list-instructions-${recipe.id}`}>
            {recipe.instructions.map((instruction, index) => (
              <li key={index} className="flex items-start text-foreground" data-testid={`item-instruction-${recipe.id}-${index}`}>
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium mr-3 mt-0.5 flex-shrink-0">
                  {index + 1}
                </span>
                <span>{instruction}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
