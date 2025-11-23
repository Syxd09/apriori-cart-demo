import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  ShoppingCart, 
  TrendingUp, 
  Sparkles, 
  Trash2, 
  Search,
  BarChart3,
  Package,
  Zap,
  Filter
} from "lucide-react";
import { toast } from "sonner";

interface Product {
  id: number;
  name: string;
  price: number;
  emoji: string;
  category: string;
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

interface Recommendation {
  product: string;
  reason: string[];
  confidence: number;
}

const products: Product[] = [
  { id: 1, name: "Milk", price: 100, emoji: "🥛", category: "Dairy" },
  { id: 2, name: "Bread", price: 50, emoji: "🍞", category: "Bakery" },
  { id: 3, name: "Eggs", price: 59, emoji: "🥚", category: "Dairy" },
  { id: 4, name: "Butter", price: 179, emoji: "🧈", category: "Dairy" },
  { id: 5, name: "Cheese", price: 299, emoji: "🧀", category: "Dairy" },
  { id: 6, name: "Coffee", price: 49, emoji: "☕", category: "Beverages" },
  { id: 7, name: "Sugar", price: 35, emoji: "🧂", category: "Pantry" },
  { id: 8, name: "Crackers", price: 55, emoji: "🍘", category: "Snacks" },
  { id: 9, name: "Tomatoes", price: 45, emoji: "🍅", category: "Produce" },
  { id: 10, name: "Pasta", price: 69, emoji: "🍝", category: "Pantry" },
];

const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];

const Index = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [rules, setRules] = useState<AprioriRule[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [appliedRules, setAppliedRules] = useState<AprioriRule[]>([]);
  const [newRecommendation, setNewRecommendation] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

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
      setAppliedRules([]);
      return;
    }

    const cartItems = cart.map((item) => item.name);
    const recommendedMap = new Map<string, { reasons: string[]; confidence: number }>();
    const rulesApplied: AprioriRule[] = [];

    rules.forEach((rule) => {
      // Check if all antecedent items are in cart
      const hasAllAntecedents = rule.antecedent.every((item) =>
        cartItems.includes(item)
      );

      if (hasAllAntecedents) {
        rulesApplied.push(rule);
        rule.consequent.forEach((consequentItem) => {
          // Don't recommend items already in cart
          if (!cartItems.includes(consequentItem)) {
            const existing = recommendedMap.get(consequentItem);
            if (!existing || rule.confidence > existing.confidence) {
              recommendedMap.set(consequentItem, {
                reasons: rule.antecedent,
                confidence: rule.confidence,
              });
            }
          }
        });
      }
    });

    const recommendationsList = Array.from(recommendedMap.entries())
      .map(([product, data]) => ({
        product,
        reason: data.reasons,
        confidence: data.confidence,
      }))
      .sort((a, b) => b.confidence - a.confidence);

    // Check for new recommendations
    if (recommendationsList.length > recommendations.length) {
      const newRec = recommendationsList.find(
        r => !recommendations.some(existing => existing.product === r.product)
      );
      if (newRec) {
        setNewRecommendation(newRec.product);
        setTimeout(() => setNewRecommendation(null), 2000);
      }
    }

    setRecommendations(recommendationsList);
    setAppliedRules(rulesApplied);
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
    toast.success(`${product.name} added to cart!`, {
      description: "Check recommendations for related items",
    });
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

  const clearCart = () => {
    setCart([]);
    toast.info("Cart cleared");
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const avgConfidence = recommendations.length > 0
    ? recommendations.reduce((sum, rec) => sum + rec.confidence, 0) / recommendations.length
    : 0;

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
                  Shopping with Apriori Algorithm
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Stats badges */}
              {appliedRules.length > 0 && (
                <div className="hidden sm:flex items-center gap-2">
                  <Badge variant="outline" className="gap-1">
                    <Zap className="h-3 w-3" />
                    {appliedRules.length} {appliedRules.length === 1 ? 'Rule' : 'Rules'} Active
                  </Badge>
                </div>
              )}
              <button
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="flex items-center gap-2 hover:bg-accent rounded p-1 transition-colors"
              >
                <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                {totalItems > 0 && (
                  <Badge className="bg-cart-badge text-white animate-pop">
                    {totalItems}
                  </Badge>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Products Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search and Filter */}
            <Card className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className="whitespace-nowrap"
                    >
                      {category === "All" && <Filter className="h-3 w-3 mr-1" />}
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Products Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-foreground">Products</h2>
                <Badge variant="secondary" className="gap-1">
                  <Package className="h-3 w-3" />
                  {filteredProducts.length} items
                </Badge>
              </div>
              
              {filteredProducts.length === 0 ? (
                <Card className="p-12 text-center">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold mb-2">No products found</h3>
                  <p className="text-muted-foreground">Try a different search or category</p>
                </Card>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {filteredProducts.map((product) => (
                    <Card
                      key={product.id}
                      className="p-4 hover:shadow-lg transition-all hover:scale-[1.02]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="text-4xl">{product.emoji}</div>
                          <div>
                            <h3 className="font-semibold text-foreground">
                              {product.name}
                            </h3>
                            <Badge variant="secondary" className="text-xs mb-1">
                              {product.category}
                            </Badge>
                            <p className="text-xl font-bold text-primary">
                              ₹{product.price.toFixed(2)}
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
              )}
            </div>
          </div>

          {/* Cart & Recommendations Section */}
          <div className="space-y-6">
            {/* Algorithm Statistics */}
            {appliedRules.length > 0 && (
              <Card className="p-6 bg-gradient-to-br from-info/10 to-primary/5 border-info/20 animate-slide-in">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="h-5 w-5 text-info" />
                  <h2 className="text-lg font-bold text-foreground">
                    Algorithm Insights
                  </h2>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Active Rules</span>
                      <span className="font-semibold">{appliedRules.length}</span>
                    </div>
                    <Progress value={(appliedRules.length / rules.length) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Avg Confidence</span>
                      <span className="font-semibold">{(avgConfidence * 100).toFixed(0)}%</span>
                    </div>
                    <Progress value={avgConfidence * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Recommendations</span>
                      <span className="font-semibold">{recommendations.length}</span>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Shopping Cart */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isCartOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <Card className="p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold text-foreground">
                    Shopping Cart
                  </h2>
                </div>
                {cart.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearCart}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🛒</div>
                  <p className="text-muted-foreground">Your cart is empty</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Add items to see AI recommendations!
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-2 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors animate-slide-in"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-2xl">{item.emoji}</span>
                          <div className="flex-1">
                            <p className="font-medium text-sm text-foreground">
                              {item.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ₹{item.price.toFixed(2)} × {item.quantity}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                          >
                            -
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span className="font-semibold">₹{cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg">
                      <span className="font-semibold text-foreground">Total:</span>
                      <span className="text-2xl font-bold text-primary">
                        ₹{cartTotal.toFixed(2)}
                      </span>
                    </div>
                    <Button className="w-full" size="lg">
                      Proceed to Checkout
                    </Button>
                  </div>
                </>
              )}
            </Card>
           </div>

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <Card className="p-6 border-recommendation-border bg-recommendation animate-slide-in">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-accent-foreground" />
                  <h2 className="text-xl font-bold text-accent-foreground">
                    Recommended For You
                  </h2>
                </div>
                <p className="text-sm text-accent-foreground/80 mb-4">
                  Based on Apriori association rule mining
                </p>
                <div className="space-y-3">
                  {recommendations.map((rec, idx) => {
                    const product = products.find((p) => p.name === rec.product);
                    if (!product) return null;
                    const isNew = newRecommendation === rec.product;
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg bg-card border border-recommendation-border hover:shadow-md transition-all ${
                          isNew ? "animate-glow" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-2xl">{product.emoji}</span>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-foreground">
                                  {product.name}
                                </p>
                                <Badge 
                                  variant="secondary" 
                                  className="text-xs bg-success/10 text-success border-success/20"
                                >
                                  {(rec.confidence * 100).toFixed(0)}%
                                </Badge>
                              </div>
                              <p className="text-sm font-bold text-primary">
                                ₹{product.price.toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => addToCart(product)}
                            className="shrink-0"
                          >
                            Add
                          </Button>
                        </div>
                        <div className="flex items-start gap-1 text-xs text-muted-foreground bg-muted/50 rounded p-2">
                          <TrendingUp className="h-3 w-3 mt-0.5 shrink-0 text-primary" />
                          <span>
                            Customers who bought{" "}
                            <span className="font-medium text-accent-foreground">
                              {rec.reason.join(", ")}
                            </span>{" "}
                            also bought this ({(rec.confidence * 100).toFixed(0)}% confidence)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Empty state when cart has items but no recommendations */}
            {cart.length > 0 && recommendations.length === 0 && (
              <Card className="p-6 text-center">
                <div className="text-4xl mb-3">💡</div>
                <h3 className="font-semibold mb-2">No recommendations yet</h3>
                <p className="text-sm text-muted-foreground">
                  Add more items to discover related products!
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
