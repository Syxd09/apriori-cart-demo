import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
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
                onClick={() => navigate('/segmentation')}
              >
                <BarChart3 className="h-5 w-5 mr-2" />
                Try Customer Segments
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center gap-6 pt-4 border-t border-border/50">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-6 h-6 bg-yellow-400 rounded-full border-2 border-white flex items-center justify-center text-xs" role="img" aria-label="Star">⭐</div>
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
              <div className="text-9xl mb-4 animate-bounce" role="img" aria-label="Shopping cart animation">🛒</div>
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
  );
};

export default HeroSection;
