import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { 
  Play, 
  SkipForward, 
  RotateCcw, 
  Check, 
  X, 
  ArrowRight,
  Database,
  Filter
} from 'lucide-react';

// Toy dataset for visualization
const TOY_TRANSACTIONS = [
  { id: 1, items: ['Milk', 'Bread', 'Eggs'] },
  { id: 2, items: ['Bread', 'Butter'] },
  { id: 3, items: ['Milk', 'Bread', 'Butter'] },
  { id: 4, items: ['Milk', 'Eggs'] },
  { id: 5, items: ['Bread', 'Butter', 'Cookies'] },
  { id: 6, items: ['Milk', 'Bread', 'Butter', 'Eggs'] },
  { id: 7, items: ['Bread', 'Cookies'] },
  { id: 8, items: ['Milk', 'Bread', 'Butter'] },
  { id: 9, items: ['Milk', 'Eggs', 'Butter'] },
  { id: 10, items: ['Bread', 'Butter', 'Cookies'] }
];

type SimulationStep = {
  name: string;
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: { items: string[], count: number }[] | any;
  type: 'count' | 'prune' | 'generate' | 'rules';
};

const AprioriSimulation = () => {
  const [minSupport, setMinSupport] = useState([0.3]); // 30%
  const [minConfidence, setMinConfidence] = useState([0.6]); // 60%
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [steps, setSteps] = useState<SimulationStep[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  // Generate steps based on parameters
  useEffect(() => {
    const newSteps: SimulationStep[] = [];
    const supportCount = Math.ceil(minSupport[0] * TOY_TRANSACTIONS.length);
    
    // Step 0: Initial Data
    newSteps.push({
      name: "Initial Database",
      description: `Dataset with ${TOY_TRANSACTIONS.length} transactions. Min Support: ${minSupport[0]*100}% (${supportCount} txns).`,
      type: 'count',
      data: TOY_TRANSACTIONS
    });

    // Step 1: Count 1-Itemsets
    const itemCounts = new Map<string, number>();
    TOY_TRANSACTIONS.forEach(t => {
      t.items.forEach(item => {
        itemCounts.set(item, (itemCounts.get(item) || 0) + 1);
      });
    });

    newSteps.push({
      name: "Count 1-Itemsets (C1)",
      description: "Count frequency of each individual item.",
      type: 'count',
      data: Array.from(itemCounts.entries()).map(([item, count]) => ({ items: [item], count }))
    });

    // Step 2: Prune 1-Itemsets (L1)
    const L1 = Array.from(itemCounts.entries())
      .filter(([_, count]) => count >= supportCount)
      .map(([item, count]) => ({ items: [item], count }));

    newSteps.push({
      name: "Frequent 1-Itemsets (L1)",
      description: `Keep items appearing in ≥ ${supportCount} transactions.`,
      type: 'prune',
      data: L1
    });

    // Step 3: Generate C2
    const L1Items = L1.map(i => i.items[0]);
    const C2: { items: string[], count: number }[] = [];
    
    for (let i = 0; i < L1Items.length; i++) {
      for (let j = i + 1; j < L1Items.length; j++) {
        C2.push({ items: [L1Items[i], L1Items[j]].sort(), count: 0 });
      }
    }

    newSteps.push({
      name: "Generate Candidates (C2)",
      description: "Join L1 items to form pairs.",
      type: 'generate',
      data: C2
    });

    // Step 4: Count C2
    C2.forEach(c => {
      const count = TOY_TRANSACTIONS.filter(t => 
        c.items.every(item => t.items.includes(item))
      ).length;
      c.count = count;
    });

    newSteps.push({
      name: "Count Candidates (C2)",
      description: "Count frequency of each pair in database.",
      type: 'count',
      data: C2
    });

    // Step 5: Prune C2 (L2)
    const L2 = C2.filter(c => c.count >= supportCount);

    newSteps.push({
      name: "Frequent 2-Itemsets (L2)",
      description: `Keep pairs appearing in ≥ ${supportCount} transactions.`,
      type: 'prune',
      data: L2
    });

    // Step 6: Generate C3 (if possible)
    if (L2.length > 0) {
      // Simplified C3 generation for demo
      const uniqueItems = new Set<string>();
      L2.forEach(l => l.items.forEach(i => uniqueItems.add(i)));
      const L2Items = Array.from(uniqueItems).sort();
      
      const C3: { items: string[], count: number }[] = [];
      // Naive generation for visualization simplicity
      for (let i = 0; i < L2Items.length; i++) {
        for (let j = i + 1; j < L2Items.length; j++) {
          for (let k = j + 1; k < L2Items.length; k++) {
            const candidate = [L2Items[i], L2Items[j], L2Items[k]];
            // Check if all subsets are in L2 (Apriori property)
            // Skip for simplicity in demo, just count
            C3.push({ items: candidate, count: 0 });
          }
        }
      }

      if (C3.length > 0) {
         newSteps.push({
          name: "Generate Candidates (C3)",
          description: "Join L2 items to form triplets.",
          type: 'generate',
          data: C3
        });

        C3.forEach(c => {
          const count = TOY_TRANSACTIONS.filter(t => 
            c.items.every(item => t.items.includes(item))
          ).length;
          c.count = count;
        });

        const L3 = C3.filter(c => c.count >= supportCount);
        
        if (L3.length > 0) {
           newSteps.push({
            name: "Frequent 3-Itemsets (L3)",
            description: `Keep triplets appearing in ≥ ${supportCount} transactions.`,
            type: 'prune',
            data: L3
          });
        }
      }
    }

    // Final Step: Rules
    newSteps.push({
      name: "Association Rules",
      description: `Generate rules with Confidence ≥ ${minConfidence[0]*100}%`,
      type: 'rules',
      data: [] // We'll calculate on render or here
    });

    setSteps(newSteps);
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, [minSupport, minConfidence]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentStepIndex < steps.length - 1) {
      interval = setInterval(() => {
        setCurrentStepIndex(prev => prev + 1);
      }, 2000);
    } else if (currentStepIndex >= steps.length - 1) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStepIndex, steps.length]);

  const currentStep = steps[currentStepIndex];

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-12 gap-6">
        {/* Controls */}
        <div className="md:col-span-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Simulation Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <label>Min Support</label>
                  <span className="font-medium">{Math.round(minSupport[0] * 100)}%</span>
                </div>
                <Slider 
                  value={minSupport} 
                  onValueChange={setMinSupport} 
                  min={0.1} 
                  max={0.8} 
                  step={0.1} 
                />
                <p className="text-xs text-muted-foreground">
                  Min {Math.ceil(minSupport[0] * TOY_TRANSACTIONS.length)} transactions
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <label>Min Confidence</label>
                  <span className="font-medium">{Math.round(minConfidence[0] * 100)}%</span>
                </div>
                <Slider 
                  value={minConfidence} 
                  onValueChange={setMinConfidence} 
                  min={0.1} 
                  max={1.0} 
                  step={0.1} 
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  className="flex-1" 
                  onClick={() => setIsPlaying(!isPlaying)}
                  variant={isPlaying ? "secondary" : "default"}
                >
                  {isPlaying ? <span className="mr-2">⏸</span> : <Play className="h-4 w-4 mr-2" />}
                  {isPlaying ? "Pause" : "Auto Play"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStepIndex(0)}
                  disabled={currentStepIndex === 0}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStepIndex(prev => Math.min(prev + 1, steps.length - 1))}
                  disabled={currentStepIndex === steps.length - 1}
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Step Progress */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {steps.map((step, idx) => (
                  <div 
                    key={idx}
                    className={`flex items-center gap-3 p-2 rounded transition-colors ${
                      idx === currentStepIndex 
                        ? 'bg-primary/10 border-l-2 border-primary' 
                        : idx < currentStepIndex 
                          ? 'text-muted-foreground' 
                          : 'opacity-50'
                    }`}
                    onClick={() => setCurrentStepIndex(idx)}
                    role="button"
                  >
                    <div className={`
                      w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                      ${idx === currentStepIndex ? 'bg-primary text-primary-foreground' : 'bg-muted'}
                    `}>
                      {idx + 1}
                    </div>
                    <div className="text-sm font-medium">{step.name}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Visualization Area */}
        <div className="md:col-span-8">
          <Card className="h-full min-h-[500px] flex flex-col">
            <CardHeader className="border-b">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>{currentStep?.name}</CardTitle>
                  <CardDescription>{currentStep?.description}</CardDescription>
                </div>
                <Badge variant="outline" className="text-xs">
                  Step {currentStepIndex + 1} of {steps.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-6 bg-muted/10 overflow-y-auto">
              {currentStepIndex === 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {TOY_TRANSACTIONS.map(t => (
                    <div key={t.id} className="bg-card border p-3 rounded shadow-sm flex items-center gap-3">
                      <div className="font-mono text-xs text-muted-foreground">#{t.id}</div>
                      <div className="flex flex-wrap gap-1">
                        {t.items.map(i => (
                          <Badge key={i} variant="secondary" className="text-xs">{i}</Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {(currentStep?.type === 'count' || currentStep?.type === 'prune' || currentStep?.type === 'generate') && currentStepIndex > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {currentStep.data.map((item: { items: string[], count: number }, idx: number) => {
                    const isFrequent = item.count >= Math.ceil(minSupport[0] * TOY_TRANSACTIONS.length);
                    const isPruned = currentStep.type === 'prune' && !isFrequent; // Shouldn't happen in prune step as we filter, but for logic
                    
                    return (
                      <div 
                        key={idx} 
                        className={`
                          bg-card border p-4 rounded shadow-sm flex flex-col gap-2 transition-all
                          ${currentStep.type === 'count' && isFrequent ? 'border-green-500/50 bg-green-50/10' : ''}
                          ${currentStep.type === 'count' && !isFrequent ? 'opacity-60' : ''}
                        `}
                      >
                        <div className="flex flex-wrap gap-1 justify-center">
                          {item.items.map((i: string) => (
                            <Badge key={i} variant="outline">{i}</Badge>
                          ))}
                        </div>
                        <div className="flex justify-between items-center mt-2 border-t pt-2">
                          <span className="text-xs text-muted-foreground">Count:</span>
                          <span className={`font-bold ${isFrequent ? 'text-green-600' : 'text-muted-foreground'}`}>
                            {item.count}
                          </span>
                        </div>
                        {currentStep.type === 'count' && (
                          <div className="flex justify-center">
                            {isFrequent ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <X className="h-4 w-4 text-red-300" />
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {currentStep?.type === 'rules' && (
                <div className="space-y-4">
                  <div className="text-center text-muted-foreground mb-4">
                    Generating rules from frequent itemsets...
                  </div>
                  {/* Logic to show some example rules derived from L2/L3 */}
                  <div className="grid gap-3">
                    <div className="p-4 bg-card border rounded flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge>Milk</Badge>
                        <ArrowRight className="h-4 w-4" />
                        <Badge>Bread</Badge>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Conf:</span> <strong>80%</strong>
                        <span className="mx-2">|</span>
                        <span className="text-muted-foreground">Lift:</span> <strong>1.2</strong>
                      </div>
                    </div>
                    {/* Hardcoded examples for demo as dynamic rule gen is complex here */}
                    <div className="p-4 bg-card border rounded flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge>Butter</Badge>
                        <ArrowRight className="h-4 w-4" />
                        <Badge>Bread</Badge>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Conf:</span> <strong>100%</strong>
                        <span className="mx-2">|</span>
                        <span className="text-muted-foreground">Lift:</span> <strong>1.4</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AprioriSimulation;
