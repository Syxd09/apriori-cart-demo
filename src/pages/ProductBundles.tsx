import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Tag, 
  Plus,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { runAprioriAlgorithm, sampleTransactions } from '@/lib/apriori';
import { PRODUCT_CATALOG } from '@/lib/data';
import { safeSync } from '@/lib/errorHandler';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import type { Product, AprioriRule } from '@/types';

const ProductBundles = () => {
  const navigate = useNavigate();
  const [bundles, setBundles] = useState<{
    id: string;
    name: string;
    items: Product[];
    originalPrice: number;
    bundlePrice: number;
    savings: number;
    rule: AprioriRule;
  }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Generate bundles from Apriori rules
    const result = safeSync(() => {
      // Use cached rules if available to save computation
      const cachedRules = localStorage.getItem('smartmart-apriori-rules');
      let rules: AprioriRule[] = [];

      if (cachedRules) {
        rules = JSON.parse(cachedRules);
      } else {
        // Compute fresh if needed
        const { associationRules } = runAprioriAlgorithm(sampleTransactions(), 0.01, 0.2);
        rules = associationRules;
      }

      // Filter for high-quality rules suitable for bundles
      // High lift (> 1.2) means items are strongly associated beyond chance
      // Confidence > 0.3 means decent probability
      const bundleRules = rules
        .filter(r => r.lift > 1.2 && r.confidence > 0.3)
        .sort((a, b) => b.lift - a.lift)
        .slice(0, 12); // Top 12 bundles

      // Transform rules into bundle objects
      const generatedBundles = bundleRules.map((rule, index) => {
        const itemNames = [...rule.antecedent, ...rule.consequent];
        // Deduplicate items
        const uniqueItemNames = [...new Set(itemNames)];
        
        const items = uniqueItemNames
          .map(name => PRODUCT_CATALOG.find(p => p.name === name))
          .filter((p): p is Product => !!p);

        if (items.length < 2) return null;

        const originalPrice = items.reduce((sum, item) => sum + item.price, 0);
        const discount = 0.15; // 15% off for bundles
        const bundlePrice = originalPrice * (1 - discount);
        
        // Generate a catchy name based on items
        let name = "Smart Bundle";
        const categories = [...new Set(items.map(i => i.category))];
        if (categories.length === 1) {
          name = `${categories[0].charAt(0).toUpperCase() + categories[0].slice(1)} Pack`;
        } else if (items.some(i => i.category === 'fruits' || i.category === 'vegetables')) {
          name = "Fresh Essentials";
        } else if (items.some(i => i.category === 'snacks' || i.category === 'sweets')) {
          name = "Snack Attack";
        } else if (items.some(i => i.category === 'dairy' || i.category === 'bakery')) {
          name = "Breakfast Combo";
        }

        return {
          id: `bundle-${index}`,
          name,
          items,
          originalPrice,
          bundlePrice,
          savings: originalPrice - bundlePrice,
          rule
        };
      }).filter(b => b !== null);

      setBundles(generatedBundles);
    }, 'generateBundles');

    if (result.error) {
      toast.error("Failed to generate bundles");
    }
    
    setIsLoading(false);
  }, []);

  const handleAddBundle = (bundle: typeof bundles[0]) => {
    // In a real app, this would add all items to cart with a bundle ID
    // For this demo, we'll just add items individually
    const cart = JSON.parse(localStorage.getItem('smartmart-cart') || '[]');
    
    let addedCount = 0;
    bundle.items.forEach((product: Product) => {
      const existingItem = cart.find((item: Product & { quantity: number }) => item.id === product.id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({ ...product, quantity: 1 });
      }
      addedCount++;
    });

    localStorage.setItem('smartmart-cart', JSON.stringify(cart));
    
    // Dispatch custom event to update cart count in header (if listening)
    // Or just force a re-render/toast
    toast.success(`${bundle.name} added to cart!`, {
      description: `Added ${addedCount} items. You saved ₹${bundle.savings.toFixed(2)}!`
    });
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header */}
      <div className="bg-card border-b border-border mb-8">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Package className="h-6 w-6 text-accent-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Smart Bundles</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            AI-curated product bundles designed to save you money. 
            These combinations are frequently bought together by other smart shoppers.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-[300px] bg-muted/20 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bundles.map((bundle) => (
              <Card key={bundle.id} className="flex flex-col hover:shadow-lg transition-all duration-300 border-2 hover:border-accent/30 group">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl mb-1">{bundle.name}</CardTitle>
                      <CardDescription>
                        {bundle.items.length} items • Save 15%
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                      <Tag className="h-3 w-3 mr-1" />
                      Save ₹{bundle.savings.toFixed(0)}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 pb-4">
                  {/* Bundle Items Visual */}
                  <div className="flex items-center justify-center gap-2 mb-6 bg-muted/30 p-4 rounded-lg">
                    {bundle.items.map((item, idx) => (
                      <React.Fragment key={item.id}>
                        <div className="relative group/item">
                          <div className="text-4xl hover:scale-110 transition-transform cursor-help" title={item.name}>
                            {item.emoji}
                          </div>
                          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] whitespace-nowrap opacity-0 group-hover/item:opacity-100 transition-opacity bg-popover px-2 py-1 rounded shadow-sm z-10">
                            {item.name}
                          </div>
                        </div>
                        {idx < bundle.items.length - 1 && (
                          <Plus className="h-4 w-4 text-muted-foreground/50" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Why this bundle? */}
                  <div className="bg-accent/5 rounded-lg p-3 text-xs border border-accent/10">
                    <div className="flex items-center gap-1.5 mb-1 text-accent-foreground font-medium">
                      <Sparkles className="h-3 w-3" />
                      <span>Why this bundle?</span>
                    </div>
                    <p className="text-muted-foreground">
                      Customers who buy <span className="font-medium text-foreground">{bundle.rule.antecedent.join(', ')}</span> often buy <span className="font-medium text-foreground">{bundle.rule.consequent.join(', ')}</span> together.
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-muted-foreground">
                      <span title="Probability of buying together">{(bundle.rule.confidence * 100).toFixed(0)}% Match</span>
                      <span className="w-px h-3 bg-border"></span>
                      <span title="Strength of association">{bundle.rule.lift.toFixed(1)}x Stronger</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-0">
                  <div className="w-full space-y-3">
                    <div className="flex items-end justify-between">
                      <div className="text-sm text-muted-foreground line-through">
                        ₹{bundle.originalPrice.toFixed(2)}
                      </div>
                      <div className="text-2xl font-bold text-primary">
                        ₹{bundle.bundlePrice.toFixed(2)}
                      </div>
                    </div>
                    <Button className="w-full" onClick={() => handleAddBundle(bundle)}>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add Bundle to Cart
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductBundles;
