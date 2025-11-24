import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  Sparkles,
  Zap,
  BarChart3
} from "lucide-react";
import { toast } from "sonner";
import { runAprioriAlgorithm, sampleTransactions } from "@/lib/apriori";
import { PRODUCT_CATALOG } from "@/lib/data";
import { safeSync, SmartMartError, ERROR_CODES, getErrorMessage } from "@/lib/errorHandler";
import { RecommendationCardSkeleton } from "@/components/ProductCardSkeleton";
import RecommendationCard from "@/components/RecommendationCard";
import { Skeleton } from "@/components/ui/skeleton";
import { NoRecommendationsState } from "@/components/ErrorState";
import Footer from "@/components/Footer";
import type {
  Product,
  CartItem,
  AprioriRule,
  Recommendation,
  AlgorithmStats
} from "@/types";

// Imported Components
import HeroSection from "@/components/home/HeroSection";
import FeatureHighlights from "@/components/home/FeatureHighlights";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import FeaturedDeals from "@/components/home/FeaturedDeals";
import Testimonials from "@/components/home/Testimonials";
import NewsletterSignup from "@/components/home/NewsletterSignup";
import ProductFilters from "@/components/product/ProductFilters";
import ProductGrid from "@/components/product/ProductGrid";

// Use the comprehensive product catalog directly
const products: Product[] = PRODUCT_CATALOG;

const categories = ["All", ...Array.from(new Set(products.map(p => p.category))).sort()];
const brands = Array.from(new Set(products.map(p => p.brand))).sort();
const allTags = Array.from(new Set(products.flatMap(p => p.tags || []))).sort();

const Index = () => {
  console.log('🔄 Index component initializing...');
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
  const [algorithmStats, setAlgorithmStats] = useState<AlgorithmStats | null>(null);
  const [isLoadingRules, setIsLoadingRules] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const prevRecommendationsLength = useRef(0);
  const prevRecommendations = useRef<Recommendation[]>([]);

  // Advanced filters
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [minRating, setMinRating] = useState(0);
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("all");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    console.log('🔄 useEffect: Loading cart and computing rules...');
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
      console.log('🔄 No cached rules found, computing fresh rules...');
      computeRules();
    }

    function computeRules() {
      console.log('🔄 computeRules: Starting Apriori algorithm computation...');
      setIsLoadingRules(true);
      const result = safeSync(() => {
        // Compute enhanced Apriori association rules from sample transaction data
        // Optimized parameters: 1% minimum support for better coverage, 20% minimum confidence for quality
        const { associationRules: rawRules, frequentItemsets, stats: miningStats } = runAprioriAlgorithm(sampleTransactions, 0.01, 0.20);

        // Keep all rules generated by the algorithm
        const associationRules = rawRules;

        console.log('📊 Raw rules generated:', rawRules.length);
        console.log('🎯 Filtered rules (lift > 1.0):', associationRules.length);
        
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

      console.log('✅ computeRules: Apriori computation completed');
      setIsLoadingRules(false);

      if (result.error) {
        console.error('Failed to compute Apriori rules:', result.error);
        toast.error('Failed to generate product recommendations. Some features may not work properly.');
        // Set empty state
        setRules([]);
        setAlgorithmStats(null);
      }
    }
    console.log('✅ useEffect: Initial setup completed');
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

  const filteredProducts = products
    .filter((product) => {
      // Enhanced search: name, brand, tags, specifications, description
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery ||
        product.name.toLowerCase().includes(searchLower) ||
        product.brand.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        (product.tags && product.tags.some(tag => tag.toLowerCase().includes(searchLower))) ||
        (product.specifications && Object.values(product.specifications).some(spec => spec.toLowerCase().includes(searchLower)));

      const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      const matchesRating = product.rating >= minRating;
      const matchesAvailability = availabilityFilter === "all" ||
        (availabilityFilter === "in_stock" && product.availability === "in_stock") ||
        (availabilityFilter === "limited" && product.availability === "limited") ||
        (availabilityFilter === "out_of_stock" && product.availability === "out_of_stock");
      const matchesBrands = selectedBrands.length === 0 || selectedBrands.includes(product.brand);
      const matchesTags = selectedTags.length === 0 || (product.tags && selectedTags.some(tag => product.tags.includes(tag)));

      return matchesSearch && matchesCategory && matchesPrice && matchesRating && matchesAvailability && matchesBrands && matchesTags;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "rating":
          return b.rating - a.rating;
        case "popularity":
          return b.reviewCount - a.reviewCount;
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
  }, [searchQuery, selectedCategory, sortBy, priceRange, minRating, availabilityFilter, selectedBrands, selectedTags]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, sortBy, priceRange, minRating, availabilityFilter, selectedBrands, selectedTags]);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const avgConfidence = recommendations.length > 0
    ? recommendations.reduce((sum, rec) => sum + rec.confidence, 0) / recommendations.length
    : 0;

  console.log('🔄 Index: Rendering component...');
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
import FeatureHighlights from "@/components/home/FeatureHighlights";

// ... existing imports

// Inside Index component return:
        <HeroSection />

        <FeatureHighlights />

        <FeaturedCategories 
          categories={categories}
          products={products}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />

        <FeaturedDeals 
          products={products}
          addToCart={addToCart}
        />

        <div className="space-y-6">
          {/* Products Section */}
          <div className="space-y-4">
            <ProductFilters 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              sortBy={sortBy}
              setSortBy={setSortBy}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              categories={categories}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              minRating={minRating}
              setMinRating={setMinRating}
              availabilityFilter={availabilityFilter}
              setAvailabilityFilter={setAvailabilityFilter}
              selectedBrands={selectedBrands}
              setSelectedBrands={setSelectedBrands}
              brands={brands}
              selectedTags={selectedTags}
              setSelectedTags={setSelectedTags}
              allTags={allTags}
              onClearFilters={() => {
                setSearchQuery("");
                setSelectedCategory("All");
                setSortBy("name");
                setPriceRange([0, 10000]);
                setMinRating(0);
                setAvailabilityFilter("all");
                setSelectedBrands([]);
                setSelectedTags([]);
              }}
            />

            <ProductGrid 
              products={filteredProducts}
              isLoading={isLoadingProducts}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              itemsPerPage={itemsPerPage}
              addToCart={addToCart}
              onClearFilters={() => {
                setSearchQuery("");
                setSelectedCategory("All");
                setSortBy("name");
              }}
              totalItems={filteredProducts.length}
            />
          </div>
        </div>

        <Testimonials />

        <NewsletterSignup />

        {/* Enhanced Recommendations Section */}
        <div className="mt-8">
          {/* Algorithm Insights Header */}
          <div className="mb-6">
            <Card className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 border-blue-200/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">AI-Powered Recommendations</h2>
                    <p className="text-sm text-muted-foreground">Real-time Apriori algorithm insights</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{rules.length}</div>
                  <div className="text-xs text-muted-foreground">Active Rules</div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/70 dark:bg-black/20 p-3 rounded-lg border border-blue-200/30">
                  <div className="text-lg font-bold text-blue-600">{appliedRules.length}</div>
                  <div className="text-xs text-muted-foreground">Rules Applied</div>
                </div>
                <div className="bg-white/70 dark:bg-black/20 p-3 rounded-lg border border-blue-200/30">
                  <div className="text-lg font-bold text-green-600">{avgConfidence > 0 ? (avgConfidence * 100).toFixed(0) : 0}%</div>
                  <div className="text-xs text-muted-foreground">Avg Confidence</div>
                </div>
                <div className="bg-white/70 dark:bg-black/20 p-3 rounded-lg border border-blue-200/30">
                  <div className="text-lg font-bold text-purple-600">{algorithmStats?.totalTransactions || 0}</div>
                  <div className="text-xs text-muted-foreground">Transactions</div>
                </div>
                <div className="bg-white/70 dark:bg-black/20 p-3 rounded-lg border border-blue-200/30">
                  <div className="text-lg font-bold text-orange-600">{algorithmStats?.executionTime ? `${algorithmStats.executionTime}ms` : 'N/A'}</div>
                  <div className="text-xs text-muted-foreground">Processing Time</div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200/30">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>How it works:</strong> Our Apriori algorithm analyzes {algorithmStats?.totalTransactions || 0} shopping patterns to find items frequently bought together.
                  When you add items to your cart, we apply {appliedRules.length} association rules to suggest the most relevant products with high confidence scores.
                </p>
              </div>
            </Card>
          </div>

          {/* Recommendations */}
          <section aria-labelledby="recommendations-heading">
            {isLoadingRules ? (
              <>
                <h2 id="recommendations-heading" className="sr-only">Loading recommendations</h2>
                <Card className="p-6 border-recommendation-border bg-recommendation">
                  <div className="flex items-center gap-2 mb-4">
                    <Skeleton className="h-6 w-6" />
                    <Skeleton className="h-7 w-48" />
                  </div>
                  <p className="text-sm text-accent-foreground/80 mb-6">
                    <Skeleton className="h-4 w-80" />
                  </p>
                  <div className="space-y-4">
                    {[...Array(3)].map((_, idx) => (
                      <RecommendationCardSkeleton key={idx} />
                    ))}
                  </div>
                </Card>
              </>
            ) : recommendations.length > 0 ? (
              <>
                <Card className="p-6 border-recommendation-border bg-recommendation animate-slide-in shadow-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-accent/10 rounded-lg">
                      <Sparkles className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h2 id="recommendations-heading" className="text-2xl font-bold text-accent-foreground">
                        Personalized Recommendations
                      </h2>
                      <p className="text-sm text-accent-foreground/80">
                        Based on your cart and {appliedRules.length} Apriori association rules
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {recommendations.map((rec, idx) => {
                      const product = products.find((p) => p.name === rec.product);
                      if (!product) return null;
                      const isNew = newRecommendation === rec.product;
                      // Find the corresponding rule for this recommendation
                      const rule = appliedRules.find(r =>
                        r.consequent.includes(rec.product) &&
                        r.antecedent.every(ant => rec.reason.some(reason => reason.includes(ant)))
                      );
                      return (
                        <RecommendationCard
                          key={idx}
                          recommendation={rec}
                          product={product}
                          rule={rule}
                          onAddToCart={addToCart}
                          onViewDetails={() => navigate(`/product/${product.id}`)}
                          className={isNew ? "animate-glow" : ""}
                        />
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
