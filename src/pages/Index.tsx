import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, TrendingUp, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface Product {
  id: number;
  name: string;
  price: number;
  emoji: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface AprioriRule {
  antecedent: string[];
  consequent: string[];
  confidence: number;
  support: number;
}

const products: Product[] = [
  { id: 1, name: "Milk", price: 3.99, emoji: "🥛" },
  { id: 2, name: "Bread", price: 2.49, emoji: "🍞" },
  { id: 3, name: "Eggs", price: 4.29, emoji: "🥚" },
  { id: 4, name: "Butter", price: 5.49, emoji: "🧈" },
  { id: 5, name: "Cheese", price: 6.99, emoji: "🧀" },
  { id: 6, name: "Coffee", price: 8.99, emoji: "☕" },
  { id: 7, name: "Sugar", price: 3.49, emoji: "🧂" },
  { id: 8, name: "Crackers", price: 4.99, emoji: "🍘" },
  { id: 9, name: "Tomatoes", price: 3.79, emoji: "🍅" },
  { id: 10, name: "Pasta", price: 2.99, emoji: "🍝" },
];

const Index = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [rules, setRules] = useState<AprioriRule[]>([]);
  const [recommendations, setRecommendations] = useState<{ product: string; reason: string[] }[]>([]);

  useEffect(() => {
    // Load Apriori rules
    fetch("/rules.json")
      .then((res) => res.json())
      .then((data) => setRules(data))
      .catch((err) => console.error("Failed to load rules:", err));
  }, []);

  useEffect(() => {
    // Generate recommendations based on cart
    if (cart.length === 0 || rules.length === 0) {
      setRecommendations([]);
      return;
    }

    const cartItems = cart.map((item) => item.name);
    const recommendedMap = new Map<string, string[]>();

    rules.forEach((rule) => {
      // Check if all antecedent items are in cart
      const hasAllAntecedents = rule.antecedent.every((item) =>
        cartItems.includes(item)
      );

      if (hasAllAntecedents) {
        rule.consequent.forEach((consequentItem) => {
          // Don't recommend items already in cart
          if (!cartItems.includes(consequentItem)) {
            const reasons = recommendedMap.get(consequentItem) || [];
            reasons.push(...rule.antecedent);
            recommendedMap.set(consequentItem, [...new Set(reasons)]);
          }
        });
      }
    });

    const recommendationsList = Array.from(recommendedMap.entries()).map(
      ([product, reason]) => ({
        product,
        reason,
      })
    );

    setRecommendations(recommendationsList);
  }, [cart, rules]);

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    toast.success(`${product.name} added to cart!`);
  };

  const removeFromCart = (productId: number) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === productId);
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      return prevCart.filter((item) => item.id !== productId);
    });
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🛒</div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">SmartMart</h1>
                <p className="text-sm text-muted-foreground">
                  AI-Powered Shopping Recommendations
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-muted-foreground" />
              {totalItems > 0 && (
                <Badge className="bg-cart-badge text-white">
                  {totalItems}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Products Section */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">Products</h2>
              <p className="text-muted-foreground">
                Add items to your cart to get personalized recommendations
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {products.map((product) => (
                <Card
                  key={product.id}
                  className="p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="text-4xl">{product.emoji}</div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {product.name}
                        </h3>
                        <p className="text-xl font-bold text-primary">
                          ${product.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => addToCart(product)}
                      size="sm"
                      className="shrink-0"
                    >
                      Add
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Cart & Recommendations Section */}
          <div className="space-y-6">
            {/* Shopping Cart */}
            <Card className="p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingCart className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground">
                  Shopping Cart
                </h2>
              </div>

              {cart.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Your cart is empty
                </p>
              ) : (
                <>
                  <div className="space-y-3 mb-4">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-2 p-2 rounded-lg bg-secondary/50"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-2xl">{item.emoji}</span>
                          <div className="flex-1">
                            <p className="font-medium text-sm text-foreground">
                              {item.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ${item.price.toFixed(2)} × {item.quantity}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                        >
                          -
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-foreground">Total:</span>
                      <span className="text-2xl font-bold text-primary">
                        ${cartTotal.toFixed(2)}
                      </span>
                    </div>
                    <Button className="w-full" size="lg">
                      Checkout
                    </Button>
                  </div>
                </>
              )}
            </Card>

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <Card className="p-6 border-recommendation-border bg-recommendation">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-accent-foreground" />
                  <h2 className="text-xl font-bold text-accent-foreground">
                    Recommended For You
                  </h2>
                </div>
                <p className="text-sm text-accent-foreground/80 mb-4">
                  Based on Apriori algorithm analysis
                </p>
                <div className="space-y-3">
                  {recommendations.map((rec, idx) => {
                    const product = products.find((p) => p.name === rec.product);
                    if (!product) return null;
                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-card border border-recommendation-border"
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{product.emoji}</span>
                            <div>
                              <p className="font-semibold text-foreground">
                                {product.name}
                              </p>
                              <p className="text-sm font-bold text-primary">
                                ${product.price.toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => addToCart(product)}
                          >
                            Add
                          </Button>
                        </div>
                        <div className="flex items-start gap-1 text-xs text-muted-foreground">
                          <TrendingUp className="h-3 w-3 mt-0.5 shrink-0" />
                          <span>
                            People who bought{" "}
                            <span className="font-medium text-accent-foreground">
                              {rec.reason.join(", ")}
                            </span>{" "}
                            also bought this
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
