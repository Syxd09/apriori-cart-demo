import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ZAxis,
  Legend
} from 'recharts';
import { 
  Search, 
  Filter, 
  Download, 
  BarChart3, 
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { runAprioriAlgorithm, sampleTransactions } from '@/lib/apriori';
import { useAprioriWorker } from '@/hooks/useAprioriWorker';
import { safeSync } from '@/lib/errorHandler';
import { toast } from 'sonner';
import type { AprioriRule } from '@/types';

const MarketBasketAnalysis = () => {
  const { runAlgorithm, isLoading, result } = useAprioriWorker();
  const [rules, setRules] = useState<AprioriRule[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [minSupport, setMinSupport] = useState([0.01]);
  const [minConfidence, setMinConfidence] = useState([0.1]);
  const [minLift, setMinLift] = useState([1.0]);

  useEffect(() => {
    // Initial run
    const cachedRules = localStorage.getItem('smartmart-apriori-rules');
    if (cachedRules) {
      setRules(JSON.parse(cachedRules));
    } else {
      runAlgorithm(sampleTransactions, 0.01, 0.1);
    }
  }, [runAlgorithm]);

  useEffect(() => {
    if (result) {
      setRules(result.associationRules);
      localStorage.setItem('smartmart-apriori-rules', JSON.stringify(result.associationRules));
      toast.success(`Analysis complete: ${result.associationRules.length} rules found`);
    }
  }, [result]);

  const filteredRules = useMemo(() => {
    return rules.filter(rule => {
      const matchesSearch = searchQuery === "" || 
        rule.antecedent.some(i => i.toLowerCase().includes(searchQuery.toLowerCase())) ||
        rule.consequent.some(i => i.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesMetrics = 
        rule.support >= minSupport[0] &&
        rule.confidence >= minConfidence[0] &&
        rule.lift >= minLift[0];

      return matchesSearch && matchesMetrics;
    });
  }, [rules, searchQuery, minSupport, minConfidence, minLift]);

  const scatterData = useMemo(() => {
    return filteredRules.map(rule => ({
      x: rule.support,
      y: rule.confidence,
      z: rule.lift,
      name: `${rule.antecedent.join('+')} -> ${rule.consequent.join('+')}`,
      lift: rule.lift
    }));
  }, [filteredRules]);

  const handleRecalculate = () => {
    runAlgorithm(sampleTransactions, minSupport[0], minConfidence[0]);
    toast.info("Calculation started in background...");
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header */}
      <div className="bg-card border-b border-border mb-8">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Market Basket Analysis</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Deep dive into transaction patterns. Explore association rules, filter by metrics, 
            and visualize relationships between products.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Controls Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filters</CardTitle>
                <CardDescription>Refine analysis parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search Products</label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="e.g. Milk, Bread..." 
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <label className="font-medium">Min Support</label>
                      <span className="text-muted-foreground">{minSupport[0]}</span>
                    </div>
                    <Slider 
                      value={minSupport} 
                      onValueChange={setMinSupport} 
                      min={0.001} 
                      max={0.1} 
                      step={0.001} 
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <label className="font-medium">Min Confidence</label>
                      <span className="text-muted-foreground">{minConfidence[0]}</span>
                    </div>
                    <Slider 
                      value={minConfidence} 
                      onValueChange={setMinConfidence} 
                      min={0.1} 
                      max={1.0} 
                      step={0.05} 
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <label className="font-medium">Min Lift</label>
                      <span className="text-muted-foreground">{minLift[0]}</span>
                    </div>
                    <Slider 
                      value={minLift} 
                      onValueChange={setMinLift} 
                      min={1.0} 
                      max={5.0} 
                      step={0.1} 
                    />
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  onClick={handleRecalculate}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Filter className="h-4 w-4 mr-2" />
                  )}
                  Recalculate Rules
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardContent className="p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Rules:</span>
                  <span className="font-medium">{rules.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Filtered:</span>
                  <span className="font-medium">{filteredRules.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9 space-y-8">
            {/* Visualization */}
            <Card>
              <CardHeader>
                <CardTitle>Rule Distribution</CardTitle>
                <CardDescription>
                  Support vs Confidence (Size = Lift)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                      <CartesianGrid />
                      <XAxis type="number" dataKey="x" name="Support" unit="" label={{ value: 'Support', position: 'insideBottomRight', offset: -10 }} />
                      <YAxis type="number" dataKey="y" name="Confidence" unit="" label={{ value: 'Confidence', angle: -90, position: 'insideLeft' }} />
                      <ZAxis type="number" dataKey="z" range={[50, 400]} name="Lift" unit="x" />
                      <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
                      <Scatter name="Rules" data={scatterData} fill="hsl(var(--primary))" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Rules Table */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Association Rules</CardTitle>
                  <CardDescription>Detailed list of discovered patterns</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Antecedent (If buy...)</TableHead>
                        <TableHead></TableHead>
                        <TableHead>Consequent (Then buy...)</TableHead>
                        <TableHead className="text-right">Support</TableHead>
                        <TableHead className="text-right">Confidence</TableHead>
                        <TableHead className="text-right">Lift</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRules.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            No rules match your filters. Try adjusting the sliders.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredRules.slice(0, 20).map((rule, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">
                              {rule.antecedent.map(item => (
                                <Badge key={item} variant="outline" className="mr-1 mb-1">{item}</Badge>
                              ))}
                            </TableCell>
                            <TableCell>
                              <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            </TableCell>
                            <TableCell>
                              {rule.consequent.map(item => (
                                <Badge key={item} variant="secondary" className="mr-1 mb-1">{item}</Badge>
                              ))}
                            </TableCell>
                            <TableCell className="text-right">{(rule.support * 100).toFixed(1)}%</TableCell>
                            <TableCell className="text-right">{(rule.confidence * 100).toFixed(0)}%</TableCell>
                            <TableCell className="text-right font-bold text-primary">{rule.lift.toFixed(2)}x</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                {filteredRules.length > 20 && (
                  <div className="text-center mt-4 text-sm text-muted-foreground">
                    Showing top 20 of {filteredRules.length} matching rules
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

export default MarketBasketAnalysis;
