import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  ShoppingCart,
  TrendingUp,
  Sparkles,
  ArrowLeft,
  Plus,
  Minus,
  Star,
  Package,
  Truck,
  Shield,
  RotateCcw
} from "lucide-react";
import { toast } from "sonner";
import { runAprioriAlgorithm, sampleTransactions, PRODUCT_CATALOG } from "@/lib/apriori";
import { NotFoundErrorState, EmptyCartState } from "@/components/ErrorState";
import Footer from "@/components/Footer";
import type {
  Product,
  CartItem,
  AprioriRule,
  Recommendation
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

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [rules, setRules] = useState<AprioriRule[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [quantity, setQuantity] = useState(1);

  const productId = parseInt(id || "0");
  const product = products.find(p => p.id === productId);

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('smartmart-cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }

    // Track recently viewed product
    if (product) {
      const recentlyViewedKey = 'smartmart-recently-viewed';
      const maxRecentlyViewed = 10;

      try {
        const viewedData = localStorage.getItem(recentlyViewedKey);
        let recentlyViewed: Array<{ id: number; name: string; viewedAt: string }> = [];

        if (viewedData) {
          recentlyViewed = JSON.parse(viewedData);
        }

        // Remove if already exists (to avoid duplicates)
        recentlyViewed = recentlyViewed.filter(item => item.id !== product.id);

        // Add current product to the beginning
        recentlyViewed.unshift({
          id: product.id,
          name: product.name,
          viewedAt: new Date().toISOString()
        });

        // Keep only the last 10 items
        if (recentlyViewed.length > maxRecentlyViewed) {
          recentlyViewed = recentlyViewed.slice(0, maxRecentlyViewed);
        }

        localStorage.setItem(recentlyViewedKey, JSON.stringify(recentlyViewed));
      } catch (error) {
        console.error('Error tracking recently viewed product:', error);
      }
    }

    // Check if rules are cached with current parameters
    const cacheVersion = 'v2'; // Increment when parameters change
    const cachedRules = localStorage.getItem('smartmart-apriori-rules');
    const cachedVersion = localStorage.getItem('smartmart-cache-version');

    if (cachedRules && cachedVersion === cacheVersion) {
      try {
        setRules(JSON.parse(cachedRules));
      } catch (error) {
        console.error('Error loading cached rules:', error);
        // Fall back to computing
        computeRules();
      }
    } else {
      computeRules();
    }

    function computeRules() {
      // Compute Apriori association rules with optimized parameters
      const { associationRules: rawRules } = runAprioriAlgorithm(sampleTransactions, 0.01, 0.20);
      // Keep all rules generated by the algorithm
      const associationRules = rawRules;

      console.log('📊 Raw rules generated:', rawRules.length);
      console.log('🎯 Filtered rules (lift > 1.0):', associationRules.length);
      if (associationRules.length > 0) {
        console.log('Sample rules:', associationRules.slice(0, 3).map(r => `${r.antecedent.join(' + ')} => ${r.consequent.join(' + ')} (conf: ${(r.confidence * 100).toFixed(1)}%)`));
      }
      setRules(associationRules);
      // Cache the results
      localStorage.setItem('smartmart-apriori-rules', JSON.stringify(associationRules));
      localStorage.setItem('smartmart-cache-version', 'v2');
    }
  }, [product]);

  useEffect(() => {
    // Save cart to localStorage whenever it changes
    localStorage.setItem('smartmart-cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    // Generate enhanced recommendations based on cart and current product
    if (rules.length === 0) return;

    const cartItemSet = new Set(cart.map((item) => item.name));
    // Include current product in consideration for recommendations
    if (product) {
      cartItemSet.add(product.name);
    }

    const recommendedMap = new Map<string, {
      reasons: string[];
      confidence: number;
      support: number;
      lift: number;
      kulczynski: number;
      score: number;
      ruleCount: number;
    }>();

    rules.forEach((rule) => {
      const hasAllAntecedents = rule.antecedent.every((item) =>
        cartItemSet.has(item)
      );

      // Enhanced filtering: higher thresholds for better quality recommendations
      const hasGoodConfidence = rule.confidence > 0.3; // Increased from 0.2
      const hasGoodLift = (rule.lift || 1) > 1.2; // Only rules with meaningful lift
      const hasGoodSupport = rule.support > 0.01; // Minimum support threshold

      if (hasAllAntecedents && hasGoodConfidence && hasGoodLift && hasGoodSupport) {
        rule.consequent.forEach((consequentItem) => {
          // Don't recommend items already in cart or current product
          if (!cartItemSet.has(consequentItem) && consequentItem !== product?.name) {
            const existing = recommendedMap.get(consequentItem);
            const ruleScore = (rule.confidence * (rule.lift || 1) * (rule.kulczynski || 1)) / 3;

            if (!existing) {
              recommendedMap.set(consequentItem, {
                reasons: [`${rule.antecedent.join(' + ')} → ${consequentItem}`],
                confidence: rule.confidence,
                support: rule.support,
                lift: rule.lift || 1,
                kulczynski: rule.kulczynski || 1,
                score: ruleScore,
                ruleCount: 1,
              });
            } else {
              const newReason = `${rule.antecedent.join(' + ')} → ${consequentItem}`;
              if (!existing.reasons.includes(newReason)) {
                existing.reasons.push(newReason);
              }

              // Update with better metrics if this rule is stronger
              if (ruleScore > existing.score) {
                existing.confidence = rule.confidence;
                existing.support = rule.support;
                existing.lift = rule.lift || 1;
                existing.kulczynski = rule.kulczynski || 1;
                existing.score = ruleScore;
              }
              existing.ruleCount += 1;
            }
          }
        });
      }
    });

    console.log('🎯 Applied enhanced rules:', recommendedMap.size > 0 ? 'Some rules applied' : 'No rules applied');
    console.log('💡 Enhanced recommendations generated:', recommendedMap.size);
    if (recommendedMap.size > 0) {
      console.log('Recommended items:', Array.from(recommendedMap.keys()));
    }

    const recommendationsList = Array.from(recommendedMap.entries())
      .map(([productName, data]) => ({
        product: productName,
        reason: data.reasons,
        confidence: data.confidence,
        support: data.support,
        score: data.score,
        ruleCount: data.ruleCount,
        lift: data.lift,
      }))
      .sort((a, b) => {
        // Enhanced ranking: prioritize score, then confidence, then support
        if (Math.abs(b.score - a.score) > 0.01) return b.score - a.score;
        if (b.confidence !== a.confidence) return b.confidence - a.confidence;
        return b.support - a.support;
      })
      .slice(0, 6); // Limit to 6 recommendations

    // Enhanced fallback: use category-based recommendations when no rules apply
    if (recommendationsList.length === 0 && rules.length > 0) {
      console.log('⚠️ No recommendations found, using enhanced fallback');

      // Get items from same category as current product
      const currentCategory = product?.category;
      const categoryItems = products.filter(p =>
        p.category === currentCategory && p.id !== product?.id && !cartItemSet.has(p.name)
      );

      if (categoryItems.length > 0) {
        const categoryRecommendations = categoryItems
          .slice(0, 6)
          .map(catProduct => ({
            product: catProduct.name,
            reason: [`Similar category: ${currentCategory}`],
            confidence: 0.4, // Moderate confidence for category-based
            support: 0.05, // Default support
            score: 0.3, // Lower score than rule-based
            ruleCount: 1,
            lift: 1.0,
          }));

        console.log('🏷️ Category-based recommendations:', categoryRecommendations.length);
        setRecommendations(categoryRecommendations);
      } else {
        // Final fallback to most frequent items
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
          .filter(([item]) => !cartItemSet.has(item) && item !== product?.name)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([productName, support]) => ({
            product: productName,
            reason: ['Frequently purchased item'],
            confidence: 0.3, // Lower confidence for fallback
            support,
            score: 0.2, // Lowest score
            ruleCount: 1,
            lift: 1.0,
          }));

        console.log('🔄 Frequency-based fallback recommendations:', fallbackRecommendations.length);
        setRecommendations(fallbackRecommendations);
      }
    } else {
      setRecommendations(recommendationsList);
    }
  }, [cart, rules, product]);

  const addToCart = (productToAdd: Product, qty: number = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === productToAdd.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === productToAdd.id
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      return [...prevCart, { ...productToAdd, quantity: qty }];
    });

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0) + qty;
    const totalValue = (cart.reduce((sum, item) => sum + item.price * item.quantity, 0) + productToAdd.price * qty).toFixed(2);

    toast.success(`${productToAdd.name} added to cart!`, {
      description: `${qty} ${qty === 1 ? 'item' : 'items'} added • Cart: ${totalItems} items • ₹${totalValue}`,
      action: {
        label: "View Cart",
        onClick: () => navigate('/cart'),
      },
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

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <NotFoundErrorState onGoHome={() => navigate('/')} />
      </div>
    );
  }

  const cartItem = cart.find(item => item.id === product.id);
  const isInCart = !!cartItem;

  const shareProduct = async (platform: string) => {
    const productUrl = window.location.href;
    const productTitle = `${product.name} - SmartMart`;
    const productDescription = `Check out this ${product.category.toLowerCase()}: ${product.name} for ₹${product.price.toFixed(2)}`;

    try {
      if (platform === 'copy') {
        await navigator.clipboard.writeText(productUrl);
        toast.success("Link copied to clipboard!", {
          description: "Share this link with your friends",
        });
        return;
      }

      // Try Web Share API first (mobile-friendly)
      if (navigator.share && platform === 'native') {
        await navigator.share({
          title: productTitle,
          text: productDescription,
          url: productUrl,
        });
        toast.success("Shared successfully!");
        return;
      }

      // Fallback to URL construction for specific platforms
      let shareUrl = '';

      switch (platform) {
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}&quote=${encodeURIComponent(productDescription)}`;
          break;
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(productDescription)}&url=${encodeURIComponent(productUrl)}`;
          break;
        case 'instagram':
          // Instagram doesn't support direct sharing via URL, show message
          toast.info("Instagram sharing", {
            description: "Copy the link and share manually in Instagram",
          });
          await navigator.clipboard.writeText(productUrl);
          return;
        default:
          throw new Error('Unsupported platform');
      }

      // Open share URL in new window
      window.open(shareUrl, '_blank', 'width=600,height=400');
      toast.success(`Opening ${platform}...`);

    } catch (error) {
      console.error('Sharing failed:', error);

      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(productUrl);
        toast.success("Link copied to clipboard", {
          description: "Sharing failed, but you can paste the link manually",
        });
      } catch (clipboardError) {
        toast.error("Sharing failed", {
          description: "Please copy the URL manually",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">SmartMart</h1>
                <p className="text-sm text-muted-foreground">
                  Product Details
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => navigate('/')}>
                Continue Shopping
              </Button>
              <button
                onClick={() => navigate('/cart')}
                className="flex items-center gap-2 hover:bg-accent rounded p-1 transition-colors"
              >
                <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                {cart.length > 0 && (
                  <Badge className="bg-cart-badge text-white">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </Badge>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Product Details */}
          <div className="space-y-6">
            {/* Breadcrumb */}
            <nav className="text-sm text-muted-foreground">
              <span>Home</span> / <span>{product.category}</span> / <span className="text-foreground font-medium">{product.name}</span>
            </nav>

            {/* Product Info */}
            <Card className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Product Image Gallery */}
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-9xl mb-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 border-2 border-primary/20">
                      {product.emoji}
                    </div>
                    <Badge variant="secondary" className="text-lg px-4 py-2">
                      {product.category}
                    </Badge>
                  </div>
                  {/* Image Thumbnails (mock) */}
                  <div className="flex justify-center gap-2">
                    <button className="w-16 h-16 rounded-lg border-2 border-primary bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-2xl">
                      {product.emoji}
                    </button>
                    <button className="w-16 h-16 rounded-lg border border-muted flex items-center justify-center text-2xl opacity-50">
                      📦
                    </button>
                    <button className="w-16 h-16 rounded-lg border border-muted flex items-center justify-center text-2xl opacity-50">
                      🏷️
                    </button>
                  </div>
                </div>

                {/* Product Details */}
                <div className="space-y-6">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                      {product.name}
                    </h1>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">(4.5) • 128 reviews</span>
                    </div>
                  </div>

                  <div className="text-4xl font-bold text-primary">
                    ₹{product.price.toFixed(2)}
                  </div>

                  {/* Quantity Selector */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <span className="font-medium">Quantity:</span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center font-semibold">{quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setQuantity(quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Add to Cart Button */}
                    <Button
                      size="lg"
                      className="w-full text-lg py-6"
                      onClick={() => addToCart(product, quantity)}
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      {isInCart ? `Add ${quantity} More to Cart` : `Add ${quantity} to Cart`}
                    </Button>

                    {isInCart && (
                      <p className="text-sm text-muted-foreground text-center">
                        You have {cartItem.quantity} in your cart
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <div className="grid grid-cols-3 gap-4 pt-6 border-t">
                    <div className="text-center">
                      <Truck className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <p className="text-sm font-medium">Free Delivery</p>
                      <p className="text-xs text-muted-foreground">On orders over ₹500</p>
                    </div>
                    <div className="text-center">
                      <Shield className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <p className="text-sm font-medium">Quality Assured</p>
                      <p className="text-xs text-muted-foreground">Fresh & authentic</p>
                    </div>
                    <div className="text-center">
                      <RotateCcw className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                      <p className="text-sm font-medium">Easy Returns</p>
                      <p className="text-xs text-muted-foreground">30-day policy</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Product Specifications */}
            <Card className="p-6">
              <h3 className="text-xl font-bold text-foreground mb-4">Product Details</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Category</span>
                    <span className="font-medium">{product.category}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Price</span>
                    <span className="font-medium text-primary">₹{product.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">In Stock</span>
                    <Badge variant={product.inStock ? "default" : "destructive"}>
                      {product.inStock ? "Available" : "Out of Stock"}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">SKU</span>
                    <span className="font-medium">SM-{product.id.toString().padStart(4, '0')}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Weight</span>
                    <span className="font-medium">500g</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Origin</span>
                    <span className="font-medium">India</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Customer Reviews */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-foreground">Customer Reviews</h3>
                <Button variant="outline" size="sm">
                  Write a Review
                </Button>
              </div>

              {/* Overall Rating */}
              <div className="flex items-center gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">4.5</div>
                  <div className="flex justify-center mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground">128 reviews</div>
                </div>
                <Separator orientation="vertical" className="h-16" />
                <div className="flex-1 space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center gap-2 text-sm">
                      <span className="w-8">{rating}★</span>
                      <Progress value={rating === 5 ? 60 : rating === 4 ? 25 : rating === 3 ? 10 : 3} className="flex-1 h-2" />
                      <span className="w-8 text-muted-foreground">
                        {rating === 5 ? 77 : rating === 4 ? 32 : rating === 3 ? 13 : rating === 2 ? 4 : 2}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Individual Reviews */}
              <div className="space-y-4">
                {[
                  { name: "Rajesh Kumar", rating: 5, date: "2 days ago", comment: "Excellent quality product! Exactly as described. Fast delivery and great packaging." },
                  { name: "Priya Sharma", rating: 4, date: "1 week ago", comment: "Good product overall. Minor issues with packaging but the item itself is perfect." },
                  { name: "Amit Patel", rating: 5, date: "2 weeks ago", comment: "Highly recommend! Will definitely buy again. Great value for money." }
                ].map((review, idx) => (
                  <div key={idx} className="border-b border-border pb-4 last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{review.name}</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">{review.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  </div>
                ))}
              </div>

              <div className="text-center mt-4">
                <Button variant="outline">View All Reviews</Button>
              </div>
            </Card>

            {/* Social Sharing */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Share this product</h3>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => shareProduct('facebook')}
                >
                  📘 Facebook
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => shareProduct('twitter')}
                >
                  🐦 Twitter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => shareProduct('instagram')}
                >
                  📷 Instagram
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => shareProduct('copy')}
                >
                  🔗 Copy Link
                </Button>
                {navigator.share && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => shareProduct('native')}
                  >
                    📱 Share
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Share this amazing {product.category.toLowerCase()} with your friends!
              </p>
            </Card>

            {/* Recently Viewed */}
            <Card className="p-6">
              <h3 className="text-xl font-bold text-foreground mb-4">Recently Viewed</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {(() => {
                  try {
                    const viewedData = localStorage.getItem('smartmart-recently-viewed');
                    if (viewedData) {
                      const recentlyViewed: Array<{ id: number; name: string; viewedAt: string }> = JSON.parse(viewedData);
                      // Filter out current product and limit to 4 for display
                      const recentProducts = recentlyViewed
                        .filter(item => item.id !== product?.id)
                        .slice(0, 4)
                        .map(item => products.find(p => p.id === item.id))
                        .filter(Boolean) as Product[];

                      return recentProducts.map((recentProduct) => (
                        <Card
                          key={recentProduct.id}
                          className="p-4 hover:shadow-md transition-all cursor-pointer"
                          onClick={() => navigate(`/product/${recentProduct.id}`)}
                        >
                          <div className="text-center mb-2">
                            <div className="text-3xl mb-2">{recentProduct.emoji}</div>
                            <Badge variant="secondary" className="text-xs">
                              {recentProduct.category}
                            </Badge>
                          </div>
                          <div className="text-center">
                            <h4 className="font-semibold text-sm mb-1 line-clamp-2">{recentProduct.name}</h4>
                            <p className="text-primary font-bold text-sm">
                              ₹{recentProduct.price.toFixed(2)}
                            </p>
                          </div>
                        </Card>
                      ));
                    }
                  } catch (error) {
                    console.error('Error loading recently viewed products:', error);
                  }

                  // Fallback: show some products if no recently viewed data
                  return products.slice(0, 4).filter(p => p.id !== product?.id).map((recentProduct) => (
                    <Card
                      key={recentProduct.id}
                      className="p-4 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => navigate(`/product/${recentProduct.id}`)}
                    >
                      <div className="text-center mb-2">
                        <div className="text-3xl mb-2">{recentProduct.emoji}</div>
                        <Badge variant="secondary" className="text-xs">
                          {recentProduct.category}
                        </Badge>
                      </div>
                      <div className="text-center">
                        <h4 className="font-semibold text-sm mb-1 line-clamp-2">{recentProduct.name}</h4>
                        <p className="text-primary font-bold text-sm">
                          ₹{recentProduct.price.toFixed(2)}
                        </p>
                      </div>
                    </Card>
                  ));
                })()}
              </div>
            </Card>

            {/* Enhanced Recommendations */}
            {recommendations.length > 0 && (
              <Card className="p-6 border-recommendation-border bg-recommendation">
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles className="h-5 w-5 text-accent-foreground" />
                  <h2 className="text-xl font-bold text-accent-foreground">
                    Recommended for You
                  </h2>
                </div>
                <p className="text-sm text-accent-foreground/80 mb-4">
                  Personalized recommendations based on your shopping patterns
                </p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendations.map((rec, idx) => {
                    const recProduct = products.find((p) => p.name === rec.product);
                    if (!recProduct) return null;
                    return (
                      <Card
                        key={idx}
                        className="p-4 hover:shadow-md transition-all cursor-pointer border-recommendation-border group"
                        onClick={() => navigate(`/product/${recProduct.id}`)}
                      >
                        <div className="text-center mb-3">
                          <div className="text-3xl mb-2">{recProduct.emoji}</div>
                          <div className="flex justify-center gap-1 mb-2">
                            <Badge variant="secondary" className="text-xs">
                              {(rec.confidence * 100).toFixed(0)}% confidence
                            </Badge>
                            {rec.score && rec.score > 0.5 && (
                              <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                                High match
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-center mb-3">
                          <h4 className="font-semibold text-sm mb-1">{recProduct.name}</h4>
                          <p className="text-primary font-bold text-sm">
                            ₹{recProduct.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-xs text-accent-foreground/70 space-y-1">
                          <div className="font-medium">Why recommended:</div>
                          {rec.reason.slice(0, 2).map((reason, rIdx) => (
                            <div key={rIdx} className="truncate" title={reason}>
                              • {reason}
                            </div>
                          ))}
                          {rec.reason.length > 2 && (
                            <div className="text-accent-foreground/50">
                              +{rec.reason.length - 2} more reasons
                            </div>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </Card>
            )}
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;