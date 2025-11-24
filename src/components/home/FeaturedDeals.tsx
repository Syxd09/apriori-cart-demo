import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import type { Product } from "@/types";

interface FeaturedDealsProps {
  products: Product[];
  addToCart: (product: Product) => void;
}

const FeaturedDeals: React.FC<FeaturedDealsProps> = ({ products, addToCart }) => {
  const navigate = useNavigate();

  return (
    <Card className="mb-8 bg-gradient-to-r from-orange-50 via-red-50 to-pink-50 dark:from-orange-950/20 dark:via-red-950/20 dark:to-pink-950/20 border-orange-200/50">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <span className="text-2xl">🔥</span>
              Hot Deals & Trending
            </h2>
            <p className="text-muted-foreground">Limited time offers on popular items</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/bundles')} className="hidden sm:flex">
              View All Bundles
            </Button>
            <Badge className="bg-orange-500 text-white animate-pulse">
              Live Deals
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products
            .filter(p => p.price < 100) // Show affordable items as "deals"
            .sort((a, b) => b.price - a.price) // Sort by price descending
            .slice(0, 4)
            .map((product) => (
              <Card
                key={`featured-${product.id}`}
                className="group p-4 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border-2 hover:border-orange-300"
                onClick={() => navigate(`/product/${product.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(`/product/${product.id}`);
                  }
                }}
                aria-label={`View details for ${product.name}`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">
                    {product.emoji}
                  </div>
                  <Badge variant="secondary" className="text-xs mb-2 bg-orange-100 text-orange-800">
                    🔥 Hot Deal
                  </Badge>
                  <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-lg font-bold text-orange-600">
                      ₹{product.price.toFixed(2)}
                    </span>
                    <span className="text-xs text-muted-foreground line-through">
                      ₹{(product.price * 1.3).toFixed(0)}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    className="w-full mt-3 bg-orange-500 hover:bg-orange-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product);
                    }}
                  >
                    Add to Cart
                  </Button>
                </div>
              </Card>
            ))}
        </div>
      </div>
    </Card>
  );
};

export default FeaturedDeals;
