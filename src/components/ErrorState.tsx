import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home, Search, ShoppingCart } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  className?: string;
}

export const ErrorState = ({
  title = "Something went wrong",
  message = "We encountered an unexpected error. Please try again.",
  icon = <AlertTriangle className="h-12 w-12 text-destructive" />,
  action,
  secondaryAction,
  className = ""
}: ErrorStateProps) => {
  return (
    <Card className={`p-8 text-center ${className}`}>
      <div className="flex justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">{message}</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {action && (
          <Button onClick={action.onClick} className="min-w-[120px]">
            {action.icon}
            {action.label}
          </Button>
        )}
        {secondaryAction && (
          <Button variant="outline" onClick={secondaryAction.onClick} className="min-w-[120px]">
            {secondaryAction.icon}
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </Card>
  );
};

interface EmptyStateProps {
  title: string;
  message: string;
  icon: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  className?: string;
}

export const EmptyState = ({
  title,
  message,
  icon,
  action,
  className = ""
}: EmptyStateProps) => {
  return (
    <Card className={`p-8 text-center ${className}`}>
      <div className="flex justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">{message}</p>
      {action && (
        <Button onClick={action.onClick} className="min-w-[120px]">
          {action.icon}
          {action.label}
        </Button>
      )}
    </Card>
  );
};

// Specific error states
export const NetworkErrorState = ({ onRetry }: { onRetry?: () => void }) => (
  <ErrorState
    title="Connection Error"
    message="Unable to connect to the server. Please check your internet connection and try again."
    icon={<AlertTriangle className="h-12 w-12 text-orange-500" />}
    action={onRetry ? {
      label: "Try Again",
      onClick: onRetry,
      icon: <RefreshCw className="h-4 w-4 mr-2" />
    } : undefined}
  />
);

export const NotFoundErrorState = ({ onGoHome }: { onGoHome?: () => void }) => (
  <ErrorState
    title="Page Not Found"
    message="The page you're looking for doesn't exist or has been moved."
    icon={<Search className="h-12 w-12 text-muted-foreground" />}
    action={onGoHome ? {
      label: "Go Home",
      onClick: onGoHome,
      icon: <Home className="h-4 w-4 mr-2" />
    } : undefined}
  />
);

// Specific empty states
export const EmptyCartState = ({ onStartShopping }: { onStartShopping?: () => void }) => (
  <EmptyState
    title="Your cart is empty"
    message="Add some delicious items to your cart and discover personalized recommendations!"
    icon={<ShoppingCart className="h-12 w-12 text-muted-foreground" />}
    action={onStartShopping ? {
      label: "Start Shopping",
      onClick: onStartShopping,
      icon: <ShoppingCart className="h-4 w-4 mr-2" />
    } : undefined}
  />
);

export const NoProductsState = ({ onClearFilters }: { onClearFilters?: () => void }) => (
  <EmptyState
    title="No products found"
    message="Try adjusting your search criteria or browse all products."
    icon={<Search className="h-12 w-12 text-muted-foreground" />}
    action={onClearFilters ? {
      label: "Clear Filters",
      onClick: onClearFilters,
      icon: <RefreshCw className="h-4 w-4 mr-2" />
    } : undefined}
  />
);

export const NoRecommendationsState = () => (
  <EmptyState
    title="No recommendations yet"
    message="Add more items to your cart to discover products that other customers frequently buy together!"
    icon={<div className="text-4xl">💡</div>}
  />
);