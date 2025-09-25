import { Utensils, Bookmark, Heart } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-card shadow-sm border-b border-border">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Utensils className="text-primary-foreground text-lg" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">AI Recipe Generator</h1>
              <p className="text-sm text-muted-foreground">Transform your ingredients into delicious recipes</p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <button className="text-muted-foreground hover:text-foreground transition-colors" data-testid="button-bookmarks">
              <Bookmark className="text-lg" />
            </button>
            <button className="text-muted-foreground hover:text-foreground transition-colors" data-testid="button-favorites">
              <Heart className="text-lg" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
