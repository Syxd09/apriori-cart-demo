import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types";

interface FeaturedCategoriesProps {
  categories: string[];
  products: Product[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

const FeaturedCategories: React.FC<FeaturedCategoriesProps> = ({
  categories,
  products,
  selectedCategory,
  setSelectedCategory
}) => {
  return (
    <div className="mb-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-4">Explore Categories</h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Discover thousands of products across our carefully curated categories
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.slice(1, 7).map((category) => {
          const categoryEmoji: Record<string, string> = {
            'Fruits': '🍎', 'Vegetables': '🥕', 'Dairy': '🥛', 'Meat': '🥩',
            'Bakery': '🍞', 'Grains': '🌾', 'Canned': '🥫', 'Condiments': '🧂',
            'Beverages': '🥤', 'Snacks': '🍿', 'Sweets': '🍪', 'Frozen': '🧊'
          };

          const categoryColors: Record<string, string> = {
            'Fruits': 'from-red-50 to-orange-50 border-red-200',
            'Vegetables': 'from-green-50 to-emerald-50 border-green-200',
            'Dairy': 'from-blue-50 to-cyan-50 border-blue-200',
            'Meat': 'from-red-50 to-pink-50 border-red-200',
            'Bakery': 'from-yellow-50 to-amber-50 border-yellow-200',
            'Grains': 'from-amber-50 to-orange-50 border-amber-200'
          };

          const itemCount = products.filter(p => p.category === category).length;
          const avgPrice = products.filter(p => p.category === category)
            .reduce((sum, p) => sum + p.price, 0) / (itemCount || 1);

          return (
            <Card
              key={category}
              className={`p-6 hover:shadow-xl transition-all duration-300 cursor-pointer text-center group border-2 hover:scale-105 bg-gradient-to-br ${categoryColors[category] || 'from-gray-50 to-gray-100 border-gray-200'}`}
              onClick={() => setSelectedCategory(category)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedCategory(category);
                }
              }}
              aria-label={`Filter by ${category} category`}
            >
              <div className="relative mb-4">
                <div className="text-5xl mb-2 group-hover:scale-110 transition-transform duration-300 drop-shadow-sm">
                  {categoryEmoji[category] || '📦'}
                </div>
                <div className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  {itemCount}
                </div>
              </div>

              <h3 className="font-bold text-sm mb-2 group-hover:text-primary transition-colors">
                {category}
              </h3>

              <div className="space-y-1 text-xs text-muted-foreground">
                <p className="font-medium">{itemCount} products</p>
                <p>Avg. ₹{avgPrice.toFixed(0)}</p>
              </div>

              <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="sm" variant="secondary" className="w-full text-xs">
                  Browse {category}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Category Stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-primary">{categories.length - 1}</div>
          <div className="text-sm text-muted-foreground">Categories</div>
        </div>
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-primary">{products.length}</div>
          <div className="text-sm text-muted-foreground">Total Products</div>
        </div>
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-primary">
            ₹{Math.round(products.reduce((sum, p) => sum + p.price, 0) / (products.length || 1))}
          </div>
          <div className="text-sm text-muted-foreground">Avg. Price</div>
        </div>
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-primary">24/7</div>
          <div className="text-sm text-muted-foreground">Available</div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedCategories;
