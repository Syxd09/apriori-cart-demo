import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

const Testimonials = () => {
  return (
    <div className="mt-12 mb-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-4">Loved by Thousands of Shoppers</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Join our community of smart shoppers who save time and discover amazing products
        </p>
        <div className="flex justify-center items-center gap-4 mt-4">
          <div className="flex items-center gap-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="font-semibold">4.9/5</span>
          </div>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">10,000+ Happy Customers</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">98% Satisfaction Rate</span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {[
          {
            name: "Sarah Johnson",
            role: "Busy Mom",
            rating: 5,
            comment: "SmartMart saved me 2 hours of shopping last week! The AI knew exactly what my family needed - from organic milk to kids' snacks. The recommendations were spot-on and I discovered products I never would have found otherwise.",
            avatar: "👩‍👧‍👦",
            highlight: "Saved 2 hours weekly",
            verified: true
          },
          {
            name: "Mike Chen",
            role: "Tech Professional",
            rating: 5,
            comment: "As someone who hates grocery shopping, this is a game-changer. The personalized suggestions based on my previous purchases are incredibly accurate. I went from spending ₹3,200 to ₹2,800 monthly while eating better!",
            avatar: "👨‍💻",
            highlight: "₹400 monthly savings",
            verified: true
          },
          {
            name: "Priya Patel",
            role: "Health Enthusiast",
            rating: 5,
            comment: "The Apriori algorithm understands my dietary preferences perfectly. It suggested organic alternatives and health supplements I needed. My nutrition has improved dramatically and I feel more energetic!",
            avatar: "👩‍⚕️",
            highlight: "Better health outcomes",
            verified: true
          }
        ].map((testimonial, idx) => (
          <Card key={idx} className="p-6 hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 bg-primary text-white text-xs px-2 py-1 rounded-bl-lg font-medium">
              {testimonial.verified && "✓ Verified"}
            </div>

            <div className="text-center mb-4">
              <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">
                {testimonial.avatar}
              </div>
              <div className="flex justify-center mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-5 w-5 ${i < testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                ))}
              </div>
              <Badge className="bg-green-100 text-green-800 mb-2">
                {testimonial.highlight}
              </Badge>
            </div>

            <blockquote className="text-muted-foreground mb-4 leading-relaxed">
              "{testimonial.comment}"
            </blockquote>

            <div className="text-center">
              <p className="font-bold text-foreground">{testimonial.name}</p>
              <p className="text-sm text-muted-foreground">{testimonial.role}</p>
            </div>

            {/* Decorative element */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20"></div>
          </Card>
        ))}
      </div>

      {/* Call to Action */}
      <div className="text-center mt-8">
        <p className="text-muted-foreground mb-4">Ready to join thousands of satisfied customers?</p>
        <Button
          size="lg"
          className="px-8"
          onClick={() => document.getElementById('products-heading')?.scrollIntoView({ behavior: 'smooth' })}
        >
          Start Your Smart Shopping Journey
        </Button>
      </div>
    </div>
  );
};

export default Testimonials;
