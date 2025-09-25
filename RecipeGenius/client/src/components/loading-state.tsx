export default function LoadingState() {
  return (
    <div className="bg-card rounded-lg shadow-sm border border-border p-8 mb-8">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="loading-spinner"></div>
        <div className="text-center">
          <h3 className="text-lg font-medium text-foreground">Generating Recipes...</h3>
          <p className="text-muted-foreground">Our AI is creating delicious recipes just for you</p>
        </div>
      </div>
    </div>
  );
}
