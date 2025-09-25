import { Button } from "@/components/ui/button";
import { Bookmark, ArrowRight } from "lucide-react";
import { Recipe } from "@shared/schema";

interface SavedRecipesProps {
  savedRecipes: Recipe[];
  onViewAll: () => void;
}

export default function SavedRecipes({ savedRecipes, onViewAll }: SavedRecipesProps) {
  return (
    <div className="mt-12">
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">
            <Bookmark className="text-accent mr-2 inline" size={20} />
            Saved Recipes
          </h2>
          {savedRecipes.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewAll}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              data-testid="button-view-all-saved"
            >
              View All <ArrowRight className="ml-1" size={14} />
            </Button>
          )}
        </div>
        
        {savedRecipes.length === 0 ? (
          <div className="text-center py-8" data-testid="empty-saved-recipes">
            <Bookmark className="text-4xl text-muted mb-4 mx-auto" size={48} />
            <p className="text-muted-foreground mb-4">No saved recipes yet</p>
            <p className="text-sm text-muted-foreground">Click the bookmark icon on any recipe to save it here</p>
          </div>
        ) : (
          <div className="space-y-3" data-testid="list-saved-recipes">
            {savedRecipes.slice(0, 3).map((recipe) => (
              <div key={recipe.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg" data-testid={`item-saved-recipe-${recipe.id}`}>
                <div>
                  <h4 className="font-medium text-foreground" data-testid={`text-saved-title-${recipe.id}`}>{recipe.title}</h4>
                  <p className="text-sm text-muted-foreground" data-testid={`text-saved-time-${recipe.id}`}>{recipe.cookingTime} • {recipe.servings}</p>
                </div>
                <Button variant="ghost" size="sm" data-testid={`button-view-saved-${recipe.id}`}>
                  View
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
