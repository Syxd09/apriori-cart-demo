import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface ProductCardSkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export const ProductCardSkeleton = ({ className, style }: ProductCardSkeletonProps) => {
  return (
    <Card className={`p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer border-0 shadow-md animate-slide-in ${className}`} style={style}>
      <div className="text-center mb-4">
        <Skeleton className="w-16 h-16 rounded-full mx-auto mb-3" />
        <Skeleton className="h-4 w-16 mx-auto mb-2" />
      </div>
      <div className="text-center mb-4">
        <Skeleton className="h-6 w-24 mx-auto mb-2" />
        <Skeleton className="h-8 w-20 mx-auto" />
      </div>
      <Skeleton className="h-10 w-full" />
    </Card>
  );
};

interface RecommendationCardSkeletonProps {
  className?: string;
}

export const RecommendationCardSkeleton = ({ className }: RecommendationCardSkeletonProps) => {
  return (
    <Card className={`p-3 hover:shadow-md transition-all cursor-pointer border-recommendation-border ${className}`}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-1">
          <Skeleton className="w-6 h-6 rounded" />
          <div className="flex-1">
            <Skeleton className="h-4 w-20 mb-1" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <Skeleton className="h-8 w-12" />
      </div>
      <div className="flex items-start gap-2 text-sm">
        <Skeleton className="w-4 h-4 mt-0.5 shrink-0" />
        <div className="flex-1">
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </div>
    </Card>
  );
};

interface CartItemSkeletonProps {
  className?: string;
}

export const CartItemSkeleton = ({ className }: CartItemSkeletonProps) => {
  return (
    <div className={`flex items-center gap-4 p-4 rounded-lg bg-card border hover:shadow-sm transition-all animate-slide-in group ${className}`}>
      <Skeleton className="w-12 h-12 rounded" />
      <div className="flex-1 min-w-0">
        <Skeleton className="h-5 w-24 mb-1" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-4 w-8" />
        <Skeleton className="h-8 w-8" />
      </div>
      <div className="text-right flex-shrink-0">
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
};