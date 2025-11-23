// Enhanced realistic supermarket transaction data generator
// Creates 2000+ transactions with customer segments, temporal patterns, and realistic shopping behaviors

interface CustomerSegment {
  type: 'budget' | 'regular' | 'premium' | 'health_conscious' | 'convenience' | 'family';
  basketSize: { min: number; max: number };
  preferredCategories: string[];
  frequencyWeight: number;
}

interface TimePattern {
  hour: number;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  season: 'spring' | 'summer' | 'fall' | 'winter';
}

// Comprehensive product catalog with categories and realistic pricing
export const PRODUCT_CATALOG = {
  // Fresh Produce
  fruits: ['Apples', 'Bananas', 'Oranges', 'Grapes', 'Strawberries', 'Watermelon', 'Pineapple', 'Mango', 'Kiwi', 'Blueberries', 'Cherries', 'Peaches'],
  vegetables: ['Lettuce', 'Tomatoes', 'Carrots', 'Broccoli', 'Spinach', 'Cucumbers', 'Bell Peppers', 'Onions', 'Potatoes', 'Garlic', 'Mushrooms', 'Zucchini'],
  
  // Dairy & Refrigerated
  dairy: ['Milk', 'Yogurt', 'Cheese', 'Butter', 'Cream', 'Sour Cream', 'Cottage Cheese', 'Cream Cheese', 'Eggs', 'Whipped Cream'],
  
  // Meat & Seafood
  meat: ['Chicken Breast', 'Ground Beef', 'Pork Chops', 'Bacon', 'Sausage', 'Salmon', 'Tuna', 'Shrimp', 'Turkey', 'Ham'],
  
  // Bakery
  bakery: ['Bread', 'Bagels', 'Croissants', 'Muffins', 'Donuts', 'Baguette', 'Rolls', 'Tortillas', 'Pita Bread'],
  
  // Pantry Staples
  grains: ['Rice', 'Pasta', 'Cereal', 'Oatmeal', 'Quinoa', 'Flour', 'Bread Crumbs', 'Couscous'],
  canned: ['Canned Tomatoes', 'Canned Beans', 'Canned Corn', 'Canned Soup', 'Canned Tuna', 'Tomato Sauce', 'Pasta Sauce'],
  condiments: ['Olive Oil', 'Vegetable Oil', 'Ketchup', 'Mustard', 'Mayonnaise', 'Soy Sauce', 'Hot Sauce', 'Salad Dressing', 'BBQ Sauce'],
  spices: ['Salt', 'Pepper', 'Garlic Powder', 'Paprika', 'Cumin', 'Italian Seasoning', 'Cinnamon', 'Vanilla Extract'],
  
  // Beverages
  beverages: ['Coffee', 'Tea', 'Orange Juice', 'Apple Juice', 'Soda', 'Energy Drink', 'Bottled Water', 'Sports Drink', 'Lemonade', 'Iced Tea'],
  alcohol: ['Beer', 'Wine', 'Spirits'],
  
  // Snacks & Sweets
  snacks: ['Chips', 'Crackers', 'Pretzels', 'Popcorn', 'Nuts', 'Trail Mix', 'Granola Bars', 'Protein Bars', 'Rice Cakes'],
  sweets: ['Chocolate', 'Cookies', 'Candy', 'Ice Cream', 'Cake', 'Brownies', 'Gummy Bears', 'Chocolate Chips'],
  
  // Frozen Foods
  frozen: ['Frozen Pizza', 'Frozen Vegetables', 'Frozen Meals', 'Ice Cream', 'Frozen Fruit', 'Frozen Fries', 'Frozen Chicken Nuggets', 'Frozen Waffles'],
  
  // Health & Wellness
  health: ['Protein Powder', 'Vitamins', 'Protein Shake', 'Almond Milk', 'Greek Yogurt', 'Hummus', 'Avocado', 'Chia Seeds', 'Coconut Oil'],
  
  // Household & Personal Care
  household: ['Detergent', 'Dish Soap', 'Paper Towels', 'Toilet Paper', 'Trash Bags', 'Cleaning Spray', 'Sponges', 'Aluminum Foil', 'Plastic Wrap'],
  personal: ['Shampoo', 'Toothpaste', 'Soap', 'Deodorant', 'Tissues', 'Hand Sanitizer', 'Lotion', 'Razors'],
  
  // Baby & Pet
  baby: ['Diapers', 'Baby Wipes', 'Baby Food', 'Baby Formula', 'Baby Lotion'],
  pet: ['Pet Food', 'Pet Treats', 'Cat Litter', 'Pet Shampoo']
};

// Customer segment definitions with realistic behaviors
const CUSTOMER_SEGMENTS: CustomerSegment[] = [
  {
    type: 'budget',
    basketSize: { min: 3, max: 8 },
    preferredCategories: ['grains', 'canned', 'frozen', 'household'],
    frequencyWeight: 0.25
  },
  {
    type: 'regular',
    basketSize: { min: 5, max: 12 },
    preferredCategories: ['dairy', 'meat', 'vegetables', 'fruits', 'bakery', 'beverages'],
    frequencyWeight: 0.35
  },
  {
    type: 'premium',
    basketSize: { min: 8, max: 18 },
    preferredCategories: ['meat', 'dairy', 'fruits', 'vegetables', 'health', 'alcohol', 'sweets'],
    frequencyWeight: 0.15
  },
  {
    type: 'health_conscious',
    basketSize: { min: 6, max: 14 },
    preferredCategories: ['health', 'fruits', 'vegetables', 'dairy', 'meat', 'grains'],
    frequencyWeight: 0.12
  },
  {
    type: 'convenience',
    basketSize: { min: 2, max: 6 },
    preferredCategories: ['frozen', 'snacks', 'beverages', 'bakery'],
    frequencyWeight: 0.08
  },
  {
    type: 'family',
    basketSize: { min: 12, max: 25 },
    preferredCategories: ['dairy', 'meat', 'vegetables', 'fruits', 'snacks', 'household', 'bakery', 'frozen'],
    frequencyWeight: 0.05
  }
];

// Shopping patterns based on common real-world associations
const SHOPPING_PATTERNS = {
  breakfast: [
    ['Milk', 'Cereal', 'Bananas', 'Orange Juice'],
    ['Bread', 'Eggs', 'Bacon', 'Butter', 'Coffee'],
    ['Yogurt', 'Granola Bars', 'Blueberries', 'Honey'],
    ['Bagels', 'Cream Cheese', 'Coffee', 'Orange Juice'],
    ['Oatmeal', 'Milk', 'Strawberries', 'Honey'],
    ['Croissants', 'Butter', 'Coffee', 'Orange Juice']
  ],
  
  dinner_italian: [
    ['Pasta', 'Tomato Sauce', 'Cheese', 'Olive Oil', 'Garlic', 'Bread'],
    ['Pasta', 'Ground Beef', 'Canned Tomatoes', 'Onions', 'Garlic Powder'],
    ['Pizza Dough', 'Tomato Sauce', 'Cheese', 'Pepperoni', 'Olive Oil']
  ],
  
  dinner_american: [
    ['Ground Beef', 'Hamburger Buns', 'Cheese', 'Lettuce', 'Tomatoes', 'Ketchup', 'Chips'],
    ['Chicken Breast', 'Rice', 'Broccoli', 'Soy Sauce'],
    ['Pork Chops', 'Potatoes', 'Green Beans', 'Butter'],
    ['Salmon', 'Asparagus', 'Lemon', 'Olive Oil']
  ],
  
  dinner_mexican: [
    ['Tortillas', 'Ground Beef', 'Cheese', 'Lettuce', 'Tomatoes', 'Sour Cream', 'Salsa'],
    ['Chicken', 'Rice', 'Beans', 'Tortillas', 'Avocado']
  ],
  
  dinner_asian: [
    ['Rice', 'Soy Sauce', 'Chicken', 'Broccoli', 'Carrots'],
    ['Noodles', 'Vegetables', 'Soy Sauce', 'Sesame Oil'],
    ['Shrimp', 'Rice', 'Bell Peppers', 'Soy Sauce']
  ],
  
  salad: [
    ['Lettuce', 'Tomatoes', 'Cucumbers', 'Salad Dressing', 'Croutons'],
    ['Spinach', 'Strawberries', 'Feta Cheese', 'Balsamic Vinegar'],
    ['Lettuce', 'Chicken', 'Caesar Dressing', 'Parmesan Cheese']
  ],
  
  sandwich: [
    ['Bread', 'Turkey', 'Cheese', 'Lettuce', 'Tomatoes', 'Mayonnaise'],
    ['Bagels', 'Cream Cheese', 'Salmon', 'Cucumber'],
    ['Bread', 'Peanut Butter', 'Jelly', 'Bananas']
  ],
  
  baking: [
    ['Flour', 'Sugar', 'Butter', 'Eggs', 'Vanilla Extract', 'Baking Powder'],
    ['Flour', 'Chocolate Chips', 'Butter', 'Sugar', 'Eggs'],
    ['Cake Mix', 'Eggs', 'Oil', 'Frosting']
  ],
  
  party: [
    ['Chips', 'Salsa', 'Guacamole', 'Soda', 'Beer'],
    ['Pizza', 'Wings', 'Beer', 'Soda'],
    ['Cheese', 'Crackers', 'Wine', 'Grapes'],
    ['Chips', 'Dip', 'Soda', 'Candy', 'Cookies']
  ],
  
  snacking: [
    ['Chips', 'Soda'],
    ['Cookies', 'Milk'],
    ['Chocolate', 'Ice Cream'],
    ['Crackers', 'Cheese'],
    ['Popcorn', 'Soda'],
    ['Nuts', 'Dried Fruit']
  ],
  
  healthy: [
    ['Greek Yogurt', 'Granola', 'Blueberries', 'Honey'],
    ['Protein Powder', 'Almond Milk', 'Bananas', 'Protein Bars'],
    ['Chicken Breast', 'Quinoa', 'Broccoli', 'Olive Oil'],
    ['Salmon', 'Sweet Potatoes', 'Asparagus', 'Lemon']
  ],
  
  quick_meal: [
    ['Frozen Pizza', 'Soda'],
    ['Frozen Meals', 'Bread'],
    ['Canned Soup', 'Crackers', 'Cheese'],
    ['Ramen', 'Eggs', 'Green Onions']
  ],
  
  household_shopping: [
    ['Detergent', 'Dish Soap', 'Paper Towels', 'Toilet Paper'],
    ['Trash Bags', 'Cleaning Spray', 'Sponges'],
    ['Laundry Detergent', 'Fabric Softener', 'Bleach']
  ],
  
  baby_care: [
    ['Diapers', 'Baby Wipes', 'Baby Food', 'Baby Formula'],
    ['Baby Lotion', 'Baby Shampoo', 'Diapers']
  ],
  
  pet_care: [
    ['Pet Food', 'Pet Treats'],
    ['Cat Litter', 'Pet Food', 'Pet Treats']
  ],
  
  impulse: [
    ['Chocolate'],
    ['Candy'],
    ['Soda'],
    ['Chips'],
    ['Cookies'],
    ['Ice Cream'],
    ['Energy Drink']
  ]
};

// Seasonal patterns
const SEASONAL_ITEMS = {
  spring: ['Strawberries', 'Asparagus', 'Peas', 'Spinach', 'Lettuce'],
  summer: ['Watermelon', 'Ice Cream', 'Lemonade', 'BBQ Sauce', 'Hot Dogs', 'Corn', 'Tomatoes'],
  fall: ['Pumpkin', 'Apples', 'Cinnamon', 'Hot Chocolate', 'Soup'],
  winter: ['Hot Chocolate', 'Soup', 'Oranges', 'Tea', 'Cranberries']
};

// Time-based shopping patterns
const TIME_PATTERNS = {
  morning: { weight: 0.3, patterns: ['breakfast', 'snacking', 'impulse'] },
  afternoon: { weight: 0.2, patterns: ['quick_meal', 'snacking', 'household_shopping'] },
  evening: { weight: 0.4, patterns: ['dinner_italian', 'dinner_american', 'dinner_mexican', 'dinner_asian', 'salad'] },
  night: { weight: 0.1, patterns: ['snacking', 'impulse', 'quick_meal'] }
};

function generateRealisticTransactions(count: number = 2000): string[][] {
  const transactions: string[][] = [];
  const random = () => Math.random();
  
  // Determine current season (simulate throughout year)
  const seasons: Array<'spring' | 'summer' | 'fall' | 'winter'> = ['spring', 'summer', 'fall', 'winter'];
  
  for (let i = 0; i < count; i++) {
    // Select customer segment based on frequency weights
    const segmentRoll = random();
    let cumulativeWeight = 0;
    let selectedSegment: CustomerSegment = CUSTOMER_SEGMENTS[0];
    
    for (const segment of CUSTOMER_SEGMENTS) {
      cumulativeWeight += segment.frequencyWeight;
      if (segmentRoll <= cumulativeWeight) {
        selectedSegment = segment;
        break;
      }
    }
    
    // Determine shopping time
    const timeOfDay = random() < 0.3 ? 'morning' : 
                      random() < 0.5 ? 'afternoon' : 
                      random() < 0.85 ? 'evening' : 'night';
    
    // Determine season
    const currentSeason = seasons[Math.floor(random() * seasons.length)];
    
    let basket: string[] = [];
    
    // 75% pattern-based, 25% random
    if (random() < 0.75) {
      // Select pattern based on time of day
      const timePattern = TIME_PATTERNS[timeOfDay];
      const availablePatterns = timePattern.patterns;
      const selectedPatternKey = availablePatterns[Math.floor(random() * availablePatterns.length)];
      
      const patternOptions = SHOPPING_PATTERNS[selectedPatternKey];
      const basePattern = patternOptions[Math.floor(random() * patternOptions.length)];
      basket = [...basePattern];
      
      // Add items from preferred categories
      const categoryAdditions = Math.floor(random() * 3) + 1;
      for (let j = 0; j < categoryAdditions; j++) {
        const preferredCategory = selectedSegment.preferredCategories[
          Math.floor(random() * selectedSegment.preferredCategories.length)
        ];
        
        if (PRODUCT_CATALOG[preferredCategory]) {
          const items = PRODUCT_CATALOG[preferredCategory];
          const item = items[Math.floor(random() * items.length)];
          if (!basket.includes(item)) {
            basket.push(item);
          }
        }
      }
      
      // Add seasonal items (20% chance)
      if (random() < 0.2) {
        const seasonalItems = SEASONAL_ITEMS[currentSeason];
        const seasonalItem = seasonalItems[Math.floor(random() * seasonalItems.length)];
        if (!basket.includes(seasonalItem)) {
          basket.push(seasonalItem);
        }
      }
      
      // Add impulse buys (40% chance)
      if (random() < 0.4) {
        const impulsePattern = SHOPPING_PATTERNS.impulse;
        const impulseItem = impulsePattern[Math.floor(random() * impulsePattern.length)][0];
        if (!basket.includes(impulseItem)) {
          basket.push(impulseItem);
        }
      }
      
      // Adjust basket size to segment preferences
      while (basket.length < selectedSegment.basketSize.min) {
        const categories = Object.keys(PRODUCT_CATALOG);
        const randomCategory = categories[Math.floor(random() * categories.length)];
        const items = PRODUCT_CATALOG[randomCategory];
        const item = items[Math.floor(random() * items.length)];
        if (!basket.includes(item)) {
          basket.push(item);
        }
      }
      
      // Trim if too large
      if (basket.length > selectedSegment.basketSize.max) {
        basket = basket.slice(0, selectedSegment.basketSize.max);
      }
      
    } else {
      // Generate random basket based on segment
      const basketSize = selectedSegment.basketSize.min + 
                        Math.floor(random() * (selectedSegment.basketSize.max - selectedSegment.basketSize.min + 1));
      
      const usedItems = new Set<string>();
      while (basket.length < basketSize) {
        // 70% from preferred categories, 30% from any category
        const categories = random() < 0.7 ? 
          selectedSegment.preferredCategories : 
          Object.keys(PRODUCT_CATALOG);
        
        const randomCategory = categories[Math.floor(random() * categories.length)];
        if (PRODUCT_CATALOG[randomCategory]) {
          const items = PRODUCT_CATALOG[randomCategory];
          const item = items[Math.floor(random() * items.length)];
          
          if (!usedItems.has(item)) {
            usedItems.add(item);
            basket.push(item);
          }
        }
      }
    }
    
    // Ensure basket is not empty and sort for consistency
    if (basket.length > 0) {
      basket.sort();
      transactions.push(basket);
    }
  }
  
  return transactions;
}

export const sampleTransactions: string[][] = generateRealisticTransactions(2000);


import type { FrequentItemset, AssociationRule } from "@/types";

// Enhanced types with additional metrics
export interface EnhancedAssociationRule extends AssociationRule {
  conviction?: number;
  leverage?: number;
  jaccard?: number;
  cosine?: number;
  kulczynski?: number;
  imbalanceRatio?: number;
}

export interface MiningStats {
  totalTransactions: number;
  uniqueItems: number;
  avgBasketSize: number;
  minBasketSize: number;
  maxBasketSize: number;
  totalItemsets: number;
  miningTimeMs: number;
}

/**
 * Calculates the support of an itemset with caching for performance
 */
const supportCache = new Map<string, { support: number; count: number }>();

function calculateSupport(itemset: string[], transactions: string[][]): { support: number; count: number } {
  const cacheKey = itemset.sort().join('|');
  
  if (supportCache.has(cacheKey)) {
    return supportCache.get(cacheKey)!;
  }
  
  const count = transactions.filter(transaction =>
    itemset.every(item => transaction.includes(item))
  ).length;
  
  const result = {
    support: count / transactions.length,
    count
  };
  
  supportCache.set(cacheKey, result);
  return result;
}

/**
 * Generates candidate itemsets using optimized join operation
 */
function generateCandidates(prevFrequent: FrequentItemset[], k: number): string[][] {
  const candidates: string[][] = [];
  const candidateSet = new Set<string>();
  
  for (let i = 0; i < prevFrequent.length; i++) {
    for (let j = i + 1; j < prevFrequent.length; j++) {
      const itemset1 = prevFrequent[i].items;
      const itemset2 = prevFrequent[j].items;
      
      // Check if first k-2 items are identical
      if (k > 2) {
        let canJoin = true;
        for (let m = 0; m < k - 2; m++) {
          if (itemset1[m] !== itemset2[m]) {
            canJoin = false;
            break;
          }
        }
        if (!canJoin) continue;
      }
      
      // Join the itemsets
      const candidate = [...itemset1, itemset2[k - 2]].sort();
      const candidateKey = candidate.join('|');
      
      // Avoid duplicates
      if (candidateSet.has(candidateKey)) continue;
      
      // Prune using Apriori property: all subsets must be frequent
      const subsets = getSubsets(candidate, k - 1);
      const allSubsetsFrequent = subsets.every(subset => {
        const sortedSubset = [...subset].sort();
        return prevFrequent.some(freq => arraysEqual(freq.items, sortedSubset));
      });
      
      if (allSubsetsFrequent) {
        candidates.push(candidate);
        candidateSet.add(candidateKey);
      }
    }
  }
  
  return candidates;
}

/**
 * Optimized subset generation
 */
function getSubsets(arr: string[], k: number): string[][] {
  if (k === 0) return [[]];
  if (arr.length < k) return [];
  
  const result: string[][] = [];
  
  function backtrack(start: number, temp: string[]) {
    if (temp.length === k) {
      result.push([...temp]);
      return;
    }
    
    for (let i = start; i < arr.length; i++) {
      temp.push(arr[i]);
      backtrack(i + 1, temp);
      temp.pop();
    }
  }
  
  backtrack(0, []);
  return result;
}

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((val, index) => val === b[index]);
}

/**
 * Enhanced Apriori algorithm with performance optimizations
 */
export function findFrequentItemsets(
  transactions: string[][],
  minSupport: number
): FrequentItemset[] {
  const startTime = Date.now();
  supportCache.clear();
  
  const allFrequentItemsets: FrequentItemset[] = [];
  const totalTransactions = transactions.length;
  
  // Find frequent 1-itemsets with counting optimization
  const itemCounts = new Map<string, number>();
  transactions.forEach(transaction => {
    const uniqueItems = new Set(transaction);
    uniqueItems.forEach(item => {
      itemCounts.set(item, (itemCounts.get(item) || 0) + 1);
    });
  });
  
  let frequentItemsets: FrequentItemset[] = [];
  itemCounts.forEach((count, item) => {
    const support = count / totalTransactions;
    if (support >= minSupport) {
      frequentItemsets.push({
        items: [item],
        support,
        supportCount: count
      });
    }
  });
  
  // Sort for consistent candidate generation
  frequentItemsets.sort((a, b) => a.items[0].localeCompare(b.items[0]));
  allFrequentItemsets.push(...frequentItemsets);
  
  // Generate larger itemsets iteratively
  let k = 2;
  while (frequentItemsets.length > 0 && k <= 5) { // Limit to 5-itemsets for performance
    const candidates = generateCandidates(frequentItemsets, k);
    
    if (candidates.length === 0) break;
    
    frequentItemsets = [];
    candidates.forEach(candidate => {
      const { support, count } = calculateSupport(candidate, transactions);
      if (support >= minSupport) {
        frequentItemsets.push({
          items: candidate,
          support,
          supportCount: count
        });
      }
    });
    
    if (frequentItemsets.length > 0) {
      allFrequentItemsets.push(...frequentItemsets);
    }
    
    k++;
  }
  
  console.log(`Mining completed in ${Date.now() - startTime}ms`);
  return allFrequentItemsets;
}

/**
 * Calculate additional quality metrics for association rules
 */
function calculateEnhancedMetrics(
  antecedent: string[],
  consequent: string[],
  itemset: string[],
  transactions: string[][],
  itemsetSupport: number
): Partial<EnhancedAssociationRule> {
  const antecedentSupport = calculateSupport(antecedent, transactions).support;
  const consequentSupport = calculateSupport(consequent, transactions).support;
  const confidence = itemsetSupport / antecedentSupport;
  
  // Lift: how much more likely items appear together than expected by chance
  const lift = confidence / consequentSupport;
  
  // Conviction: measures implication strength (∞ for perfect implication)
  // conviction = (1 - supp(consequent)) / (1 - confidence)
  const conviction = confidence === 1 ? Infinity : (1 - consequentSupport) / (1 - confidence);
  
  // Leverage: difference between observed and expected co-occurrence
  // leverage = supp(X∪Y) - supp(X) × supp(Y)
  const leverage = itemsetSupport - (antecedentSupport * consequentSupport);
  
  // Jaccard: intersection over union
  // jaccard = supp(X∪Y) / (supp(X) + supp(Y) - supp(X∪Y))
  const jaccard = itemsetSupport / (antecedentSupport + consequentSupport - itemsetSupport);
  
  // Cosine: geometric mean of confidence and reverse confidence
  // cosine = supp(X∪Y) / sqrt(supp(X) × supp(Y))
  const cosine = itemsetSupport / Math.sqrt(antecedentSupport * consequentSupport);
  
  // Kulczynski: average of confidences in both directions
  const reverseConfidence = itemsetSupport / consequentSupport;
  const kulczynski = (confidence + reverseConfidence) / 2;
  
  // Imbalance Ratio: measures balance between antecedent and consequent support
  const imbalanceRatio = Math.abs(antecedentSupport - consequentSupport) / 
                         (antecedentSupport + consequentSupport - itemsetSupport);
  
  return {
    confidence,
    support: itemsetSupport,
    lift,
    conviction: isFinite(conviction) ? conviction : 999, // Cap infinity for display
    leverage,
    jaccard,
    cosine,
    kulczynski,
    imbalanceRatio
  };
}

/**
 * Generate enhanced association rules with all quality metrics
 */
export function generateAssociationRules(
  frequentItemsets: FrequentItemset[],
  minConfidence: number,
  transactions: string[][],
  minLift: number = 1.0
): EnhancedAssociationRule[] {
  const rules: EnhancedAssociationRule[] = [];
  
  // Only consider itemsets with 2 or more items
  const multiItemsets = frequentItemsets.filter(itemset => itemset.items.length >= 2);
  
  multiItemsets.forEach(itemset => {
    const items = itemset.items;
    const itemsetSupport = itemset.support;
    
    // Generate all non-empty proper subsets as antecedents
    const subsets = generateAllSubsets(items);
    
    subsets.forEach(antecedent => {
      if (antecedent.length === 0 || antecedent.length === items.length) return;
      
      const consequent = items.filter(item => !antecedent.includes(item));
      
      const metrics = calculateEnhancedMetrics(
        antecedent,
        consequent,
        items,
        transactions,
        itemsetSupport
      );
      
      // Apply confidence and lift thresholds
      if (metrics.confidence! >= minConfidence && metrics.lift! >= minLift) {
        rules.push({
          antecedent,
          consequent,
          ...metrics
        } as EnhancedAssociationRule);
      }
    });
  });
  
  // Sort by confidence * lift for best rules first
  rules.sort((a, b) => (b.confidence! * b.lift!) - (a.confidence! * a.lift!));
  
  return rules;
}

/**
 * Generate all possible non-empty subsets efficiently
 */
function generateAllSubsets(arr: string[]): string[][] {
  const subsets: string[][] = [];
  const n = arr.length;
  
  // Use bit manipulation for efficiency
  for (let i = 1; i < (1 << n) - 1; i++) {
    const subset: string[] = [];
    for (let j = 0; j < n; j++) {
      if (i & (1 << j)) {
        subset.push(arr[j]);
      }
    }
    subsets.push(subset);
  }
  
  return subsets;
}

/**
 * Calculate dataset statistics
 */
export function calculateDatasetStats(transactions: string[][]): MiningStats {
  const uniqueItems = new Set<string>();
  let totalItems = 0;
  let minSize = Infinity;
  let maxSize = 0;
  
  transactions.forEach(transaction => {
    transaction.forEach(item => uniqueItems.add(item));
    totalItems += transaction.length;
    minSize = Math.min(minSize, transaction.length);
    maxSize = Math.max(maxSize, transaction.length);
  });
  
  return {
    totalTransactions: transactions.length,
    uniqueItems: uniqueItems.size,
    avgBasketSize: totalItems / transactions.length,
    minBasketSize: minSize,
    maxBasketSize: maxSize,
    totalItemsets: 0,
    miningTimeMs: 0
  };
}

/**
 * Main enhanced Apriori algorithm with comprehensive results
 */
export function runAprioriAlgorithm(
  transactions: string[][],
  minSupport: number = 0.05,
  minConfidence: number = 0.4,
  minLift: number = 1.0
): {
  frequentItemsets: FrequentItemset[];
  associationRules: EnhancedAssociationRule[];
  stats: MiningStats;
} {
  const startTime = Date.now();
  
  console.log(`🚀 Running Enhanced Apriori Algorithm`);
  console.log(`📊 Transactions: ${transactions.length}`);
  console.log(`📈 Min Support: ${(minSupport * 100).toFixed(1)}%`);
  console.log(`📈 Min Confidence: ${(minConfidence * 100).toFixed(1)}%`);
  console.log(`📈 Min Lift: ${minLift.toFixed(1)}`);
  
  // Calculate dataset statistics
  const stats = calculateDatasetStats(transactions);
  console.log(`📦 Unique Items: ${stats.uniqueItems}`);
  console.log(`🛒 Avg Basket Size: ${stats.avgBasketSize.toFixed(2)}`);
  
  // Find frequent itemsets
  const frequentItemsets = findFrequentItemsets(transactions, minSupport);
  stats.totalItemsets = frequentItemsets.length;
  console.log(`✅ Found ${frequentItemsets.length} frequent itemsets`);
  
  // Generate association rules with enhanced metrics
  const associationRules = generateAssociationRules(
    frequentItemsets,
    minConfidence,
    transactions,
    minLift
  );
  
  stats.miningTimeMs = Date.now() - startTime;
  console.log(`✅ Generated ${associationRules.length} association rules`);
  console.log(`⏱️  Total time: ${stats.miningTimeMs}ms`);
  
  // Log top rules
  if (associationRules.length > 0) {
    console.log('\n🏆 Top 10 Association Rules:');
    associationRules.slice(0, 10).forEach((rule, i) => {
      console.log(
        `${i + 1}. ${rule.antecedent.join(' + ')} ⇒ ${rule.consequent.join(' + ')}\n` +
        `   Conf: ${(rule.confidence! * 100).toFixed(1)}% | ` +
        `Lift: ${rule.lift!.toFixed(2)} | ` +
        `Conv: ${rule.conviction!.toFixed(2)} | ` +
        `Supp: ${(rule.support! * 100).toFixed(1)}%`
      );
    });
  }
  
  return {
    frequentItemsets,
    associationRules,
    stats
  };
}

/**
 * Filter rules by specific criteria for actionable insights
 */
export function filterActionableRules(
  rules: EnhancedAssociationRule[],
  options: {
    minConfidence?: number;
    minLift?: number;
    minLeverage?: number;
    maxImbalanceRatio?: number;
    antecedentMaxSize?: number;
    consequentMaxSize?: number;
  } = {}
): EnhancedAssociationRule[] {
  const {
    minConfidence = 0.5,
    minLift = 1.2,
    minLeverage = 0.01,
    maxImbalanceRatio = 0.8,
    antecedentMaxSize = 3,
    consequentMaxSize = 2
  } = options;
  
  return rules.filter(rule =>
    rule.confidence! >= minConfidence &&
    rule.lift! >= minLift &&
    rule.leverage! >= minLeverage &&
    rule.imbalanceRatio! <= maxImbalanceRatio &&
    rule.antecedent.length <= antecedentMaxSize &&
    rule.consequent.length <= consequentMaxSize
  );
}

/**
 * Get recommendations for a given shopping basket
 */
export function getRecommendations(
  currentBasket: string[],
  rules: EnhancedAssociationRule[],
  topN: number = 5
): Array<{ item: string; score: number; rules: EnhancedAssociationRule[] }> {
  const recommendations = new Map<string, { score: number; rules: EnhancedAssociationRule[] }>();
  
  rules.forEach(rule => {
    // Check if all antecedent items are in current basket
    const allAntecedentInBasket = rule.antecedent.every(item => 
      currentBasket.includes(item)
    );
    
    if (allAntecedentInBasket) {
      rule.consequent.forEach(item => {
        // Don't recommend items already in basket
        if (!currentBasket.includes(item)) {
          const score = (rule.confidence! * rule.lift! * rule.kulczynski!) / 3;
          
          if (!recommendations.has(item)) {
            recommendations.set(item, { score, rules: [rule] });
          } else {
            const existing = recommendations.get(item)!;
            existing.score = Math.max(existing.score, score);
            existing.rules.push(rule);
          }
        }
      });
    }
  });
  
  return Array.from(recommendations.entries())
    .map(([item, data]) => ({ item, ...data }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}
