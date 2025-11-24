import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { 
  Users, 
  ShoppingBag, 
  TrendingUp, 
  Zap, 
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { CUSTOMER_SEGMENTS } from '@/lib/data';
import { generateBasketForSegment, runAprioriAlgorithm, EnhancedAssociationRule } from '@/lib/apriori';
import { safeSync } from '@/lib/errorHandler';
import { toast } from 'sonner';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const CustomerSegmentation = () => {
  const [selectedSegmentType, setSelectedSegmentType] = useState(CUSTOMER_SEGMENTS[0].type);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationData, setSimulationData] = useState<{
    transactions: string[][];
    rules: EnhancedAssociationRule[];
    topProducts: { name: string; count: number }[];
    categoryStats: { name: string; value: number }[];
  } | null>(null);

  const selectedSegment = useMemo(() => 
    CUSTOMER_SEGMENTS.find(s => s.type === selectedSegmentType) || CUSTOMER_SEGMENTS[0],
    [selectedSegmentType]
  );

  const handleSimulate = () => {
    setIsSimulating(true);
    
    // Use setTimeout to allow UI to update before heavy computation
    setTimeout(() => {
      const result = safeSync(() => {
        // Generate 50 transactions for this segment
        const transactions: string[][] = [];
        for (let i = 0; i < 50; i++) {
          const basket = generateBasketForSegment(selectedSegment);
          if (basket.length > 0) transactions.push(basket);
        }

        // Run Apriori on this small dataset
        // Lower thresholds because dataset is small (50 txns)
        const { associationRules } = runAprioriAlgorithm(transactions, 0.1, 0.3);

        // Calculate stats
        const productCounts = new Map<string, number>();
        const categoryCounts = new Map<string, number>();

        transactions.flat().forEach(product => {
          productCounts.set(product, (productCounts.get(product) || 0) + 1);
        });

        // Get top products
        const topProducts = Array.from(productCounts.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        // We don't have category info directly in transaction strings, 
        // but we can infer from preferred categories of the segment for visualization
        // or we'd need to look up products in catalog. 
        // For simplicity, let's just use the segment's preferred categories distribution
        // based on the generated products if we look them up, but that's expensive.
        // Let's just visualize the top products for now.

        return {
          transactions,
          rules: associationRules,
          topProducts,
          categoryStats: [] // Placeholder
        };
      }, 'simulateSegmentBehavior');

      if (result.error) {
        toast.error("Simulation failed");
      } else if (result.data) {
        setSimulationData(result.data);
        toast.success(`Generated ${result.data.transactions.length} shopping trips!`);
      }
      
      setIsSimulating(false);
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header */}
      <div className="bg-card border-b border-border mb-8">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Customer Segmentation</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Analyze different customer personas and their shopping behaviors. 
            The Apriori algorithm adapts recommendations based on these segment patterns.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Sidebar - Segment List */}
          <div className="lg:col-span-3 space-y-4">
            <h2 className="font-semibold text-lg mb-4">Select Segment</h2>
            {CUSTOMER_SEGMENTS.map((segment) => (
              <Card 
                key={segment.type}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedSegmentType === segment.type 
                    ? 'border-primary ring-1 ring-primary bg-primary/5' 
                    : 'hover:border-primary/50'
                }`}
                onClick={() => {
                  setSelectedSegmentType(segment.type);
                  setSimulationData(null); // Reset simulation
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setSelectedSegmentType(segment.type);
                    setSimulationData(null);
                  }
                }}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold capitalize">{segment.type.replace('_', ' ')}</span>
                    {selectedSegmentType === segment.type && (
                      <Badge variant="default" className="h-5 w-5 p-0 flex items-center justify-center rounded-full">
                        ✓
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex justify-between">
                      <span>Basket Size:</span>
                      <span className="font-medium text-foreground">{segment.basketSize.min}-{segment.basketSize.max} items</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Frequency:</span>
                      <span className="font-medium text-foreground">{(segment.frequencyWeight * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Content - Analysis */}
          <div className="lg:col-span-9 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="text-2xl capitalize flex items-center gap-2">
                      {selectedSegment.type.replace('_', ' ')} Shopper
                      <Badge variant="outline" className="text-xs font-normal">
                        {(selectedSegment.frequencyWeight * 100).toFixed(0)}% of customers
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Typically shops for: {selectedSegment.preferredCategories.join(', ')}
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={handleSimulate} 
                    disabled={isSimulating}
                    className="w-full sm:w-auto"
                  >
                    {isSimulating ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Simulating...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Simulate Behavior
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {!simulationData ? (
                  <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
                    <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No Simulation Data</h3>
                    <p className="text-muted-foreground max-w-md mx-auto mb-6">
                      Click "Simulate Behavior" to generate synthetic transactions based on this customer segment's patterns and run the Apriori algorithm.
                    </p>
                    <Button variant="outline" onClick={handleSimulate}>
                      Start Simulation
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-8 animate-in fade-in duration-500">
                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                        <div className="text-sm text-muted-foreground mb-1">Transactions Analyzed</div>
                        <div className="text-2xl font-bold text-primary">{simulationData.transactions.length}</div>
                      </div>
                      <div className="p-4 bg-accent/5 rounded-lg border border-accent/10">
                        <div className="text-sm text-muted-foreground mb-1">Rules Discovered</div>
                        <div className="text-2xl font-bold text-accent-foreground">{simulationData.rules.length}</div>
                      </div>
                      <div className="p-4 bg-secondary/5 rounded-lg border border-secondary/10">
                        <div className="text-sm text-muted-foreground mb-1">Avg Basket Size</div>
                        <div className="text-2xl font-bold text-secondary-foreground">
                          {(simulationData.transactions.reduce((acc, t) => acc + t.length, 0) / simulationData.transactions.length).toFixed(1)}
                        </div>
                      </div>
                    </div>

                    <Tabs defaultValue="products">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="products">Top Products</TabsTrigger>
                        <TabsTrigger value="rules">Association Rules</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="products" className="pt-4">
                        <div className="h-[300px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={simulationData.topProducts} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                              <XAxis type="number" />
                              <YAxis type="category" dataKey="name" width={120} tick={{fontSize: 12}} />
                              <RechartsTooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                              />
                              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="rules" className="pt-4">
                        {simulationData.rules.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            No strong association rules found for this small sample.
                          </div>
                        ) : (
                          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                            {simulationData.rules.slice(0, 10).map((rule, idx) => (
                              <div key={idx} className="p-3 bg-card border rounded-lg flex items-center justify-between hover:shadow-sm transition-shadow">
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-2 text-sm">
                                    <span className="font-medium bg-muted px-2 py-1 rounded">{rule.antecedent.join(' + ')}</span>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium bg-primary/10 text-primary px-2 py-1 rounded">{rule.consequent.join(' + ')}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <div className="flex flex-col items-end">
                                    <span className="font-bold text-foreground">{(rule.confidence * 100).toFixed(0)}%</span>
                                    <span>Confidence</span>
                                  </div>
                                  <div className="w-px h-8 bg-border"></div>
                                  <div className="flex flex-col items-end">
                                    <span className="font-bold text-foreground">{rule.lift.toFixed(1)}x</span>
                                    <span>Lift</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSegmentation;
