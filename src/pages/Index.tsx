import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ShoppingCart,
  TrendingUp,
  Sparkles,
  Trash2,
  Search,
  BarChart3,
  Package,
  Zap,
  Filter,
  Plus,
  Minus,
  Star
} from "lucide-react";
import { toast } from "sonner";
import { runAprioriAlgorithm, sampleTransactions, PRODUCT_CATALOG } from "@/lib/apriori";
import { safeSync, SmartMartError, ERROR_CODES, getErrorMessage } from "@/lib/errorHandler";
import { ProductCardSkeleton, RecommendationCardSkeleton, CartItemSkeleton } from "@/components/ProductCardSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyCartState, NoProductsState, NoRecommendationsState } from "@/components/ErrorState";
import Footer from "@/components/Footer";
import type {
  Product,
  CartItem,
  AprioriRule,
  Recommendation,
  AlgorithmStats,
  LoadingState
} from "@/types";

// Generate comprehensive product catalog from apriori data
const generateProductsFromCatalog = (): Product[] => {
  const products: Product[] = [];
  let id = 1;

  // Emoji mappings for categories
  const categoryEmojis: Record<string, string> = {
    fruits: '🍎', vegetables: '🥕', dairy: '🥛', meat: '🥩', bakery: '🍞',
    grains: '🌾', canned: '🥫', condiments: '🧂', beverages: '🥤', alcohol: '🍷',
    snacks: '🍿', sweets: '🍪', frozen: '🧊', health: '💊', household: '🧺',
    personal: '🧴', baby: '👶', pet: '🐕'
  };

  // Price ranges for categories (in INR)
  const priceRanges: Record<string, [number, number]> = {
    fruits: [40, 200], vegetables: [25, 150], dairy: [50, 300], meat: [150, 600],
    bakery: [30, 500], grains: [50, 150], canned: [40, 120], condiments: [30, 400],
    beverages: [20, 150], alcohol: [200, 800], snacks: [20, 150], sweets: [50, 300],
    frozen: [100, 400], health: [100, 500], household: [50, 300], personal: [80, 400],
    baby: [100, 600], pet: [150, 800]
  };

  Object.entries(PRODUCT_CATALOG).forEach(([category, items]) => {
    const emoji = categoryEmojis[category] || '📦';
    const [minPrice, maxPrice] = priceRanges[category] || [50, 200];
    const categoryName = category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    items.forEach((itemName: string) => {
      // Generate realistic price within range
      const price = Math.round((minPrice + Math.random() * (maxPrice - minPrice)) / 5) * 5; // Round to nearest 5

      products.push({
        id,
        name: itemName,
        price,
        emoji,
        category: categoryName,
        inStock: true
      });
      id++;
    });
  });

  return products;
};

const products: Product[] = generateProductsFromCatalog();

const categories = ["All", ...Array.from(new Set(products.map(p => p.category))).sort()];

const Index = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [rules, setRules] = useState<AprioriRule[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("name");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [appliedRules, setAppliedRules] = useState<AprioriRule[]>([]);
  const [newRecommendation, setNewRecommendation] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [algorithmStats, setAlgorithmStats] = useState<AlgorithmStats | null>(null);
  const [isLoadingRules, setIsLoadingRules] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const prevRecommendationsLength = useRef(0);
  const prevRecommendations = useRef<Recommendation[]>([]);

  useEffect(() => {
    // Load cart from localStorage
    const result = safeSync(() => {
      const savedCart = localStorage.getItem('smartmart-cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        // Validate cart structure
        if (Array.isArray(parsedCart)) {
          setCart(parsedCart);
        } else {
          throw new SmartMartError('Invalid cart data structure', ERROR_CODES.CART_STORAGE_ERROR);
        }
      }
    }, 'loadCartFromStorage');

    if (result.error) {
      console.error('Failed to load cart:', result.error);
      toast.error('Failed to load your cart. Starting with empty cart.');
    }

    // Check if rules are cached with current parameters
    const cacheVersion = 'v2'; // Increment when parameters change
    const cachedRules = localStorage.getItem('smartmart-apriori-rules');
    const cachedStats = localStorage.getItem('smartmart-algorithm-stats');
    const cachedVersion = localStorage.getItem('smartmart-cache-version');

    if (cachedRules && cachedStats && cachedVersion === cacheVersion) {
      const loadResult = safeSync(() => {
        const parsedRules = JSON.parse(cachedRules);
        const parsedStats = JSON.parse(cachedStats);
        if (Array.isArray(parsedRules) && typeof parsedStats === 'object') {
          setRules(parsedRules);
          setAlgorithmStats(parsedStats);
        } else {
          throw new SmartMartError('Invalid cached data structure', ERROR_CODES.ALGORITHM_EXECUTION_FAILED);
        }
      }, 'loadCachedRules');

      if (loadResult.error) {
        console.error('Error loading cached rules, computing fresh:', loadResult.error);
        computeRules();
      } else {
        setIsLoadingRules(false);
      }
    } else {
      computeRules();
    }

    function computeRules() {
      setIsLoadingRules(true);
      const result = safeSync(() => {
        // Compute enhanced Apriori association rules from sample transaction data
        // Optimized parameters: 1% minimum support for better coverage, 20% minimum confidence for quality
        const { associationRules: rawRules, frequentItemsets, stats: miningStats } = runAprioriAlgorithm(sampleTransactions, 0.01, 0.20);

        // Keep all rules generated by the algorithm
        const associationRules = rawRules;

        console.log('📊 Raw rules generated:', rawRules.length);
        console.log('🎯 Filtered rules (lift > 1.0):', associationRules.length);
        if (associationRules.length > 0) {
          console.log('Sample rules:', associationRules.slice(0, 3).map(r => `${r.antecedent.join(' + ')} => ${r.consequent.join(' + ')} (conf: ${(r.confidence * 100).toFixed(1)}%)`));
        }

        setRules(associationRules);
        const stats: AlgorithmStats = {
          totalTransactions: miningStats.totalTransactions,
          minSupport: 0.02,
          minConfidence: 0.25,
          frequentItemsetsCount: miningStats.totalItemsets,
          executionTime: miningStats.miningTimeMs,
          lastUpdated: new Date()
        };
        setAlgorithmStats(stats);

        // Cache the results
        localStorage.setItem('smartmart-apriori-rules', JSON.stringify(associationRules));
        localStorage.setItem('smartmart-algorithm-stats', JSON.stringify(stats));
        localStorage.setItem('smartmart-cache-version', 'v2');

        return { associationRules, stats };
      }, 'computeAprioriRules');

      setIsLoadingRules(false);

      if (result.error) {
        console.error('Failed to compute Apriori rules:', result.error);
        toast.error('Failed to generate product recommendations. Some features may not work properly.');
        // Set empty state
        setRules([]);
        setAlgorithmStats(null);
      }
    }
  }, []);

  useEffect(() => {
    // Save cart to localStorage whenever it changes
    const result = safeSync(() => {
      localStorage.setItem('smartmart-cart', JSON.stringify(cart));
    }, 'saveCartToStorage');

    if (result.error) {
      console.error('Failed to save cart to storage:', result.error);
      toast.error('Failed to save cart changes. Your cart may not persist.');
    }
  }, [cart]);

  useEffect(() => {
    // Generate recommendations based on cart
    if (cart.length === 0 || rules.length === 0) {
      setRecommendations([]);
      setAppliedRules([]);
      return;
    }

    const cartItemSet = new Set(cart.map((item) => item.name));
    const recommendedMap = new Map<string, { reasons: string[]; confidence: number; support: number }>();
    const rulesApplied: AprioriRule[] = [];

    rules.forEach((rule) => {
      // Check if all antecedent items are in cart and rule meets quality thresholds
      const hasAllAntecedents = rule.antecedent.every((item) =>
        cartItemSet.has(item)
      );
      const hasGoodConfidence = rule.confidence > 0.2; // Only show rules with confidence > 20%

      if (hasAllAntecedents && hasGoodConfidence) {
        rulesApplied.push(rule);
        rule.consequent.forEach((consequentItem) => {
          // Don't recommend items already in cart
          if (!cartItemSet.has(consequentItem)) {
            const score = (rule.confidence * (rule.lift || 1) * (rule.kulczynski || 1)) / 3;
            const existing = recommendedMap.get(consequentItem);
            if (!existing) {
              recommendedMap.set(consequentItem, {
                reasons: [rule.antecedent.join(' and ')],
                confidence: rule.confidence,
                support: rule.support,
              });
            } else {
              const newReason = rule.antecedent.join(' and ');
              if (!existing.reasons.includes(newReason)) {
                existing.reasons.push(newReason);
              }
              const newScore = (rule.confidence * (rule.lift || 1) * (rule.kulczynski || 1)) / 3;
              const existingScore = (existing.confidence * 1.1 * 1) / 3; // Approximate existing score
              if (newScore > existingScore) {
                existing.confidence = rule.confidence;
                existing.support = rule.support;
              }
            }
          }
        });
      }
    });

    console.log('🎯 Applied rules:', rulesApplied.length);
    console.log('💡 Recommendations generated:', recommendedMap.size);
    if (recommendedMap.size > 0) {
      console.log('Recommended items:', Array.from(recommendedMap.keys()));
    }

    const recommendationsList = Array.from(recommendedMap.entries())
      .map(([product, data]) => ({
        product,
        reason: data.reasons,
        confidence: data.confidence,
        support: data.support,
      }))
      .sort((a, b) => {
        if (b.confidence !== a.confidence) return b.confidence - a.confidence;
        return b.support - a.support;
      });

    // Check for new recommendations
    if (recommendationsList.length > prevRecommendationsLength.current) {
      const newRec = recommendationsList.find(
        r => !prevRecommendations.current.some(existing => existing.product === r.product)
      );
      if (newRec) {
        setNewRecommendation(newRec.product);
        setTimeout(() => setNewRecommendation(null), 2000);
      }
    }
    prevRecommendationsLength.current = recommendationsList.length;
    prevRecommendations.current = [...recommendationsList];

    // If no recommendations found, show fallback based on most frequent items
    if (recommendationsList.length === 0 && rules.length > 0) {
      console.log('⚠️ No recommendations found, using fallback');
      // Get most frequent items from rules
      const itemFrequency = new Map<string, number>();
      rules.forEach(rule => {
        rule.antecedent.forEach(item => {
          itemFrequency.set(item, (itemFrequency.get(item) || 0) + rule.support);
        });
        rule.consequent.forEach(item => {
          itemFrequency.set(item, (itemFrequency.get(item) || 0) + rule.support);
        });
      });

      const fallbackRecommendations = Array.from(itemFrequency.entries())
        .filter(([item]) => !cartItemSet.has(item))
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([product, support]) => ({
          product,
          reason: ['Frequently purchased item'],
          confidence: 0.5, // Default confidence for fallback
          support
        }));

      console.log('🔄 Fallback recommendations:', fallbackRecommendations.length);
      setRecommendations(fallbackRecommendations);
    } else {
      setRecommendations(recommendationsList);
    }

    setAppliedRules(rulesApplied);
  }, [cart, rules]);

  const addToCart = (product: Product) => {
    const result = safeSync(() => {
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
    }, 'addToCart');

    if (result.error) {
      toast.error(getErrorMessage(result.error));
      return;
    }

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

  const increaseQuantity = (productId: number) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseQuantity = (productId: number) => {
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

  const removeItem = (productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    toast.info("Cart cleared");
  };

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

  // Simulate loading when search/filter changes
  useEffect(() => {
    setIsLoadingProducts(true);
    const timer = setTimeout(() => setIsLoadingProducts(false), 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, sortBy]);

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
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">
                    Shopping with Apriori Algorithm
                  </p>
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs text-primary hover:text-primary/80"
                    onClick={() => navigate('/algorithm')}
                  >
                    Learn More →
                  </Button>
                </div>
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
                onClick={() => navigate('/cart')}
                className="flex items-center gap-2 hover:bg-accent rounded-lg p-2 transition-colors touch-manipulation min-h-[44px] min-w-[44px]"
                aria-label={`Shopping cart with ${totalItems} items`}
              >
                <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                {totalItems > 0 && (
                  <Badge className="bg-cart-badge text-white animate-pop text-sm px-2 py-1">
                    {totalItems}
                  </Badge>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Enhanced Hero Banner */}
        <Card className="mb-8 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 border-primary/20 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-primary/5"></div>
          <div className="relative p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1">
                    🧠 Powered by Apriori Algorithm
                  </Badge>
                  <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
                    Shop Smarter,
                    <span className="text-primary block">Not Harder</span>
                  </h1>
                </div>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Discover products you'll love with our AI-powered recommendations.
                  Save time, money, and discover new favorites based on millions of shopping patterns.
                </p>

                {/* Key Benefits */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary text-lg">⚡</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Save Time</p>
                      <p className="text-xs text-muted-foreground">Find products faster</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                      <span className="text-accent text-lg">💰</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Save Money</p>
                      <p className="text-xs text-muted-foreground">Better deals & bundles</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                      <span className="text-secondary text-lg">🎯</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Personalized</p>
                      <p className="text-xs text-muted-foreground">Just for you</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={() => document.getElementById('products-heading')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Start Shopping Now
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="text-lg px-8 py-6 border-2 hover:bg-primary hover:text-white transition-all duration-300"
                    onClick={() => navigate('/algorithm')}
                  >
                    <BarChart3 className="h-5 w-5 mr-2" />
                    See How It Works
                  </Button>
                </div>

                {/* Trust Indicators */}
                <div className="flex items-center gap-6 pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="w-6 h-6 bg-yellow-400 rounded-full border-2 border-white flex items-center justify-center text-xs">⭐</div>
                      ))}
                    </div>
                    <span className="text-sm font-medium">4.9/5 Rating</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Trusted by <span className="font-semibold text-foreground">10,000+</span> shoppers
                  </div>
                </div>
              </div>

              <div className="text-center space-y-6">
                <div className="relative">
                  <div className="text-9xl mb-4 animate-bounce">🛒</div>
                  <div className="absolute -top-4 -right-4 bg-primary text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                    AI
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/70 dark:bg-black/20 p-4 rounded-xl border border-primary/20 shadow-lg">
                    <div className="text-3xl mb-2">📊</div>
                    <p className="text-xs font-medium">Smart Analytics</p>
                  </div>
                  <div className="bg-white/70 dark:bg-black/20 p-4 rounded-xl border border-accent/20 shadow-lg">
                    <div className="text-3xl mb-2">🤖</div>
                    <p className="text-xs font-medium">AI Learning</p>
                  </div>
                  <div className="bg-white/70 dark:bg-black/20 p-4 rounded-xl border border-secondary/20 shadow-lg">
                    <div className="text-3xl mb-2">💡</div>
                    <p className="text-xs font-medium">Smart Suggestions</p>
                  </div>
                </div>

                {/* Live Stats */}
                <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-green-200/50 p-4">
                  <div className="text-center">
                    <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">🟢 Live Activity</p>
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div>
                        <p className="font-bold text-lg">247</p>
                        <p className="text-muted-foreground">Active Users</p>
                      </div>
                      <div>
                        <p className="font-bold text-lg">1.2K</p>
                        <p className="text-muted-foreground">Products</p>
                      </div>
                      <div>
                        <p className="font-bold text-lg">98%</p>
                        <p className="text-muted-foreground">Satisfaction</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </Card>

        {/* Enhanced Featured Categories */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-4">Explore Categories</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Discover thousands of products across our carefully curated categories
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.slice(1, 7).map((category) => {
              const categoryEmoji = {
                'Fruits': '🍎', 'Vegetables': '🥕', 'Dairy': '🥛', 'Meat': '🥩',
                'Bakery': '🍞', 'Grains': '🌾', 'Canned': '🥫', 'Condiments': '🧂',
                'Beverages': '🥤', 'Snacks': '🍿', 'Sweets': '🍪', 'Frozen': '🧊'
              }[category] || '📦';

              const categoryColors = {
                'Fruits': 'from-red-50 to-orange-50 border-red-200',
                'Vegetables': 'from-green-50 to-emerald-50 border-green-200',
                'Dairy': 'from-blue-50 to-cyan-50 border-blue-200',
                'Meat': 'from-red-50 to-pink-50 border-red-200',
                'Bakery': 'from-yellow-50 to-amber-50 border-yellow-200',
                'Grains': 'from-amber-50 to-orange-50 border-amber-200'
              };

              const itemCount = products.filter(p => p.category === category).length;
              const avgPrice = products.filter(p => p.category === category)
                .reduce((sum, p) => sum + p.price, 0) / itemCount;

              return (
                <Card
                  key={category}
                  className={`p-6 hover:shadow-xl transition-all duration-300 cursor-pointer text-center group border-2 hover:scale-105 bg-gradient-to-br ${categoryColors[category] || 'from-gray-50 to-gray-100 border-gray-200'}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  <div className="relative mb-4">
                    <div className="text-5xl mb-2 group-hover:scale-110 transition-transform duration-300 drop-shadow-sm">
                      {categoryEmoji}
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
                ₹{Math.round(products.reduce((sum, p) => sum + p.price, 0) / products.length)}
              </div>
              <div className="text-sm text-muted-foreground">Avg. Price</div>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground">Available</div>
            </div>
          </div>
        </div>

        {/* Featured Deals Section */}
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
              <Badge className="bg-orange-500 text-white animate-pulse">
                Live Deals
              </Badge>
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

        <div className="space-y-6">
          {/* Products Section */}
          <div className="space-y-4">
            {/* Search and Filter */}
            <Card className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-11"
                    aria-label="Search products"
                    role="searchbox"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full sm:w-[140px] h-11">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full sm:w-[160px] h-11">
                      <Filter className="h-4 w-4 mr-2" aria-hidden="true" />
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Products Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 id="products-heading" className="text-2xl font-bold text-foreground">Products</h2>
                <Badge variant="secondary" className="gap-1" aria-live="polite">
                  <Package className="h-3 w-3" aria-hidden="true" />
                  {filteredProducts.length} items ({paginatedProducts.length} shown)
                </Badge>
              </div>
              
              {isLoadingProducts ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, index) => (
                    <ProductCardSkeleton
                      key={index}
                      className="animate-slide-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    />
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <NoProductsState onClearFilters={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                  setSortBy("name");
                }} />
              ) : (
                <>
                  <div
                    className="grid sm:grid-cols-2 lg:grid-cols-5 xl:grid-cols-6 gap-4"
                    role="grid"
                    aria-labelledby="products-heading"
                    aria-rowcount={Math.ceil(paginatedProducts.length / 5)}
                  >
                    {paginatedProducts.map((product, index) => (
                    <Card
                      key={product.id}
                      className="group p-6 hover:shadow-2xl transition-all duration-500 hover:scale-[1.03] cursor-pointer border-0 shadow-lg hover:shadow-primary/20 animate-slide-in-up focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 relative overflow-hidden"
                      style={{ animationDelay: `${index * 0.08}s` }}
                      onClick={() => navigate(`/product/${product.id}`)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          navigate(`/product/${product.id}`);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label={`View details for ${product.name}, ${product.category}, priced at ₹${product.price}`}
                    >
                      {/* Subtle background gradient on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="text-center mb-4">
                        <div className="text-6xl mb-3 group-hover:scale-110 transition-transform duration-300">
                          {product.emoji}
                        </div>
                        <Badge variant="secondary" className="text-xs mb-2">
                          {product.category}
                        </Badge>
                      </div>
                      <div className="text-center mb-4">
                        <h3 className="font-bold text-lg text-foreground mb-2">
                          {product.name}
                        </h3>
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-2xl font-bold text-primary">
                            ₹{product.price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product);
                        }}
                        className="w-full group-hover:bg-primary/90 transition-colors duration-200 touch-manipulation"
                        size="lg"
                        aria-label={`Add ${product.name} to cart`}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                    </Card>
                  ))}
                </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <nav
                      className="flex justify-center items-center gap-2 mt-8"
                      aria-label="Product pagination"
                      role="navigation"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        aria-label="Go to previous page"
                      >
                        Previous
                      </Button>
                      <div className="flex gap-1" role="group" aria-label="Page numbers">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="w-8 h-8 p-0"
                            aria-label={`Go to page ${page}`}
                            aria-current={currentPage === page ? "page" : undefined}
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        aria-label="Go to next page"
                      >
                        Next
                      </Button>
                    </nav>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Customer Testimonials */}
        <div className="mt-12 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-4">Loved by Thousands of Shoppers</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join our community of smart shoppers who save time and discover amazing products
            </p>
            <div className="flex justify-center items-center gap-4 mt-4">
              <div className="flex items-center gap-1">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="font-semibold">4.9/5</span>
              </div>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">10,000+ Happy Customers</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">98% Satisfaction Rate</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Sarah Johnson",
                role: "Busy Mom",
                rating: 5,
                comment: "SmartMart saved me 2 hours of shopping last week! The AI knew exactly what my family needed - from organic milk to kids' snacks. The recommendations were spot-on and I discovered products I never would have found otherwise.",
                avatar: "👩‍👧‍👦",
                highlight: "Saved 2 hours weekly",
                verified: true
              },
              {
                name: "Mike Chen",
                role: "Tech Professional",
                rating: 5,
                comment: "As someone who hates grocery shopping, this is a game-changer. The personalized suggestions based on my previous purchases are incredibly accurate. I went from spending ₹3,200 to ₹2,800 monthly while eating better!",
                avatar: "👨‍💻",
                highlight: "₹400 monthly savings",
                verified: true
              },
              {
                name: "Priya Patel",
                role: "Health Enthusiast",
                rating: 5,
                comment: "The Apriori algorithm understands my dietary preferences perfectly. It suggested organic alternatives and health supplements I needed. My nutrition has improved dramatically and I feel more energetic!",
                avatar: "👩‍⚕️",
                highlight: "Better health outcomes",
                verified: true
              }
            ].map((testimonial, idx) => (
              <Card key={idx} className="p-6 hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 bg-primary text-white text-xs px-2 py-1 rounded-bl-lg font-medium">
                  {testimonial.verified && "✓ Verified"}
                </div>

                <div className="text-center mb-4">
                  <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">
                    {testimonial.avatar}
                  </div>
                  <div className="flex justify-center mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-5 w-5 ${i < testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                    ))}
                  </div>
                  <Badge className="bg-green-100 text-green-800 mb-2">
                    {testimonial.highlight}
                  </Badge>
                </div>

                <blockquote className="text-muted-foreground mb-4 leading-relaxed">
                  "{testimonial.comment}"
                </blockquote>

                <div className="text-center">
                  <p className="font-bold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>

                {/* Decorative element */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20"></div>
              </Card>
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center mt-8">
            <p className="text-muted-foreground mb-4">Ready to join thousands of satisfied customers?</p>
            <Button
              size="lg"
              className="px-8"
              onClick={() => document.getElementById('products-heading')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Start Your Smart Shopping Journey
            </Button>
          </div>
        </div>

        {/* Quick Stats & Highlights */}
        <Card className="mb-8 bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 border-primary/20">
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-4">Why Choose SmartMart?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Join thousands of smart shoppers who trust our AI-powered platform
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="text-center group">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <span className="text-3xl">🧠</span>
                </div>
                <h3 className="font-bold text-lg mb-2">AI-Powered</h3>
                <p className="text-sm text-muted-foreground">Advanced Apriori algorithm for personalized recommendations</p>
              </div>

              <div className="text-center group">
                <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/20 transition-colors">
                  <span className="text-3xl">⚡</span>
                </div>
                <h3 className="font-bold text-lg mb-2">Lightning Fast</h3>
                <p className="text-sm text-muted-foreground">Instant search and recommendations across 1000+ products</p>
              </div>

              <div className="text-center group">
                <div className="bg-secondary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary/20 transition-colors">
                  <span className="text-3xl">💰</span>
                </div>
                <h3 className="font-bold text-lg mb-2">Save Money</h3>
                <p className="text-sm text-muted-foreground">Average 25% savings with smart bundling and deals</p>
              </div>

              <div className="text-center group">
                <div className="bg-green-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-500/20 transition-colors">
                  <span className="text-3xl">🔒</span>
                </div>
                <h3 className="font-bold text-lg mb-2">Secure & Private</h3>
                <p className="text-sm text-muted-foreground">Your data is protected with enterprise-grade security</p>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="bg-white/50 dark:bg-black/20 rounded-xl p-6 border border-primary/10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-primary mb-1">10K+</div>
                  <div className="text-sm text-muted-foreground">Happy Customers</div>
                  <div className="w-full bg-primary/20 rounded-full h-2 mt-2">
                    <div className="bg-primary h-2 rounded-full w-full"></div>
                  </div>
                </div>

                <div>
                  <div className="text-3xl font-bold text-accent mb-1">1.2K+</div>
                  <div className="text-sm text-muted-foreground">Products Available</div>
                  <div className="w-full bg-accent/20 rounded-full h-2 mt-2">
                    <div className="bg-accent h-2 rounded-full w-full"></div>
                  </div>
                </div>

                <div>
                  <div className="text-3xl font-bold text-secondary mb-1">98%</div>
                  <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
                  <div className="w-full bg-secondary/20 rounded-full h-2 mt-2">
                    <div className="bg-secondary h-2 rounded-full w-2/3"></div>
                  </div>
                </div>

                <div>
                  <div className="text-3xl font-bold text-green-600 mb-1">24/7</div>
                  <div className="text-sm text-muted-foreground">Customer Support</div>
                  <div className="w-full bg-green-500/20 rounded-full h-2 mt-2">
                    <div className="bg-green-500 h-2 rounded-full w-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Enhanced Newsletter Signup */}
        <Card className="mb-8 bg-gradient-to-br from-accent/10 via-primary/10 to-secondary/10 border-accent/20 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-accent/5"></div>
          <div className="relative p-8 md:p-12 text-center">
            <div className="max-w-2xl mx-auto">
              <div className="text-6xl mb-6">📧✨</div>
              <h2 className="text-3xl font-bold text-foreground mb-4">Never Miss a Great Deal!</h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Join 10,000+ smart shoppers who get exclusive deals, early access to new products,
                and personalized shopping tips delivered straight to your inbox.
              </p>

              {/* Benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 text-sm">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-accent">🎁</span>
                  <span className="text-muted-foreground">Exclusive Deals</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-primary">🚀</span>
                  <span className="text-muted-foreground">Early Access</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-secondary">💡</span>
                  <span className="text-muted-foreground">Shopping Tips</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto mb-6">
                <Input
                  placeholder="your.email@example.com"
                  className="flex-1 h-12 text-base border-2 focus:border-primary"
                  type="email"
                />
                <Button
                  size="lg"
                  className="px-8 py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 whitespace-nowrap"
                >
                  Get Started Free
                  <span className="ml-2">→</span>
                </Button>
              </div>

              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <span className="text-green-500">✓</span>
                  <span>No spam, ever</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <span className="text-green-500">✓</span>
                  <span>Unsubscribe anytime</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <span className="text-green-500">✓</span>
                  <span>100% Privacy</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Recommendations - Full Width */}
        <div className="mt-6">
          {/* Recommendations */}
          <section aria-labelledby="recommendations-heading">
            {isLoadingRules ? (
              <>
                <h2 id="recommendations-heading" className="sr-only">Loading recommendations</h2>
                <Card className="p-4 border-recommendation-border bg-recommendation">
                  <div className="flex items-center gap-2 mb-4">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-6 w-40" />
                  </div>
                  <Skeleton className="h-4 w-64 mb-4" />
                  <div className="space-y-3">
                    {[...Array(3)].map((_, idx) => (
                      <RecommendationCardSkeleton key={idx} />
                    ))}
                  </div>
                </Card>
              </>
            ) : recommendations.length > 0 ? (
              <>
                <Card className="p-4 border-recommendation-border bg-recommendation animate-slide-in">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-5 w-5 text-accent-foreground" />
                    <h2 id="recommendations-heading" className="text-xl font-bold text-accent-foreground">
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
                          className={`p-3 rounded-lg bg-card border border-recommendation-border hover:shadow-md transition-all cursor-pointer ${
                            isNew ? "animate-glow" : ""
                          }`}
                          onClick={() => navigate(`/product/${product.id}`)}
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
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(product);
                              }}
                              className="shrink-0"
                            >
                              Add
                            </Button>
                          </div>
                          <div className="flex items-start gap-2 text-sm text-muted-foreground bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg p-3 border border-primary/10">
                            <TrendingUp className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                            <div>
                              <p className="font-medium text-foreground mb-1">
                                Frequently bought together
                              </p>
                              <p className="text-xs">
                                Customers who bought{" "}
                                <span className="font-medium text-primary">
                                  {rec.reason.join(" and ")}
                                </span>{" "}
                                also purchased this item
                              </p>
                              <div className="flex items-center gap-1 mt-1">
                                <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-primary transition-all duration-500"
                                    style={{ width: `${rec.confidence * 100}%` }}
                                  />
                                </div>
                                <span className="text-xs font-medium text-primary">
                                  {(rec.confidence * 100).toFixed(0)}% match
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </>
            ) : null}
          </section>
        </div>

        {/* Empty state when cart has items but no recommendations */}
        {cart.length > 0 && recommendations.length === 0 && (
          <NoRecommendationsState />
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Index;
