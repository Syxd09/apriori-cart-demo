import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Package, BarChart3, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FeatureHighlights = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: "Customer Segmentation",
      description: "Simulate shopping behaviors for different customer personas like 'Health Nut' or 'Budget Shopper'.",
      icon: <Users className="h-8 w-8 text-blue-500" />,
      link: "/segmentation",
      color: "bg-blue-50 dark:bg-blue-950/20 border-blue-200/50"
    },
    {
      title: "Smart Bundles",
      description: "Discover AI-curated product bundles that save you money, generated from real association rules.",
      icon: <Package className="h-8 w-8 text-purple-500" />,
      link: "/bundles",
      color: "bg-purple-50 dark:bg-purple-950/20 border-purple-200/50"
    },
    {
      title: "Market Basket Analysis",
      description: "Explore the data behind the recommendations with interactive charts and rule mining tools.",
      icon: <BarChart3 className="h-8 w-8 text-green-500" />,
      link: "/analysis",
      color: "bg-green-50 dark:bg-green-950/20 border-green-200/50"
    }
  ];

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Explore AI Features</h2>
          <p className="text-muted-foreground">See the power of the Apriori algorithm in action</p>
        </div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        {features.map((feature, idx) => (
          <Card 
            key={idx} 
            className={`transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer ${feature.color}`}
            onClick={() => navigate(feature.link)}
          >
            <CardHeader>
              <div className="mb-4 p-3 bg-background rounded-xl w-fit shadow-sm">
                {feature.icon}
              </div>
              <CardTitle className="text-xl">{feature.title}</CardTitle>
              <CardDescription className="text-base mt-2">
                {feature.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="group p-0 hover:bg-transparent">
                Try it out 
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default FeatureHighlights;
