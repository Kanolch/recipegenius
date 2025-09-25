import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Carrot, Wand2, Eraser } from "lucide-react";

interface IngredientInputProps {
  onGenerate: (ingredients: string) => void;
  isLoading: boolean;
}

export default function IngredientInput({ onGenerate, isLoading }: IngredientInputProps) {
  const [ingredients, setIngredients] = useState("");

  const handleGenerate = () => {
    if (ingredients.trim()) {
      onGenerate(ingredients.trim());
    }
  };

  const handleClear = () => {
    setIngredients("");
  };

  const ingredientList = ingredients
    .split(',')
    .map(item => item.trim())
    .filter(item => item);

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border p-6 mb-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-2">What ingredients do you have?</h2>
        <p className="text-muted-foreground">List the ingredients you have available, and our AI will suggest amazing recipes you can make!</p>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <label htmlFor="ingredients" className="block text-sm font-medium text-foreground mb-2">
            <Carrot className="text-primary mr-2 inline" size={16} />
            Your Ingredients
          </label>
          <Textarea 
            id="ingredients" 
            rows={4} 
            className="w-full p-4 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-all resize-none"
            placeholder="E.g., chicken breast, bell peppers, onions, garlic, olive oil, rice..."
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            data-testid="textarea-ingredients"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={handleGenerate}
            disabled={!ingredients.trim() || isLoading}
            className="flex-1 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-all flex items-center justify-center space-x-2 shadow-sm"
            data-testid="button-generate"
          >
            {isLoading ? (
              <>
                <div className="loading-spinner mr-2"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Wand2 size={18} />
                <span>Generate Recipes</span>
              </>
            )}
          </Button>
          <Button 
            onClick={handleClear}
            variant="secondary"
            className="bg-secondary text-secondary-foreground px-6 py-3 rounded-lg font-medium hover:bg-secondary/90 transition-all flex items-center justify-center space-x-2"
            data-testid="button-clear"
          >
            <Eraser size={16} />
            <span>Clear</span>
          </Button>
        </div>

        {ingredientList.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {ingredientList.map((ingredient, index) => (
              <span 
                key={index} 
                className="ingredient-tag text-primary-foreground px-3 py-1 rounded-full text-sm font-medium"
                data-testid={`tag-ingredient-${index}`}
              >
                {ingredient}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
