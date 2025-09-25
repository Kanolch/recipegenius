import { type User, type InsertUser, type Recipe, type InsertRecipe } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createRecipe(recipe: InsertRecipe): Promise<Recipe>;
  getRecipesByIngredients(ingredients: string): Promise<Recipe[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private recipes: Map<string, Recipe>;

  constructor() {
    this.users = new Map();
    this.recipes = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createRecipe(insertRecipe: InsertRecipe): Promise<Recipe> {
    const id = randomUUID();
    const recipe: Recipe = { 
      id,
      title: insertRecipe.title,
      ingredients: insertRecipe.ingredients as string[],
      instructions: insertRecipe.instructions as string[],
      cookingTime: insertRecipe.cookingTime || null,
      servings: insertRecipe.servings || null,
      difficulty: insertRecipe.difficulty || null,
      suggestedAdditions: insertRecipe.suggestedAdditions as string[] || null,
      originalIngredients: insertRecipe.originalIngredients,
      createdAt: new Date()
    };
    this.recipes.set(id, recipe);
    return recipe;
  }

  async getRecipesByIngredients(ingredients: string): Promise<Recipe[]> {
    return Array.from(this.recipes.values()).filter(recipe => 
      recipe.originalIngredients.toLowerCase().includes(ingredients.toLowerCase())
    );
  }
}

export const storage = new MemStorage();
