import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  ShoppingCart,
  Eye,
  X,
  TrendingUp,
  Info,
  ChevronDown,
  ChevronUp,
  Star,
  Zap,
  Target,
  BarChart3
} from "lucide-react";
import type { RecommendationCardProps, AssociationRule } from "@/types";

interface ExtendedRecommendationCardProps extends RecommendationCardProps {
  rule?: AssociationRule;
  onDismiss?: () => void;
  showDismiss?: boolean;
  className?: string;
}

const RecommendationCard: React.FC<ExtendedRecommendationCardProps> = ({
  recommendation,
  product,
  rule,
  onAddToCart,
  onViewDetails,
  onDismiss,
  showDismiss = true,
  showConfidence = true,
  className = ""
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600 bg-green-50 border-green-200";
    if (confidence >= 0.6) return "text-blue-600 bg-blue-50 border-blue-200";
    if (confidence >= 0.4) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getSupportColor = (support: number) => {
    if (support >= 0.3) return "text-purple-600 bg-purple-50 border-purple-200";
    if (support >= 0.2) return "text-indigo-600 bg-indigo-50 border-indigo-200";
    if (support >= 0.1) return "text-cyan-600 bg-cyan-50 border-cyan-200";
    return "text-gray-600 bg-gray-50 border-gray-200";
  };

  const getLiftColor = (lift?: number) => {
    if (!lift) return "text-gray-600 bg-gray-50 border-gray-200";
    if (lift >= 2) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (lift >= 1.5) return "text-teal-600 bg-teal-50 border-teal-200";
    if (lift >= 1.2) return "text-orange-600 bg-orange-50 border-orange-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  return (
    <TooltipProvider>
      <Card className={`p-4 hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20 ${className}`}>
        <div className="flex items-start gap-4">
          {/* Product Image/Emoji */}
          <div className="flex-shrink-0">
            {product.imageUrls && product.imageUrls.length > 0 ? (
              <img
                src={product.imageUrls[0]}
                alt={product.name}
                className="w-16 h-16 object-cover rounded-lg border"
              />
            ) : (
              <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center text-2xl border" role="img" aria-label={`${product.name} emoji`}>
                {product.emoji}
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Header with Product Info */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex-1">
                <h3 className="font-bold text-foreground text-lg line-clamp-1 mb-1">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{product.brand}</span>
                  <span>•</span>
                  <span>{product.category}</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < Math.floor(product.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                  <span className="text-xs text-muted-foreground ml-1">
                    {product.rating.toFixed(1)} ({product.reviewCount})
                  </span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-xl font-bold text-primary mb-1">
                  ₹{product.price.toFixed(2)}
                </div>
                {showConfidence && (
                  <Badge className={`text-xs ${getConfidenceColor(recommendation.confidence)}`}>
                    {(recommendation.confidence * 100).toFixed(0)}% confidence
                  </Badge>
                )}
              </div>
            </div>

            {/* Rule Explanation */}
            <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg p-3 border border-primary/10 mb-3">
              <div className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm mb-1">
                    Why recommended: Frequently bought with {recommendation.reason.join(" and ")}
                  </p>
                  <p className="text-xs text-muted-foreground mb-2">
                    Customers who bought{" "}
                    <span className="font-medium text-primary">
                      {recommendation.reason.join(" and ")}
                    </span>{" "}
                    also purchased this item
                  </p>

                  {/* Quality Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="space-y-1">
                          <div className={`font-medium ${getConfidenceColor(recommendation.confidence).split(' ')[0]}`}>
                            {(recommendation.confidence * 100).toFixed(1)}% Confidence
                          </div>
                          <Progress
                            value={recommendation.confidence * 100}
                            className="h-1.5"
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          <strong>Confidence:</strong> Probability that customers who buy the antecedent items also buy this product.
                          Higher confidence means stronger association.
                        </p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="space-y-1">
                          <div className={`font-medium ${getSupportColor(recommendation.support).split(' ')[0]}`}>
                            {(recommendation.support * 100).toFixed(1)}% Support
                          </div>
                          <Progress
                            value={recommendation.support * 100}
                            className="h-1.5"
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          <strong>Support:</strong> Frequency of this rule in the transaction data.
                          Higher support means the pattern occurs more often.
                        </p>
                      </TooltipContent>
                    </Tooltip>

                    {rule?.lift && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="space-y-1">
                            <div className={`font-medium ${getLiftColor(rule.lift).split(' ')[0]}`}>
                              {rule.lift.toFixed(1)}x Lift
                            </div>
                            <Progress
                              value={Math.min(rule.lift * 20, 100)}
                              className="h-1.5"
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            <strong>Lift:</strong> How much more likely this combination occurs than by chance.
                            Lift greater than 1 indicates a positive association.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    )}

                    {rule?.conviction && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="space-y-1">
                            <div className="font-medium text-pink-600">
                              {rule.conviction.toFixed(1)} Conviction
                            </div>
                            <Progress
                              value={Math.min(rule.conviction * 10, 100)}
                              className="h-1.5"
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            <strong>Conviction:</strong> Measures the implication strength.
                            Higher values indicate stronger rules.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Expandable Rule Details */}
            {rule && (
              <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full justify-between p-2 h-auto text-xs">
                    <span className="flex items-center gap-1">
                      <BarChart3 className="h-3 w-3" />
                      Rule Details
                    </span>
                    {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 mt-2 p-3 bg-muted/50 rounded-lg">
                  <div className="text-xs space-y-1">
                    <div>
                      <strong>Antecedent:</strong> {rule.antecedent.join(" + ")}
                    </div>
                    <div>
                      <strong>Consequent:</strong> {rule.consequent.join(" + ")}
                    </div>
                    <div className="pt-1 border-t">
                      <strong>How Apriori Works:</strong>
                      <p className="text-muted-foreground mt-1">
                        The Apriori algorithm finds frequent itemsets by iteratively generating candidate sets
                        and pruning those that don't meet minimum support thresholds. This rule was discovered
                        from analyzing {Math.round(recommendation.support * 10000)} out of 10,000+ transactions.
                      </p>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2 mt-3">
              <Button
                size="sm"
                onClick={() => onAddToCart?.(product)}
                className="flex-1"
                disabled={!product.inStock}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </Button>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetails?.(product)}
                  >
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View details</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View product details</p>
                </TooltipContent>
              </Tooltip>

              {showDismiss && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDismiss}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Dismiss</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Dismiss recommendation</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </div>

        {/* Algorithm Education Footer */}
        <div className="mt-3 pt-3 border-t border-border/50">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-xs text-muted-foreground cursor-help">
                <Zap className="h-3 w-3" />
                <span>Powered by Apriori Algorithm</span>
                <Info className="h-3 w-3" />
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-sm">
              <div className="space-y-2">
                <p className="font-medium">What is Apriori?</p>
                <p className="text-xs">
                  Apriori is a classic algorithm for finding frequent itemsets and association rules
                  in transactional data. It works by identifying patterns like "customers who buy bread
                  often also buy butter" to make personalized recommendations.
                </p>
                <p className="text-xs font-medium text-primary">
                  This recommendation is based on real shopping patterns from thousands of transactions!
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
      </Card>
    </TooltipProvider>
  );
};

export default RecommendationCard;