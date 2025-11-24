import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, ShoppingCart, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Product } from "@/types";
import { ProductCardSkeleton } from "@/components/ProductCardSkeleton";
import { NoProductsState } from "@/components/ErrorState";

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
  addToCart: (product: Product) => void;
  onClearFilters: () => void;
  totalItems: number;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  addToCart,
  onClearFilters,
  totalItems
}) => {
  const navigate = useNavigate();
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = products.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 id="products-heading" className="text-2xl font-bold text-foreground">Products</h2>
        <Badge variant="secondary" className="gap-1" aria-live="polite">
          <Package className="h-3 w-3" aria-hidden="true" />
          {totalItems} items ({paginatedProducts.length} shown)
        </Badge>
      </div>
      
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <ProductCardSkeleton
              key={index}
              className="animate-slide-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            />
          ))}
        </div>
      ) : products.length === 0 ? (
        <NoProductsState onClearFilters={onClearFilters} />
      ) : (
        <>
          <div
            className="grid sm:grid-cols-2 lg:grid-cols-5 xl:grid-cols-6 gap-4"
            role="grid"
            aria-labelledby="products-heading"
            aria-rowcount={Math.ceil(paginatedProducts.length / 5)}
          >
            {paginatedProducts.map((product, index) => (
            <Card
              key={product.id}
              className="group p-6 hover:shadow-2xl transition-all duration-500 hover:scale-[1.03] cursor-pointer border-0 shadow-lg hover:shadow-primary/20 animate-slide-in-up focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 relative overflow-hidden"
              style={{ animationDelay: `${index * 0.08}s` }}
              onClick={() => navigate(`/product/${product.id}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(`/product/${product.id}`);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`View details for ${product.name}, ${product.category}, priced at ₹${product.price}`}
            >
              {/* Subtle background gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              {/* Product Image */}
              <div className="relative mb-4 overflow-hidden rounded-lg">
                {product.imageUrls && product.imageUrls.length > 0 ? (
                  <img
                    src={product.imageUrls[0]}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-48 bg-muted flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-300">
                    {product.emoji}
                  </div>
                )}
                {/* Availability Badge */}
                <div className="absolute top-2 right-2">
                  <Badge
                    variant={product.inStock ? "default" : "destructive"}
                    className={`text-xs ${
                      product.availability === 'limited' ? 'bg-orange-500' : ''
                    }`}
                  >
                    {product.availability === 'in_stock' ? 'In Stock' :
                     product.availability === 'limited' ? 'Limited' : 'Out of Stock'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                {/* Category and Brand */}
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    {product.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-medium">
                    {product.brand}
                  </span>
                </div>

                {/* Product Name */}
                <h3 className="font-bold text-lg text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                  {product.name}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(product.rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {product.rating.toFixed(1)} ({product.reviewCount} reviews)
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {product.description}
                </p>

                {/* Price */}
                <div className="flex items-center justify-center gap-1">
                  <span className="text-2xl font-bold text-primary">
                    ₹{product.price.toFixed(2)}
                  </span>
                </div>

                {/* Tags */}
                {product.tags && product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {product.tags.slice(0, 3).map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {product.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{product.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(product);
                }}
                className="w-full mt-4 group-hover:bg-primary/90 transition-colors duration-200 touch-manipulation"
                size="lg"
                aria-label={`Add ${product.name} to cart`}
                disabled={!product.inStock}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </Button>
            </Card>
          ))}
        </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav
              className="flex justify-center items-center gap-2 mt-8"
              aria-label="Product pagination"
              role="navigation"
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                aria-label="Go to previous page"
              >
                Previous
              </Button>
              <div className="flex gap-1" role="group" aria-label="Page numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-8 h-8 p-0"
                    aria-label={`Go to page ${page}`}
                    aria-current={currentPage === page ? "page" : undefined}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                aria-label="Go to next page"
              >
                Next
              </Button>
            </nav>
          )}
        </>
      )}
    </div>
  );
};

export default ProductGrid;
