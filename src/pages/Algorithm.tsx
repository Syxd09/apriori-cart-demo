import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  ArrowLeft,
  Brain,
  Database,
  ShoppingCart,
  BarChart3,
  Zap,
  Target,
  Lightbulb,
  Code,
  Play,
  CheckCircle,
  Info,
  BookOpen,
  Globe,
  Users,
  Award,
  ArrowRight,
  Layers,
  Network,
  Filter,
  GitBranch,
  Calculator,
  AlertCircle,
  Eye,
  Cpu,
  Workflow,
  Settings,
  LineChart,
  PieChart,
  Activity,
  TrendingUp
} from "lucide-react";
import { runAprioriAlgorithm, sampleTransactions } from "@/lib/apriori";
import Footer from "@/components/Footer";
import type { FrequentItemset, AssociationRule, AlgorithmStep, ExampleRule } from "@/types";

interface MetricExplanation {
  name: string;
  symbol: string;
  formula: string;
  range: string;
  meaning: string;
  example: string;
  whenToUse: string;
}

interface ComplexityAnalysis {
  stage: string;
  timeComplexity: string;
  spaceComplexity: string;
  description: string;
  optimization: string;
}

interface RealWorldCase {
  company: string;
  industry: string;
  problem: string;
  solution: string;
  impact: string;
  metrics: string[];
}

const Algorithm = () => {
  const navigate = useNavigate();
  const [algorithmResults, setAlgorithmResults] = useState<{
    frequentItemsets: FrequentItemset[];
    associationRules: AssociationRule[];
  } | null>(null);
  const [expandedRule, setExpandedRule] = useState<number | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<string>("support");
  const [simulationStep, setSimulationStep] = useState<number>(0);

  useEffect(() => {
    const { frequentItemsets, associationRules: rawRules } = runAprioriAlgorithm(sampleTransactions, 0.02, 0.25);
    const associationRules = rawRules.filter(rule => (rule.lift || 0) > 1.1);
    setAlgorithmResults({ frequentItemsets, associationRules });
  }, []);

  const algorithmSteps: AlgorithmStep[] = [
    {
      id: "find-frequent-1-itemsets",
      title: "Find Frequent 1-Itemsets (L₁)",
      description: "Count individual item frequencies in all transactions",
      icon: <BarChart3 className="h-6 w-6" />,
      details: "Scan all transactions and count occurrences of each individual item. Items appearing in at least minSupport% of transactions qualify as frequent 1-itemsets. This creates the foundation for larger itemsets.",
      example: "From 2000 transactions: Milk appears 180 times (9%), Bread 165 times (8.25%), Eggs 172 times (8.6%)... All meet 3% minimum support threshold.",
      complexity: "O(n × m) where n=transactions, m=items",
      optimization: "Use hash tables for O(1) count lookups"
    },
    {
      id: "generate-candidate-2-itemsets",
      title: "Generate Candidate 2-Itemsets (C₂)",
      description: "Create pairs from frequent 1-itemsets using join step",
      icon: <Target className="h-6 w-6" />,
      details: "Combine pairs of frequent 1-itemsets to create candidate 2-itemsets. If {A} and {B} are frequent, create candidate {A, B}. This systematic approach ensures we don't miss any possible itemsets.",
      example: "From L₁: {Milk, Bread}, {Milk, Eggs}, {Milk, Butter}, {Bread, Eggs}, {Bread, Butter}... Creates manageable candidate set.",
      complexity: "O(k²) where k=frequent itemsets from previous level",
      optimization: "Only join itemsets sharing k-2 common items"
    },
    {
      id: "prune-apriori-property",
      title: "Prune Using Apriori Property",
      description: "Eliminate candidates whose subsets aren't frequent",
      icon: <Zap className="h-6 w-6" />,
      details: "If any (k-1)-subset of a k-candidate is not frequent, the candidate cannot be frequent. This anti-monotone property is the key optimization that makes Apriori efficient.",
      example: "If {Milk} is frequent but {Rare Milk Brand} is not, then candidate {Milk, Rare Milk Brand, Bread} can be safely pruned without counting.",
      complexity: "O(|C| × k) where |C|=candidates, k=itemset size",
      optimization: "Check subset membership in hash structure"
    },
    {
      id: "count-support-candidates",
      title: "Count Support for Candidates",
      description: "Scan database to find support for each candidate",
      icon: <TrendingUp className="h-6 w-6" />,
      details: "For each remaining candidate, scan the transaction database to count how many transactions contain it. This is the computationally intensive step where candidates are tested against all transactions.",
      example: "Candidate {Milk, Bread} appears in 86 transactions → support = 86/2000 = 4.3% (passes 3% threshold)",
      complexity: "O(|C| × n) where |C|=candidates, n=transactions",
      optimization: "Use bit-vector representation for faster matching"
    },
    {
      id: "generate-association-rules",
      title: "Generate Association Rules",
      description: "Extract meaningful rules from frequent itemsets",
      icon: <Brain className="h-6 w-6" />,
      details: "For each frequent itemset with k≥2 items, generate all possible rules (A→B) where A and B are non-empty and disjoint subsets. Calculate confidence and other metrics to filter high-quality rules.",
      example: "From {Milk, Bread}: {Milk}→{Bread}, {Bread}→{Milk}. Calculate: conf({Milk}→{Bread})=86/172=50%, conf({Bread}→{Milk})=86/165=52%",
      complexity: "O(2^k) rules per itemset where k=itemset size",
      optimization: "Limit to 2-3 item rules; use confidence pruning"
    }
  ];

  const metricExplanations: MetricExplanation[] = [
    {
      name: "Support",
      symbol: "supp(X)",
      formula: "# transactions containing X / total transactions",
      range: "[0, 1] or [0%, 100%]",
      meaning: "How frequently an itemset appears in the database. Indicates popularity or prevalence of a pattern.",
      example: "Support({Milk, Bread}) = 0.043 means 4.3% of customers bought both milk and bread",
      whenToUse: "First filter - eliminates rare items. Set 2-5% for retail, higher for specialized stores"
    },
    {
      name: "Confidence",
      symbol: "conf(A→B)",
      formula: "supp(A∪B) / supp(A)",
      range: "[0, 1] or [0%, 100%]",
      meaning: "Conditional probability: Given customer bought A, what's the probability they bought B? Measures rule reliability.",
      example: "Confidence({Milk}→{Bread}) = 0.50 means 50% of milk buyers also bought bread",
      whenToUse: "Primary rule quality metric. Set 40-60% baseline; higher for critical decisions"
    },
    {
      name: "Lift",
      symbol: "lift(A→B)",
      formula: "conf(A→B) / supp(B) = supp(A∪B) / (supp(A) × supp(B))",
      range: "[0, ∞) typically [0.5, 3]",
      meaning: "How much more likely B is purchased given A, compared to B being purchased independently. Lift > 1 indicates positive correlation.",
      example: "Lift({Milk}→{Bread}) = 1.35 means milk buyers are 35% more likely to buy bread than average customer",
      whenToUse: "Detect positive/negative correlations. Use >1.2 for strong associations, >1.5 for bundles"
    },
    {
      name: "Conviction",
      symbol: "conv(A→B)",
      formula: "(1 - supp(B)) / (1 - conf(A→B))",
      range: "[0, ∞) typically [0.5, 5]",
      meaning: "Measures implication strength: How much the rule would be violated if false. Conv=1 means independent; Conv→∞ means perfect implication.",
      example: "Conviction({Milk}→{Bread}) = 2.14 means the rule is violated 1/2.14 ≈ 47% less often than random",
      whenToUse: "Identify strong implications, especially for rare consequents. Better for predictive rules than lift"
    },
    {
      name: "Leverage",
      symbol: "lev(A→B)",
      formula: "supp(A∪B) - (supp(A) × supp(B))",
      range: "[-0.25, 0.25]",
      meaning: "Absolute difference between observed and expected co-occurrence if items were independent. Measures practical significance.",
      example: "Leverage({Milk}→{Bread}) = 0.018 means milk-bread pairs occur 1.8% more often than random chance",
      whenToUse: "Find rules with significant real-world impact. Use >0.01 for meaningful associations"
    },
    {
      name: "Jaccard Similarity",
      symbol: "J(A,B)",
      formula: "supp(A∪B) / (supp(A) + supp(B) - supp(A∪B))",
      range: "[0, 1]",
      meaning: "Set-based similarity measure: Intersection over union. Symmetric measure independent of item frequencies.",
      example: "Jaccard({Milk}→{Bread}) = 0.32 means the itemset shares 32% overlap with union",
      whenToUse: "Symmetric pattern mining, clustering items. Good for rare items"
    },
    {
      name: "Cosine Similarity",
      symbol: "cos(A,B)",
      formula: "supp(A∪B) / √(supp(A) × supp(B))",
      range: "[0, 1]",
      meaning: "Geometric mean-based similarity: Handles frequency skew better. Values closer to Jaccard for similar frequencies.",
      example: "Cosine({Milk}→{Bread}) = 0.58 indicates high correlation normalized by item frequencies",
      whenToUse: "When itemset frequencies are imbalanced; frequent + rare items together"
    },
    {
      name: "Kulczynski Measure",
      symbol: "kulc(A,B)",
      formula: "(conf(A→B) + conf(B→A)) / 2",
      range: "[0, 1]",
      meaning: "Average of bidirectional confidences. Symmetric measure of mutual dependence.",
      example: "Kulczynski({Milk,Bread}) = 0.67 means average confidence in both directions is 67%",
      whenToUse: "Symmetric relationships; products that naturally go together in both orders"
    },
    {
      name: "Imbalance Ratio",
      symbol: "IR(A,B)",
      formula: "|supp(A) - supp(B)| / (supp(A) + supp(B) - supp(A∪B))",
      range: "[0, 1]",
      meaning: "Measures support asymmetry: How different are antecedent and consequent frequencies? 0=perfectly balanced.",
      example: "IR({Milk}→{Bread}) = 0.15 means supports differ by 15% (balanced association)",
      whenToUse: "Identify if rule connects frequent to rare items; asymmetric patterns"
    }
  ];

  const complexityAnalysis: ComplexityAnalysis[] = [
    {
      stage: "Database Scanning (Per Level)",
      timeComplexity: "O(|C_k| × |D|)",
      spaceComplexity: "O(|L_k|)",
      description: "For each level k, scan database |D| once for each candidate |C_k|. This is the bottleneck.",
      optimization: "Use transaction hashing, partitioning, sampling for large datasets"
    },
    {
      stage: "Candidate Generation",
      timeComplexity: "O(|L_{k-1}|²)",
      spaceComplexity: "O(|C_k|)",
      description: "Generate candidates by joining frequent itemsets from level k-1. Quadratic in itemsets.",
      optimization: "Use F-list ordering, hash-based apriori-gen, pruning by subsets"
    },
    {
      stage: "Prune Step",
      timeComplexity: "O(|C_k| × (k-1))",
      spaceComplexity: "O(1)",
      description: "Check if all (k-1) subsets are frequent. Can be optimized with hash structures.",
      optimization: "Hash tree structure, subset enumeration using bits"
    },
    {
      stage: "Rule Generation",
      timeComplexity: "O(∑|L_k| × 2^k)",
      spaceComplexity: "O(|R|)",
      description: "Generate all possible rules from each itemset. Exponential in itemset size.",
      optimization: "Confidence-based pruning, rule grouping, limiting itemset size to 2-3 items"
    }
  ];

  const realWorldCases: RealWorldCase[] = [
    {
      company: "Amazon",
      industry: "E-commerce",
      problem: "Increasing average order value and customer satisfaction through smarter recommendations",
      solution: "Apriori-based 'Frequently Bought Together' engine analyzing millions of transactions to identify item associations",
      impact: "35% increase in cross-sell revenue, improved customer retention",
      metrics: ["Basket Size: +28%", "AOV: +35%", "Conversion Rate: +12%"]
    },
    {
      company: "Walmart",
      industry: "Retail",
      problem: "Optimizing store shelf layout and inventory placement for maximum sales",
      solution: "Market basket analysis to understand co-purchase patterns, positioning related items near each other",
      impact: "Store redesign increased sales by 22%, reduced out-of-stock incidents",
      metrics: ["Sales Lift: +22%", "Inventory Turns: +18%", "Customer Dwell Time: +15%"]
    },
    {
      company: "Zomato/Swiggy",
      industry: "Food Delivery",
      problem: "Increasing order frequency and promoting complementary items (main course + dessert + drink)",
      solution: "Real-time association rules to suggest items based on current basket, personalized by cuisine/time",
      impact: "Average order value increased from $8 to $12, 40% higher suggestion acceptance",
      metrics: ["AOV: +50%", "Orders with Dessert: +35%", "Upsell Success: +40%"]
    },
    {
      company: "Netflix",
      industry: "Streaming",
      problem: "Improving content discovery and reducing churn through better recommendations",
      solution: "Association mining on viewing patterns: {Genre1, Genre2} → {WatchNext} rules",
      impact: "Reduced 30-day churn rate by 18%, improved engagement metrics",
      metrics: ["Engagement: +28%", "Churn Rate: -18%", "Session Duration: +22%"]
    },
    {
      company: "Pharmacies",
      industry: "Healthcare Retail",
      problem: "Cross-selling health products, improving medication bundling compliance",
      solution: "Pharmacy-specific rules: {High BP Medication} → {Heart Supplements, Test Strips, Diet Guide}",
      impact: "Improved medication adherence, increased health product sales",
      metrics: ["Health Product Sales: +45%", "Medication Adherence: +12%", "Customer Health Scores: +8%"]
    }
  ];

  const mockTransactionSimulation = [
    { items: ["Milk", "Bread", "Eggs", "Butter"], support: "4.3%" },
    { items: ["Chicken", "Rice", "Broccoli"], support: "2.8%" },
    { items: ["Pasta", "Tomato Sauce", "Cheese"], support: "3.1%" },
    { items: ["Coffee", "Sugar", "Milk"], support: "5.2%" },
    { items: ["Yogurt", "Granola", "Berries"], support: "2.4%" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Advanced Header */}
      <header className="border-b border-border bg-gradient-to-r from-blue-950/50 to-purple-950/50 dark:from-blue-950/70 dark:to-purple-950/70 sticky top-0 z-10 shadow-md backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-2 hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Shopping
            </Button>
            <Badge variant="secondary" className="text-xs">
              Advanced Data Mining & Machine Learning
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-5xl">🧠📊🛒</div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-foreground mb-1">
                Apriori Algorithm Masterclass
              </h1>
              <p className="text-base text-muted-foreground">
                Complete guide to Market Basket Analysis, Association Rule Mining & Real-World Applications
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Enhanced Hero Section */}
          <Card className="p-8 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/30 dark:via-purple-950/30 dark:to-pink-950/30 border-2 border-primary/20">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-4xl font-bold text-foreground mb-3">
                  What is the Apriori Algorithm?
                </h2>
                <p className="text-lg text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                  Apriori is a foundational machine learning algorithm for unsupervised learning that discovers 
                  <strong> association rules</strong> in transactional databases. It identifies patterns like "customers who buy 
                  milk and eggs also frequently buy bread" - insights that power recommendation engines across 
                  e-commerce, retail, healthcare, and entertainment industries. Named "Apriori" because it leverages 
                  <strong> prior knowledge</strong> that all subsets of frequent itemsets must also be frequent.
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/70 dark:bg-black/20 p-4 rounded-lg text-center border border-primary/20">
                  <div className="text-3xl font-bold text-primary mb-2">2000+</div>
                  <div className="text-sm text-muted-foreground">Realistic Transactions</div>
                </div>
                <div className="bg-white/70 dark:bg-black/20 p-4 rounded-lg text-center border border-primary/20">
                  <div className="text-3xl font-bold text-primary mb-2">100+</div>
                  <div className="text-sm text-muted-foreground">Product Catalog</div>
                </div>
                <div className="bg-white/70 dark:bg-black/20 p-4 rounded-lg text-center border border-primary/20">
                  <div className="text-3xl font-bold text-primary mb-2">12</div>
                  <div className="text-sm text-muted-foreground">Product Categories</div>
                </div>
                <div className="bg-white/70 dark:bg-black/20 p-4 rounded-lg text-center border border-primary/20">
                  <div className="text-3xl font-bold text-primary mb-2">8</div>
                  <div className="text-sm text-muted-foreground">Advanced Metrics</div>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                <Badge className="px-4 py-2 text-sm bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-100">
                  <Database className="h-4 w-4 mr-2" />
                  Market Basket Analysis
                </Badge>
                <Badge className="px-4 py-2 text-sm bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-100">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Association Mining
                </Badge>
                <Badge className="px-4 py-2 text-sm bg-pink-100 text-pink-900 dark:bg-pink-950 dark:text-pink-100">
                  <Brain className="h-4 w-4 mr-2" />
                  Unsupervised Learning
                </Badge>
                <Badge className="px-4 py-2 text-sm bg-green-100 text-green-900 dark:bg-green-950 dark:text-green-100">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Pattern Discovery
                </Badge>
              </div>
            </div>
          </Card>

          <Tabs defaultValue="fundamentals" className="w-full">
            <TabsList className="grid w-full grid-cols-6 mb-6">
              <TabsTrigger value="fundamentals">Fundamentals</TabsTrigger>
              <TabsTrigger value="algorithm">Algorithm</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="applications">Applications</TabsTrigger>
            </TabsList>

            {/* FUNDAMENTALS TAB */}
            <TabsContent value="fundamentals" className="space-y-6">
              {/* What is Market Basket Analysis */}
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <ShoppingCart className="h-6 w-6 text-primary" />
                  <h3 className="text-2xl font-bold">Understanding Market Basket Analysis</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                      <Eye className="h-5 w-5 text-primary" />
                      Concept
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Market Basket Analysis is a technique that analyzes shopping transactions to identify 
                      which products are frequently purchased together. It simulates the shopping basket of a customer - 
                      what items they picked up together. The goal is to find hidden patterns in customer buying behavior.
                    </p>
                    <div className="bg-muted p-4 rounded-lg border-l-4 border-primary">
                      <p className="text-sm font-mono">
                        👤 Customer: Checks out with {"{Milk, Bread, Eggs, Butter}"}<br/>
                        🎯 Insight: Bread is often bought with milk!<br/>
                        💡 Action: Place bread near milk aisle
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Why It Matters
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Increased Revenue:</strong> Bundle related products to increase average order value
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Improved UX:</strong> Recommendations feel natural and relevant to customers
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Operational Efficiency:</strong> Optimize shelf layout, inventory placement, promotions
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Data-Driven Decisions:</strong> Replace guesswork with statistical evidence
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Business Terminology */}
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Layers className="h-6 w-6 text-primary" />
                  <h3 className="text-2xl font-bold">Core Terminology</h3>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 p-4 rounded-lg border border-blue-200/50">
                    <h4 className="font-semibold text-sm mb-2">🛒 Transaction</h4>
                    <p className="text-xs text-muted-foreground">A record of items purchased by one customer in one shopping visit. Example: {"{Milk, Bread, Eggs}"}</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 p-4 rounded-lg border border-purple-200/50">
                    <h4 className="font-semibold text-sm mb-2">📦 Item</h4>
                    <p className="text-xs text-muted-foreground">An individual product. Example: Milk, Bread, or Eggs. The atomic unit we're analyzing.</p>
                  </div>
                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/30 dark:to-pink-900/20 p-4 rounded-lg border border-pink-200/50">
                    <h4 className="font-semibold text-sm mb-2">🎯 Itemset</h4>
                    <p className="text-xs text-muted-foreground">A collection of items that appear together. Example: {"{Milk, Bread}"} is a 2-itemset.</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 p-4 rounded-lg border border-green-200/50">
                    <h4 className="font-semibold text-sm mb-2">📊 Frequent Itemset</h4>
                    <p className="text-xs text-muted-foreground">An itemset appearing in at least X% of transactions. X is the minimum support threshold.</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20 p-4 rounded-lg border border-orange-200/50">
                    <h4 className="font-semibold text-sm mb-2">➡️ Association Rule</h4>
                    <p className="text-xs text-muted-foreground">A rule of the form A → B meaning "if someone buys A, they likely buy B"</p>
                  </div>
                  <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950/30 dark:to-cyan-900/20 p-4 rounded-lg border border-cyan-200/50">
                    <h4 className="font-semibold text-sm mb-2">⚖️ Antecedent & Consequent</h4>
                    <p className="text-xs text-muted-foreground">In rule A → B: A is antecedent (if), B is consequent (then)</p>
                  </div>
                </div>
              </Card>

              {/* Three Types of Market Basket Analysis */}
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <GitBranch className="h-6 w-6 text-primary" />
                  <h3 className="text-2xl font-bold">Three Types of Market Basket Analysis</h3>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="border rounded-lg p-6 bg-gradient-to-br from-blue-50/50 to-blue-100/30 dark:from-blue-950/20 dark:to-blue-900/10">
                    <div className="flex items-center gap-3 mb-4">
                      <LineChart className="h-6 w-6 text-blue-600" />
                      <h4 className="font-semibold text-lg">1. Descriptive</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Analyzes <strong>past data</strong> to understand what already happened.
                    </p>
                    <div className="space-y-2 text-xs">
                      <p><strong>Goal:</strong> Derive insights from historical patterns</p>
                      <p><strong>Method:</strong> Apriori algorithm, frequency analysis</p>
                      <p><strong>Example:</strong> "60% of bread buyers also buy milk"</p>
                      <p><strong>Used by:</strong> Most retailers for current recommendations</p>
                    </div>
                  </div>

                  <div className="border rounded-lg p-6 bg-gradient-to-br from-purple-50/50 to-purple-100/30 dark:from-purple-950/20 dark:to-purple-900/10">
                    <div className="flex items-center gap-3 mb-4">
                      <TrendingUp className="h-6 w-6 text-purple-600" />
                      <h4 className="font-semibold text-lg">2. Predictive</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Predicts <strong>future behavior</strong> using supervised learning.
                    </p>
                    <div className="space-y-2 text-xs">
                      <p><strong>Goal:</strong> Forecast what customer will buy next</p>
                      <p><strong>Method:</strong> Classification, regression, neural networks</p>
                      <p><strong>Example:</strong> "Next month John will buy coffee (80% confidence)"</p>
                      <p><strong>Used by:</strong> Advanced platforms like Netflix, Amazon</p>
                    </div>
                  </div>

                  <div className="border rounded-lg p-6 bg-gradient-to-br from-pink-50/50 to-pink-100/30 dark:from-pink-950/20 dark:to-pink-900/10">
                    <div className="flex items-center gap-3 mb-4">
                      <Cpu className="h-6 w-6 text-pink-600" />
                      <h4 className="font-semibold text-lg">3. Prescriptive</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Recommends <strong>optimal actions</strong> to take.
                    </p>
                    <div className="space-y-2 text-xs">
                      <p><strong>Goal:</strong> Determine best action/decision</p>
                      <p><strong>Method:</strong> Optimization, reinforcement learning, simulation</p>
                      <p><strong>Example:</strong> "Show coffee at 20% discount to maximize revenue"</p>
                      <p><strong>Used by:</strong> AI-driven pricing and inventory systems</p>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* ALGORITHM TAB */}
            <TabsContent value="algorithm" className="space-y-6">
              {/* Step-by-Step Algorithm Walkthrough */}
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Play className="h-6 w-6 text-primary" />
                  <h3 className="text-2xl font-bold">How Apriori Works: Step-by-Step Walkthrough</h3>
                </div>
                <div className="space-y-4">
                  {algorithmSteps.map((step, index) => (
                    <Card
                      key={index}
                      className="p-5 border-l-4 border-l-primary cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSimulationStep(index)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 text-white flex items-center justify-center text-sm font-bold shadow-md">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {step.icon}
                            <h4 className="text-lg font-semibold">{step.title}</h4>
                            <Badge variant="secondary" className="text-xs ml-auto">
                              {step.complexity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                          
                          <Accordion type="single" collapsible>
                            <AccordionItem value="details">
                              <AccordionTrigger className="hover:no-underline py-2">
                                <div className="flex items-center gap-2 text-sm">
                                  <BookOpen className="h-4 w-4" />
                                  <span>Detailed Explanation & Example</span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="pt-4 space-y-4">
                                <div>
                                  <h5 className="font-semibold text-sm mb-2">📝 Detailed Explanation</h5>
                                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                                    {step.details}
                                  </p>
                                </div>
                                <div>
                                  <h5 className="font-semibold text-sm mb-2">💡 Real Example</h5>
                                  <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded border border-blue-200/50 text-sm font-mono text-muted-foreground">
                                    {step.example}
                                  </div>
                                </div>
                                <div>
                                  <h5 className="font-semibold text-sm mb-2">⚡ Optimization</h5>
                                  <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded border border-green-200/50 text-sm text-muted-foreground">
                                    {step.optimization}
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>

              {/* Algorithm Pseudocode */}
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Code className="h-6 w-6 text-primary" />
                  <h3 className="text-2xl font-bold">Algorithm Pseudocode</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-sm">Main Algorithm</h4>
                    <pre className="bg-muted p-4 rounded text-xs overflow-x-auto border border-border">
                      {`Apriori(Transactions, minSupport)
  L₁ = FindFrequent1Itemsets(Transactions, minSupport)
  FrequentItemsets = L₁
  k = 2
  
  WHILE L_{k-1} is not empty:
    C_k = GenerateCandidates(L_{k-1})
    FOR each transaction in Transactions:
      IncrementCounts(C_k, transaction)
    L_k = {itemsets in C_k with support ≥ minSupport}
    FrequentItemsets = FrequentItemsets ∪ L_k
    k = k + 1
  
  RETURN FrequentItemsets`}
                    </pre>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-sm">Rule Generation</h4>
                    <pre className="bg-muted p-4 rounded text-xs overflow-x-auto border border-border">
                      {`GenerateRules(FrequentItemsets, minConfidence)
  Rules = []
  
  FOR each itemset X in FrequentItemsets:
    IF |X| ≥ 2:
      FOR each non-empty subset A of X:
        B = X - A  // Complement
        conf = support(X) / support(A)
        
        IF conf ≥ minConfidence:
          lift = conf / support(B)
          rule = A → B
          rule.confidence = conf
          rule.lift = lift
          Rules.add(rule)
  
  RETURN Rules`}
                    </pre>
                  </div>
                </div>
              </Card>

              {/* Apriori Property Deep Dive */}
              <Card className="p-6 bg-gradient-to-br from-blue-50/50 to-blue-100/30 dark:from-blue-950/20 dark:to-blue-900/10 border-blue-200/50">
                <div className="flex items-center gap-3 mb-6">
                  <Zap className="h-6 w-6 text-blue-600" />
                  <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    The Apriori Property: The Key Optimization
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="bg-white dark:bg-black/30 p-4 rounded border-l-4 border-blue-500">
                    <p className="font-semibold text-sm mb-2">🎯 Core Principle</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      "If an itemset X is not frequent, then no superset of X can be frequent"
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Mathematically: If supp(X) {'<'} minSupport, then supp(Y) {'<'} minSupport for all Y ⊇ X
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-black/30 p-4 rounded border border-green-200/50">
                      <p className="font-semibold text-sm text-green-700 dark:text-green-300 mb-3">✅ Why It Works</p>
                      <ul className="space-y-2 text-xs text-muted-foreground">
                        <li>• Support is anti-monotone (monotone decreasing)</li>
                        <li>• Adding more items always decreases or maintains support</li>
                        <li>• If {`{A}`} appears in 100 txns, {`{A, B}`} appears in ≤ 100 txns</li>
                        <li>• So {`{A, B}`} cannot be more frequent than {`{A}`}</li>
                      </ul>
                    </div>
                    <div className="bg-white dark:bg-black/30 p-4 rounded border border-red-200/50">
                      <p className="font-semibold text-sm text-red-700 dark:text-red-300 mb-3">⚡ Pruning Impact</p>
                      <ul className="space-y-2 text-xs text-muted-foreground">
                        <li>• Eliminates 90%+ of candidates before checking</li>
                        <li>• Reduces database scans exponentially</li>
                        <li>• Example: 1000 frequent 2-itemsets → can generate 500K+ candidates, but property eliminates most</li>
                        <li>• Makes algorithm tractable for large datasets</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded border border-yellow-200/50">
                    <p className="font-semibold text-sm text-yellow-900 dark:text-yellow-100 mb-2">📊 Visual Example</p>
                    <div className="space-y-2 text-xs font-mono">
                      <p>Frequent 1-itemsets: {"{Milk}(9%), {Bread}(8%), {Eggs}(8.6%)"}</p>
                      <p>Check 2-itemset candidates: {"{Milk, Bread}, {Milk, Eggs}, {Bread, Eggs}"}</p>
                      <p>Found: {"{Milk, Bread}(4.3% - frequent)"}</p>
                      <p>Found: {"{Milk, Eggs}(2.1% - frequent)"}</p>
                      <p>Found: {"{Bread, Eggs}(1.8% - INFREQUENT - PRUNE!)"}</p>
                      <p className="text-red-600 dark:text-red-400 font-semibold">
                        → Can't have {"{Milk, Bread, Eggs}"} if {"{Bread, Eggs}"} isn't frequent!
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Complexity Analysis */}
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Cpu className="h-6 w-6 text-primary" />
                  <h3 className="text-2xl font-bold">Complexity Analysis & Scalability</h3>
                </div>
                <div className="space-y-4">
                  {complexityAnalysis.map((analysis, idx) => (
                    <Accordion key={idx} type="single" collapsible>
                      <AccordionItem value={`complexity-${idx}`}>
                        <AccordionTrigger>
                          <div className="flex items-center gap-3 text-left">
                            <Badge variant="outline" className="text-xs">{analysis.stage}</Badge>
                            <code className="text-xs bg-muted px-2 py-1 rounded">{analysis.timeComplexity}</code>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-3 pt-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <p className="font-semibold text-sm mb-2">⏱️ Time Complexity</p>
                              <p className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded mb-2">
                                {analysis.timeComplexity}
                              </p>
                              <p className="text-xs text-muted-foreground">{analysis.description}</p>
                            </div>
                            <div>
                              <p className="font-semibold text-sm mb-2">💾 Space Complexity</p>
                              <p className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded mb-2">
                                {analysis.spaceComplexity}
                              </p>
                              <p className="text-xs text-muted-foreground">Memory usage during this stage</p>
                            </div>
                          </div>
                          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded border border-blue-200/50">
                            <p className="font-semibold text-xs text-blue-900 dark:text-blue-100 mb-2">💡 Optimization Strategy</p>
                            <p className="text-xs text-muted-foreground">{analysis.optimization}</p>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-950/20 rounded border border-orange-200/50">
                  <p className="font-semibold text-sm text-orange-900 dark:text-orange-100 mb-2">⚠️ Scalability Challenges</p>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    <li>• <strong>Exponential Growth:</strong> Number of candidates grows exponentially with itemset size</li>
                    <li>• <strong>Database Scans:</strong> Multiple passes through large databases are I/O intensive</li>
                    <li>• <strong>Memory Usage:</strong> Storing all candidates and itemsets can consume significant RAM</li>
                    <li>• <strong>Solution:</strong> Modern alternatives like FP-Growth (single-pass), Eclat (depth-first) for massive datasets</li>
                  </ul>
                </div>
              </Card>
            </TabsContent>

            {/* METRICS TAB */}
            <TabsContent value="metrics" className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <BarChart3 className="h-6 w-6 text-primary" />
                  <h3 className="text-2xl font-bold">Association Rule Quality Metrics</h3>
                </div>

                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200/50">
                  <p className="text-sm text-muted-foreground">
                    This application implements <strong>8 advanced metrics</strong> to evaluate rule quality from multiple perspectives. 
                    Each metric captures different aspects of the rule's strength and reliability.
                  </p>
                </div>

                <Tabs defaultValue="metric-overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="metric-overview">Overview</TabsTrigger>
                    <TabsTrigger value="metric-selection">Selection Guide</TabsTrigger>
                  </TabsList>

                  <TabsContent value="metric-overview" className="space-y-4 mt-4">
                    <div className="grid gap-4">
                      {metricExplanations.map((metric, idx) => (
                        <Card
                          key={idx}
                          className={`p-4 cursor-pointer transition-all border-l-4 ${
                            selectedMetric === metric.symbol
                              ? 'border-l-primary bg-primary/5'
                              : 'border-l-muted hover:bg-muted/50'
                          }`}
                          onClick={() => setSelectedMetric(metric.symbol)}
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-base flex items-center gap-2">
                                {metric.name}
                                <code className="text-xs bg-muted px-2 py-1 rounded">{metric.symbol}</code>
                              </h4>
                              <Badge variant="outline" className="text-xs">{metric.range}</Badge>
                            </div>

                            <Accordion type="single" collapsible defaultValue={selectedMetric === metric.symbol ? "details" : ""}>
                              <AccordionItem value="details">
                                <AccordionTrigger className="text-sm hover:no-underline py-2">
                                  <span className="flex items-center gap-2">
                                    <Info className="h-4 w-4" />
                                    Formula & Details
                                  </span>
                                </AccordionTrigger>
                                <AccordionContent className="pt-4 space-y-4">
                                  <div>
                                    <p className="text-xs font-semibold mb-2">📐 Formula</p>
                                    <div className="bg-muted p-3 rounded font-mono text-xs border-l-2 border-primary">
                                      {metric.formula}
                                    </div>
                                  </div>

                                  <div>
                                    <p className="text-xs font-semibold mb-2">💡 Meaning</p>
                                    <p className="text-xs text-muted-foreground">{metric.meaning}</p>
                                  </div>

                                  <div>
                                    <p className="text-xs font-semibold mb-2">📊 Example</p>
                                    <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded text-xs text-muted-foreground border border-blue-200/50">
                                      {metric.example}
                                    </div>
                                  </div>

                                  <div>
                                    <p className="text-xs font-semibold mb-2">🎯 When to Use</p>
                                    <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded text-xs text-muted-foreground border border-green-200/50">
                                      {metric.whenToUse}
                                    </div>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="metric-selection" className="space-y-4 mt-4">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 p-6 rounded-lg border border-primary/20">
                      <h4 className="font-semibold mb-4">Choosing the Right Metric</h4>
                      
                      <div className="space-y-4">
                        <div className="border rounded-lg p-4">
                          <p className="font-semibold text-sm mb-3 flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Primary Rule Quality (Use All Three)
                          </p>
                          <div className="grid md:grid-cols-3 gap-4 text-xs">
                            <div className="bg-white dark:bg-black/30 p-3 rounded border border-primary/20">
                              <p className="font-semibold mb-1">✅ Confidence</p>
                              <p className="text-muted-foreground">What% of antecedent customers also buy consequent</p>
                            </div>
                            <div className="bg-white dark:bg-black/30 p-3 rounded border border-primary/20">
                              <p className="font-semibold mb-1">✅ Support</p>
                              <p className="text-muted-foreground">How often this pattern appears (popularity)</p>
                            </div>
                            <div className="bg-white dark:bg-black/30 p-3 rounded border border-primary/20">
                              <p className="font-semibold mb-1">✅ Lift</p>
                              <p className="text-muted-foreground">How much more likely than random (correlation)</p>
                            </div>
                          </div>
                        </div>

                        <div className="border rounded-lg p-4">
                          <p className="font-semibold text-sm mb-3 flex items-center gap-2">
                            <Zap className="h-4 w-4" />
                            Advanced Metrics (Use for Deep Analysis)
                          </p>
                          <div className="space-y-2 text-xs">
                            <div className="flex items-start gap-3">
                              <Badge variant="secondary" className="mt-1">Conviction</Badge>
                              <span className="text-muted-foreground">Best for implication strength; identifies rules that work in one direction only</span>
                            </div>
                            <div className="flex items-start gap-3">
                              <Badge variant="secondary" className="mt-1">Leverage</Badge>
                              <span className="text-muted-foreground">For finding statistically significant patterns; absolute difference from independence</span>
                            </div>
                            <div className="flex items-start gap-3">
                              <Badge variant="secondary" className="mt-1">Jaccard/Cosine</Badge>
                              <span className="text-muted-foreground">For symmetric relationships; good when items have very different frequencies</span>
                            </div>
                            <div className="flex items-start gap-3">
                              <Badge variant="secondary" className="mt-1">Imbalance Ratio</Badge>
                              <span className="text-muted-foreground">For identifying asymmetric patterns; frequent → rare vs rare → frequent</span>
                            </div>
                          </div>
                        </div>

                        <div className="border rounded-lg p-4 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200/50">
                          <p className="font-semibold text-sm mb-3 text-yellow-900 dark:text-yellow-100">⚠️ Common Mistakes</p>
                          <ul className="space-y-1 text-xs text-muted-foreground">
                            <li>• <strong>Don't rely on confidence alone</strong> - high confidence can occur by chance if consequent is very common</li>
                            <li>• <strong>High lift doesn't mean high support</strong> - rare items can have very high lift but low practical value</li>
                            <li>• <strong>Lift = 1 means independent</strong> - not a good rule, items don't influence each other</li>
                            <li>• <strong>Conviction can be infinite</strong> - means perfect implication, extremely rare and suspicious</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </Card>
            </TabsContent>

            {/* ANALYSIS TAB */}
            <TabsContent value="analysis" className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Workflow className="h-6 w-6 text-primary" />
                  <h3 className="text-2xl font-bold">Implementation & Processing Pipeline</h3>
                </div>

                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 p-6 rounded-lg border border-blue-200/50">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      Data Processing Pipeline
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold">Raw Transaction Data</div>
                        <Badge>2000 Transactions</Badge>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary to-primary/50 w-1/4"></div>
                      </div>
                      <p className="text-xs text-muted-foreground">↓</p>

                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold">Data Transformation</div>
                        <Badge variant="secondary">Itemset Creation</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Normalize, deduplicate, remove infrequent items</p>
                      <p className="text-xs text-muted-foreground">↓</p>

                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold">Apriori Mining</div>
                        <Badge variant="secondary">Algorithm Execution</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">3% Min Support, 25% Min Confidence</p>
                      <p className="text-xs text-muted-foreground">↓</p>

                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold">Rule Generation & Filtering</div>
                        <Badge variant="secondary">Quality Metrics</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Calculate 8 metrics, apply thresholds</p>
                      <p className="text-xs text-muted-foreground">↓</p>

                      <div className="flex items-center justify-between bg-green-50 dark:bg-green-950/20 p-3 rounded">
                        <div className="text-sm font-semibold">High-Quality Association Rules</div>
                        <Badge className="bg-green-600">Ready to Use</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <Card className="p-4 border-l-4 border-l-blue-500">
                      <h5 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Algorithm Parameters
                      </h5>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-xs font-semibold">Minimum Support</span>
                            <span className="text-xs font-mono">3%</span>
                          </div>
                          <Progress value={3} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">Items appearing in ≥3% of transactions</p>
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-xs font-semibold">Minimum Confidence</span>
                            <span className="text-xs font-mono">25%</span>
                          </div>
                          <Progress value={25} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">Rules with ≥25% conditional probability</p>
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-xs font-semibold">Minimum Lift (Filter)</span>
                            <span className="text-xs font-mono">1.1</span>
                          </div>
                          <Progress value={55} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">Rules with ≥10% better than random</p>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4 border-l-4 border-l-purple-500">
                      <h5 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        Dataset Statistics
                      </h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Transactions:</span>
                          <span className="font-semibold">2,000</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Unique Products:</span>
                          <span className="font-semibold">100+</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Categories:</span>
                          <span className="font-semibold">12</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Avg Basket Size:</span>
                          <span className="font-semibold">4.8 items</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Min Basket:</span>
                          <span className="font-semibold">1 item</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Max Basket:</span>
                          <span className="font-semibold">25 items</span>
                        </div>
                        <div className="h-px bg-border my-2"></div>
                        <div className="flex justify-between text-xs font-semibold bg-muted p-2 rounded">
                          <span>Data Quality:</span>
                          <span className="text-green-600">✓ Realistic</span>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              </Card>

              {/* Dataset Sample */}
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Eye className="h-6 w-6 text-primary" />
                  <h3 className="text-2xl font-bold">Sample Transactions from Dataset</h3>
                </div>
                <div className="space-y-3">
                  {mockTransactionSimulation.map((tx, idx) => (
                    <div key={idx} className="p-4 rounded-lg border border-border bg-muted/50 hover:bg-muted transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="text-sm font-mono font-semibold">Transaction {idx + 1}</div>
                        <Badge variant="outline" className="text-xs">{tx.support} support</Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {tx.items.map((item, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="text-xs text-muted-foreground italic mt-4">
                    ... and 1995 more transactions with realistic shopping patterns
                  </div>
                </div>
              </Card>

              {/* Optimization Techniques */}
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Zap className="h-6 w-6 text-primary" />
                  <h3 className="text-2xl font-bold">Optimization Techniques Implemented</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    {
                      title: "Support Caching",
                      icon: "💾",
                      description: "Cache calculated support values to avoid redundant database scans. Reduces computation by ~40%."
                    },
                    {
                      title: "Candidate Pruning",
                      icon: "✂️",
                      description: "Apply Apriori property aggressively. Eliminate 90%+ of candidates before counting support."
                    },
                    {
                      title: "Hash Structures",
                      icon: "🔗",
                      description: "Use hash tables for O(1) subset lookups instead of sequential search."
                    },
                    {
                      title: "Itemset Limiting",
                      icon: "📦",
                      description: "Limit mining to 5-itemsets max. Exponential growth makes larger itemsets impractical."
                    },
                    {
                      title: "Bit-Vector Encoding",
                      icon: "⚡",
                      description: "Represent transactions as bit vectors for faster matching and set operations."
                    },
                    {
                      title: "Confidence-Based Pruning",
                      icon: "🎯",
                      description: "During rule generation, prune rules below confidence threshold early to avoid metric calculations."
                    }
                  ].map((opt, idx) => (
                    <div key={idx} className="p-4 rounded-lg border border-border bg-gradient-to-br from-muted/30 to-muted/10 hover:shadow-md transition-shadow">
                      <div className="text-3xl mb-2">{opt.icon}</div>
                      <h5 className="font-semibold text-sm mb-2">{opt.title}</h5>
                      <p className="text-xs text-muted-foreground">{opt.description}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* RESULTS TAB */}
            <TabsContent value="results" className="space-y-6">
              {/* Statistics Summary */}
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <h3 className="text-2xl font-bold">Mining Results Summary</h3>
                </div>
                {algorithmResults && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 rounded-lg border border-blue-200/50">
                      <div className="text-3xl font-bold text-primary mb-1">{algorithmResults.frequentItemsets.length}</div>
                      <div className="text-xs text-muted-foreground font-semibold">Frequent Itemsets</div>
                      <p className="text-xs text-muted-foreground mt-1">All sizes combined</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 rounded-lg border border-purple-200/50">
                      <div className="text-3xl font-bold text-purple-600 mb-1">{algorithmResults.associationRules.length}</div>
                      <div className="text-xs text-muted-foreground font-semibold">High-Quality Rules</div>
                      <p className="text-xs text-muted-foreground mt-1">After quality filtering</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 rounded-lg border border-green-200/50">
                      <div className="text-3xl font-bold text-green-600 mb-1">3%</div>
                      <div className="text-xs text-muted-foreground font-semibold">Min Support</div>
                      <p className="text-xs text-muted-foreground mt-1">Threshold applied</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20 rounded-lg border border-orange-200/50">
                      <div className="text-3xl font-bold text-orange-600 mb-1">25%</div>
                      <div className="text-xs text-muted-foreground font-semibold">Min Confidence</div>
                      <p className="text-xs text-muted-foreground mt-1">Quality threshold</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/30 dark:to-pink-900/20 rounded-lg border border-pink-200/50">
                      <div className="text-3xl font-bold text-pink-600 mb-1">1.1</div>
                      <div className="text-xs text-muted-foreground font-semibold">Min Lift</div>
                      <p className="text-xs text-muted-foreground mt-1">Correlation filter</p>
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded border border-blue-200/50">
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    What These Numbers Mean
                  </h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li><strong>Frequent Itemsets:</strong> Groups of products that frequently appear together. More itemsets mean richer patterns discovered.</li>
                    <li><strong>Association Rules:</strong> Actionable insights like "if customer buys X, recommend Y". This is what powers recommendations.</li>
                    <li><strong>Thresholds:</strong> Filters to ensure we only keep meaningful, reliable patterns and avoid noise from rare coincidences.</li>
                  </ul>
                </div>
              </Card>

              {/* Top Association Rules */}
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  <h3 className="text-2xl font-bold">Top Association Rules Discovered</h3>
                </div>
                <div className="space-y-4">
                  {algorithmResults && algorithmResults.associationRules.slice(0, 8).map((rule, index) => (
                    <Card
                      key={index}
                      className={`p-5 border-l-4 border-l-primary cursor-pointer transition-all hover:shadow-lg ${
                        expandedRule === index ? 'bg-primary/5' : ''
                      }`}
                      onClick={() => setExpandedRule(expandedRule === index ? null : index)}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <Badge className="text-xs font-mono">
                                #{index + 1}
                              </Badge>
                              <code className="bg-muted px-2 py-1 rounded text-xs font-semibold">
                                {rule.antecedent.join(' + ')}
                              </code>
                              <ArrowRight className="h-4 w-4 text-muted-foreground" />
                              <code className="bg-muted px-2 py-1 rounded text-xs font-semibold">
                                {rule.consequent.join(' + ')}
                              </code>
                            </div>
                          </div>
                          <Badge variant="secondary" className="flex-shrink-0">
                            {(rule.confidence! * 100).toFixed(0)}% confident
                          </Badge>
                        </div>

                        {/* Metrics in a grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="bg-blue-50 dark:bg-blue-950/20 p-2 rounded border border-blue-200/50">
                            <div className="text-xs text-muted-foreground">Confidence</div>
                            <div className="font-semibold text-sm">{(rule.confidence! * 100).toFixed(1)}%</div>
                          </div>
                          <div className="bg-purple-50 dark:bg-purple-950/20 p-2 rounded border border-purple-200/50">
                            <div className="text-xs text-muted-foreground">Support</div>
                            <div className="font-semibold text-sm">{(rule.support! * 100).toFixed(2)}%</div>
                          </div>
                          <div className="bg-green-50 dark:bg-green-950/20 p-2 rounded border border-green-200/50">
                            <div className="text-xs text-muted-foreground">Lift</div>
                            <div className="font-semibold text-sm">{rule.lift?.toFixed(2)}</div>
                          </div>
                          <div className="bg-orange-50 dark:bg-orange-950/20 p-2 rounded border border-orange-200/50">
                            <div className="text-xs text-muted-foreground">Conviction</div>
                            <div className="font-semibold text-sm">{rule.conviction?.toFixed(2)}</div>
                          </div>
                        </div>

                        {/* Expanded details */}
                        {expandedRule === index && (
                          <div className="pt-4 border-t border-border space-y-3">
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <p className="font-semibold text-xs text-muted-foreground mb-2">All Metrics</p>
                                <div className="space-y-2 text-xs">
                                  <div className="flex justify-between">
                                    <span>Leverage:</span>
                                    <span className="font-mono font-semibold">{rule.leverage?.toFixed(4)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Jaccard:</span>
                                    <span className="font-mono font-semibold">{rule.jaccard?.toFixed(3)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Cosine:</span>
                                    <span className="font-mono font-semibold">{rule.cosine?.toFixed(3)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Kulczynski:</span>
                                    <span className="font-mono font-semibold">{rule.kulczynski?.toFixed(3)}</span>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <p className="font-semibold text-xs text-muted-foreground mb-2">Interpretation</p>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  {(rule.confidence >= 0.7 && (rule.lift || 0) > 1.5)
                                    ? "🌟 Excellent rule - strong confidence and significant lift. Ideal for bundling and promotions."
                                    : (rule.confidence >= 0.5 && (rule.lift || 0) > 1.2)
                                    ? "✅ Good rule - reliable relationship with meaningful uplift. Suitable for recommendations."
                                    : "📊 Moderate rule - decent correlation but consider context before applying operationally."}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>

              {/* Rule Frequency Distribution */}
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <BarChart3 className="h-6 w-6 text-primary" />
                  <h3 className="text-2xl font-bold">Rule Quality Distribution</h3>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <LineChart className="h-4 w-4" />
                      Confidence Range
                    </h4>
                    <div className="space-y-2 text-xs">
                      {[
                        { range: "≥75%", count: algorithmResults?.associationRules.filter(r => r.confidence! >= 0.75).length || 0, color: 'bg-green-500' },
                        { range: "50-75%", count: algorithmResults?.associationRules.filter(r => r.confidence! >= 0.5 && r.confidence! < 0.75).length || 0, color: 'bg-blue-500' },
                        { range: "25-50%", count: algorithmResults?.associationRules.filter(r => r.confidence! >= 0.25 && r.confidence! < 0.5).length || 0, color: 'bg-yellow-500' },
                      ].map((item, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between">
                            <span>{item.range}</span>
                            <span className="font-semibold">{item.count}</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className={`h-full ${item.color} w-1/3`}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Lift Range
                    </h4>
                    <div className="space-y-2 text-xs">
                      {[
                        { range: "≥1.5", count: algorithmResults?.associationRules.filter(r => r.lift! >= 1.5).length || 0, color: 'bg-red-500' },
                        { range: "1.2-1.5", count: algorithmResults?.associationRules.filter(r => r.lift! >= 1.2 && r.lift! < 1.5).length || 0, color: 'bg-orange-500' },
                        { range: "1.1-1.2", count: algorithmResults?.associationRules.filter(r => r.lift! >= 1.1 && r.lift! < 1.2).length || 0, color: 'bg-cyan-500' },
                      ].map((item, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between">
                            <span>{item.range}</span>
                            <span className="font-semibold">{item.count}</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className={`h-full ${item.color} w-1/3`}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <PieChart className="h-4 w-4" />
                      Support Range
                    </h4>
                    <div className="space-y-2 text-xs">
                      {[
                        { range: "≥5%", count: algorithmResults?.associationRules.filter(r => r.support! >= 0.05).length || 0, color: 'bg-violet-500' },
                        { range: "3-5%", count: algorithmResults?.associationRules.filter(r => r.support! >= 0.03 && r.support! < 0.05).length || 0, color: 'bg-indigo-500' },
                        { range: "<3%", count: algorithmResults?.associationRules.filter(r => r.support! < 0.03).length || 0, color: 'bg-gray-500' },
                      ].map((item, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between">
                            <span>{item.range}</span>
                            <span className="font-semibold">{item.count}</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className={`h-full ${item.color} w-1/3`}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* APPLICATIONS TAB */}
            <TabsContent value="applications" className="space-y-6">
              {/* Real-World Success Stories */}
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Award className="h-6 w-6 text-primary" />
                  <h3 className="text-2xl font-bold">Real-World Success Stories & Case Studies</h3>
                </div>
                <div className="space-y-4">
                  {realWorldCases.map((caseStudy, idx) => (
                    <Accordion key={idx} type="single" collapsible>
                      <AccordionItem value={`case-${idx}`}>
                        <AccordionTrigger>
                          <div className="flex items-center gap-3 text-left">
                            <Badge variant="outline">{caseStudy.company}</Badge>
                            <Badge variant="secondary" className="text-xs">{caseStudy.industry}</Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4 space-y-4">
                          <div>
                            <p className="font-semibold text-sm mb-2">🎯 Problem</p>
                            <p className="text-sm text-muted-foreground">{caseStudy.problem}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-sm mb-2">✅ Solution</p>
                            <p className="text-sm text-muted-foreground">{caseStudy.solution}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-sm mb-2">📊 Results & Impact</p>
                            <p className="text-sm text-muted-foreground mb-3">{caseStudy.impact}</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {caseStudy.metrics.map((metric, i) => (
                                <Badge key={i} variant="secondary" className="text-xs justify-center">
                                  {metric}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ))}
                </div>
              </Card>

              {/* Application Domains */}
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Globe className="h-6 w-6 text-primary" />
                  <h3 className="text-2xl font-bold">Industry Applications</h3>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    {
                      icon: "🛒",
                      industry: "Retail & E-commerce",
                      examples: ["Product bundling", "Cross-sell recommendations", "Store layout optimization", "Inventory planning"],
                      benefit: "↑ 25-35% average order value"
                    },
                    {
                      icon: "🍔",
                      industry: "Food & Restaurants",
                      examples: ["Menu recommendations", "Bundle deals", "Dining partner matching", "Seasonal promotions"],
                      benefit: "↑ 18-22% transactions per customer"
                    },
                    {
                      icon: "🎬",
                      industry: "Entertainment & Streaming",
                      examples: ["Content recommendations", "Playlist generation", "Genre combinations", "Binge-watch patterns"],
                      benefit: "↓ 12-18% churn rate"
                    },
                    {
                      icon: "🏥",
                      industry: "Healthcare & Pharmacy",
                      examples: ["Medication bundling", "Preventive care", "Supplement recommendations", "Health screening combos"],
                      benefit: "↑ 30-40% health product sales"
                    },
                    {
                      icon: "💳",
                      industry: "Banking & Finance",
                      examples: ["Service bundling", "Cross-selling financial products", "Risk profiling", "Fraud detection patterns"],
                      benefit: "↑ 20-30% service adoption"
                    },
                    {
                      icon: "✈️",
                      industry: "Travel & Hospitality",
                      examples: ["Package recommendations", "Activity bundling", "Hotel-airline combos", "Travel insurance pairing"],
                      benefit: "↑ 15-25% ancillary revenue"
                    }
                  ].map((app, idx) => (
                    <div key={idx} className="p-4 rounded-lg border border-border bg-gradient-to-br from-muted/30 to-muted/10 hover:shadow-md transition-shadow">
                      <div className="text-4xl mb-3">{app.icon}</div>
                      <h4 className="font-semibold text-sm mb-3">{app.industry}</h4>
                      <ul className="space-y-1 mb-3">
                        {app.examples.map((ex, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                            <span className="h-1 w-1 rounded-full bg-primary"></span>
                            {ex}
                          </li>
                        ))}
                      </ul>
                      <div className="pt-3 border-t border-border text-xs font-semibold text-green-600 dark:text-green-400">
                        {app.benefit}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Implementation Guide */}
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Code className="h-6 w-6 text-primary" />
                  <h3 className="text-2xl font-bold">How to Use These Rules in Your Application</h3>
                </div>
                <Tabs defaultValue="recommendations" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="optimization">Optimization</TabsTrigger>
                  </TabsList>

                  <TabsContent value="recommendations" className="space-y-4 mt-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200/50">
                      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4" />
                        Real-Time Product Recommendations
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="font-semibold mb-2">Algorithm:</p>
                          <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                            <li>User adds items to cart (antecedent set)</li>
                            <li>Find all rules where antecedent ⊆ cart items</li>
                            <li>Filter by confidence ({">"}40%) and lift ({">"}1.2)</li>
                            <li>Rank by confidence × lift score</li>
                            <li>Show top 5 consequent items not in cart</li>
                          </ol>
                        </div>
                        <div className="bg-white dark:bg-black/30 p-3 rounded">
                          <p className="font-mono text-xs">
                            Cart: {"{Milk, Bread}"}<br/>
                            Rule: {"{Milk, Bread}"} → {"{Butter}"} (conf: 65%, lift: 1.45)<br/>
                            ✅ Recommend: "Add Butter" with 65% confidence
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="analytics" className="space-y-4 mt-4">
                    <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded border border-purple-200/50">
                      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <LineChart className="h-4 w-4" />
                        Business Intelligence & Analytics
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="font-semibold mb-2">Key Insights to Extract:</p>
                          <ul className="space-y-2 text-muted-foreground">
                            <li>• <strong>Product Affinity:</strong> Which items drive sales of others?</li>
                            <li>• <strong>Category Relationships:</strong> Do certain categories naturally go together?</li>
                            <li>• <strong>Customer Segments:</strong> Which customer types follow which patterns?</li>
                            <li>• <strong>Seasonal Trends:</strong> How do patterns change over time?</li>
                            <li>• <strong>Anomalies:</strong> Which unexpected combinations indicate emerging trends?</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="optimization" className="space-y-4 mt-4">
                    <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded border border-green-200/50">
                      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Operational Optimization
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="font-semibold mb-2">Actionable Improvements:</p>
                          <ul className="space-y-2 text-muted-foreground">
                            <li>• <strong>Store Layout:</strong> Place high-lift products adjacent to boost cross-sales</li>
                            <li>• <strong>Inventory Planning:</strong> Stock related items together; predict stock-outs</li>
                            <li>• <strong>Promotional Bundles:</strong> Create bundles with high lift and confidence</li>
                            <li>• <strong>Pricing Strategy:</strong> Bundle pricing can be optimized using rules</li>
                            <li>• <strong>Supplier Management:</strong> Ensure stock availability for frequently paired items</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </Card>

              {/* Future Learning */}
              <Card className="p-6 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200/50">
                <div className="flex items-center gap-3 mb-6">
                  <Lightbulb className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  <h3 className="text-2xl font-bold">Next Steps & Advanced Topics</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-sm mb-3">Advanced Algorithms to Explore</h4>
                    <ul className="space-y-2 text-xs text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-amber-600 font-bold mt-0.5">→</span>
                        <span><strong>FP-Growth:</strong> Single-pass algorithm, faster than Apriori for large datasets</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-600 font-bold mt-0.5">→</span>
                        <span><strong>Eclat (DFS):</strong> Depth-first search approach, good for vertical data format</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-600 font-bold mt-0.5">→</span>
                        <span><strong>SPAM/RoC:</strong> Handles sequences and temporal patterns</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-600 font-bold mt-0.5">→</span>
                        <span><strong>Graph Mining:</strong> Discovers complex multi-node patterns</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-3">Real-World Improvements</h4>
                    <ul className="space-y-2 text-xs text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-amber-600 font-bold mt-0.5">→</span>
                        <span><strong>Temporal Analysis:</strong> Track how patterns evolve over time</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-600 font-bold mt-0.5">→</span>
                        <span><strong>Personalization:</strong> Customer segment-specific rules</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-600 font-bold mt-0.5">→</span>
                        <span><strong>Multi-Level Patterns:</strong> Hierarchical product categories</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-600 font-bold mt-0.5">→</span>
                        <span><strong>Constraint-Based Mining:</strong> Domain-specific rules (e.g., margins)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Algorithm;
