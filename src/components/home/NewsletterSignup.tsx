import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const NewsletterSignup = () => {
  return (
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
  );
};

export default NewsletterSignup;
