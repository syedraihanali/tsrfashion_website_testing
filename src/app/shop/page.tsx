"use client";

import { useEffect, useMemo, useState } from "react";
import BreadcrumbShop from "@/components/shop-page/BreadcrumbShop";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MobileFilters from "@/components/shop-page/filters/MobileFilters";
import Filters from "@/components/shop-page/filters";
import { FiSliders } from "react-icons/fi";
import ProductCard from "@/components/common/ProductCard";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Product } from "@/types/product.types";
import type { ShopFilterOptions, ShopFiltersState } from "@/types/filter.types";
import {
  defaultShopFilterOptions,
  defaultShopFiltersState,
} from "@/types/filter.types";

type SortOption = "most-popular" | "low-price" | "high-price";

const getProductFinalPrice = (product: Product) => {
  if (product.salePrice && product.salePrice < product.price) {
    return product.salePrice;
  }

  if (product.discount.percentage > 0) {
    return Math.round(
      product.price - (product.price * product.discount.percentage) / 100
    );
  }

  if (product.discount.amount > 0) {
    return product.price - product.discount.amount;
  }

  return product.price;
};

export default function ShopPage() {
  const [filters, setFilters] = useState<ShopFiltersState>(
    defaultShopFiltersState
  );
  const [sort, setSort] = useState<SortOption>("most-popular");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<ShopFilterOptions>(
    defaultShopFilterOptions
  );

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const loadProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/products", {
          signal: controller.signal,
        });

        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as
            | { message?: string }
            | null;
          throw new Error(
            data?.message ?? "We couldn't load the catalogue right now."
          );
        }

        const data = (await response.json()) as { products: Product[] };

        if (isMounted) {
          setProducts(data.products);
          setLoadError(null);
        }

        try {
          const metaResponse = await fetch("/api/products/meta", {
            signal: controller.signal,
          });

          if (!metaResponse.ok) {
            throw new Error("Failed to load product filters");
          }

          const metaData = (await metaResponse.json()) as {
            facets: ShopFilterOptions;
          };

          if (isMounted && metaData.facets) {
            setFilterOptions((previous) => {
              const next = metaData.facets;

              return {
                categories:
                  next.categories?.length > 0
                    ? Array.from(new Set(next.categories))
                    : previous.categories,
                styles:
                  next.styles?.length > 0
                    ? Array.from(new Set(next.styles))
                    : previous.styles,
                colors:
                  next.colors?.length > 0
                    ? Array.from(new Set(next.colors))
                    : previous.colors,
                sizes:
                  next.sizes?.length > 0
                    ? Array.from(new Set(next.sizes))
                    : previous.sizes,
              };
            });
          }
        } catch (metaError) {
          if ((metaError as { name?: string }).name !== "AbortError") {
            console.error("Failed to load filter metadata", metaError);
          }
        }
      } catch (error) {
        if ((error as { name?: string }).name === "AbortError") {
          return;
        }

        console.error("Failed to fetch products", error);
        if (isMounted) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "We couldn't load the catalogue right now."
          );
          setProducts([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const finalPrice = getProductFinalPrice(product);

      if (filters.category && product.category !== filters.category) {
        return false;
      }

      if (
        filters.styles.length > 0 &&
        (!product.style || !filters.styles.includes(product.style))
      ) {
        return false;
      }

      if (
        filters.colors.length > 0 &&
        !product.colors.some((color) => filters.colors.includes(color))
      ) {
        return false;
      }

      if (
        filters.sizes.length > 0 &&
        !product.sizes.some((size) => filters.sizes.includes(size))
      ) {
        return false;
      }

      if (
        finalPrice < filters.priceRange[0] ||
        finalPrice > filters.priceRange[1]
      ) {
        return false;
      }

      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sort === "low-price") {
        return getProductFinalPrice(a) - getProductFinalPrice(b);
      }

      if (sort === "high-price") {
        return getProductFinalPrice(b) - getProductFinalPrice(a);
      }

      return b.rating - a.rating;
    });

    return sorted;
  }, [filters, products, sort]);

  const handleFiltersChange = (nextFilters: ShopFiltersState) => {
    setFilters(nextFilters);
  };

  const totalProducts = products.length;
  const shownProducts = filteredProducts.length;

  return (
    <main className="pb-20">
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        <hr className="h-[1px] border-t-black/10 mb-5 sm:mb-6" />
        <BreadcrumbShop />
        <div className="flex md:space-x-5 items-start">
          <div className="hidden md:block min-w-[295px] max-w-[295px] border border-black/10 rounded-[20px] px-5 md:px-6 py-5 space-y-5 md:space-y-6">
            <div className="flex items-center justify-between">
              <span className="font-bold text-black text-xl">Filters</span>
              <FiSliders className="text-2xl text-black/40" />
            </div>
            <Filters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              options={filterOptions}
            />
          </div>
          <div className="flex flex-col w-full space-y-5">
            <div className="flex flex-col lg:flex-row lg:justify-between">
              <div className="flex items-center justify-between">
                <h1 className="font-bold text-2xl md:text-[32px]">Casual</h1>
                <MobileFilters
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  options={filterOptions}
                />
              </div>
              <div className="flex flex-col sm:items-center sm:flex-row">
                <span className="text-sm md:text-base text-black/60 mr-3">
                  Showing {shownProducts} of {totalProducts} Products
                </span>
                <div className="flex items-center">
                  Sort by:{" "}
                  <Select
                    value={sort}
                    onValueChange={(value) => setSort(value as SortOption)}
                  >
                    <SelectTrigger className="font-medium text-sm px-1.5 sm:text-base w-fit text-black bg-transparent shadow-none border-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="most-popular">Most Popular</SelectItem>
                      <SelectItem value="low-price">Low Price</SelectItem>
                      <SelectItem value="high-price">High Price</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="w-full grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
              {isLoading ? (
                <div className="col-span-full text-center py-10 text-black/60">
                  Loading products…
                </div>
              ) : loadError ? (
                <div className="col-span-full text-center py-10 text-black/60">
                  {loadError}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="col-span-full text-center py-10 text-black/60">
                  No products match the selected filters.
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <ProductCard key={product.id} data={product} />
                ))
              )}
            </div>
            <hr className="border-t-black/10" />
            <Pagination className="justify-between">
              <PaginationPrevious href="#" className="border border-black/10" />
              <PaginationContent>
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    className="text-black/50 font-medium text-sm"
                    isActive
                  >
                    1
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    className="text-black/50 font-medium text-sm"
                  >
                    2
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem className="hidden lg:block">
                  <PaginationLink
                    href="#"
                    className="text-black/50 font-medium text-sm"
                  >
                    3
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis className="text-black/50 font-medium text-sm" />
                </PaginationItem>
                <PaginationItem className="hidden lg:block">
                  <PaginationLink
                    href="#"
                    className="text-black/50 font-medium text-sm"
                  >
                    8
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem className="hidden sm:block">
                  <PaginationLink
                    href="#"
                    className="text-black/50 font-medium text-sm"
                  >
                    9
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    className="text-black/50 font-medium text-sm"
                  >
                    10
                  </PaginationLink>
                </PaginationItem>
              </PaginationContent>

              <PaginationNext href="#" className="border border-black/10" />
            </Pagination>
          </div>
        </div>
      </div>
    </main>
  );
}
