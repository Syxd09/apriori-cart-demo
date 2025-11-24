// Core product and cart types
export interface Product {
  id: number;
  name: string;
  price: number;
  emoji: string;
  category: string;
  brand: string;
  description: string;
  specifications: Record<string, string>;
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'in';
  };
  weight: {
    value: number;
    unit: 'g' | 'kg' | 'lb' | 'oz';
  };
  imageUrls: string[];
  rating: number;
  reviewCount: number;
  inStock: boolean;
  tags: string[];
  sku: string;
  availability: 'in_stock' | 'out_of_stock' | 'limited';
}

export interface CartItem extends Product {
  quantity: number;
}

export interface WishlistItem extends Product {
  addedAt: Date;
}

// Algorithm and recommendation types
export interface FrequentItemset {
  items: string[];
  support: number;
  supportCount: number;
}

export interface AssociationRule {
  antecedent: string[];
  consequent: string[];
  confidence: number;
  support: number;
  lift?: number;
  conviction?: number;
  leverage?: number;
  jaccard?: number;
  cosine?: number;
  kulczynski?: number;
  imbalanceRatio?: number;
}

// Alias for backward compatibility
export type AprioriRule = AssociationRule;

export interface Recommendation {
  product: string;
  reason: string[];
  confidence: number;
  support: number;
  score?: number; // For ranking
  diversity?: number; // For diversity scoring
  recency?: number; // For recency scoring
  popularity?: number; // For popularity scoring
  lift?: number; // Lift metric from association rules
  ruleCount?: number; // Number of rules supporting this recommendation
}

export interface AlgorithmStats {
  totalTransactions: number;
  minSupport: number;
  minConfidence: number;
  frequentItemsetsCount: number;
  executionTime?: number;
  lastUpdated?: Date;
}

export interface MiningStats {
  totalTransactions: number;
  uniqueItems: number;
  avgBasketSize: number;
  minBasketSize: number;
  maxBasketSize: number;
  totalItemsets: number;
  miningTimeMs: number;
}

// UI and component types
export interface SearchFilters {
  query: string;
  category: string;
  priceRange?: [number, number];
  rating?: number;
  inStock?: boolean;
  sortBy: 'name' | 'price-low' | 'price-high' | 'rating' | 'popularity';
}

export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

// User interaction types
export interface UserAction {
  type: 'add_to_cart' | 'remove_from_cart' | 'view_product' | 'search' | 'filter' | 'checkout';
  productId?: number;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface RecentlyViewedItem {
  product: Product;
  viewedAt: Date;
  sessionId?: string;
}

// Review and rating types
export interface Review {
  id: string;
  productId: number;
  userId?: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: Date;
  helpful: number;
  verified: boolean;
}

export interface ProductRating {
  average: number;
  count: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

// Checkout and order types
export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface OrderItem extends CartItem {
  priceAtTime: number; // Price when added to cart
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  shippingAddress: ShippingAddress;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  trackingNumber?: string;
}

// Analytics and tracking types
export interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  timestamp: Date;
  userId?: string;
  sessionId: string;
  metadata?: Record<string, unknown>;
}

export interface UserSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  pageViews: number;
  actions: UserAction[];
  cartValue: number;
  converted: boolean;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
  timestamp: Date;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// Error types (extending from errorHandler)
export interface AppError {
  message: string;
  code?: string;
  details?: unknown;
  timestamp: Date;
}

// Component prop types
export interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onViewDetails?: (product: Product) => void;
  showRating?: boolean;
  showWishlist?: boolean;
  isInWishlist?: boolean;
  onToggleWishlist?: (product: Product) => void;
  className?: string;
}

export interface CartSidebarProps {
  cart: CartItem[];
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemoveItem: (productId: number) => void;
  onClearCart: () => void;
  onCheckout: () => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

export interface RecommendationCardProps {
  recommendation: Recommendation;
  product: Product;
  onAddToCart?: (product: Product) => void;
  onViewDetails?: (product: Product) => void;
  showConfidence?: boolean;
  className?: string;
}

// Algorithm visualization types
export interface AlgorithmStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  details: string;
  example?: string;
  complexity?: string;
  optimization?: string;
  code?: string;
  visualization?: React.ReactNode;
}

export interface ExampleRule {
  antecedent: string[];
  consequent: string[];
  confidence: number;
  support: number;
  lift: number;
  conviction?: number;
  leverage?: number;
  jaccard?: number;
  cosine?: number;
  kulczynski?: number;
  imbalanceRatio?: number;
  explanation: string;
}

export interface TransactionData {
  id: number;
  items: string[];
  timestamp?: Date;
  customerId?: string;
}

// Form types
export interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface NewsletterSignup {
  email: string;
  preferences?: string[];
}

// Utility types
export type SortDirection = 'asc' | 'desc';
export type ThemeMode = 'light' | 'dark' | 'system';
export type LoadingSize = 'sm' | 'md' | 'lg';
export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';

// Generic utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Event handler types
export type EventHandler<T = void> = (event: T) => void;
export type AsyncEventHandler<T = void> = (event: T) => Promise<void>;

// Route parameter types
export interface RouteParams {
  productId?: string;
  category?: string;
  search?: string;
}

// Local storage keys
export const STORAGE_KEYS = {
  CART: 'smartmart-cart',
  WISHLIST: 'smartmart-wishlist',
  RECENTLY_VIEWED: 'smartmart-recently-viewed',
  USER_PREFERENCES: 'smartmart-preferences',
  ALGORITHM_RULES: 'smartmart-apriori-rules',
  ALGORITHM_STATS: 'smartmart-algorithm-stats',
  USER_SESSION: 'smartmart-session',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];