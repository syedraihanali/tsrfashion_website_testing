"use client";

import React from "react";
import CategoriesSection from "@/components/shop-page/filters/CategoriesSection";
import ColorsSection from "@/components/shop-page/filters/ColorsSection";
import DressStyleSection from "@/components/shop-page/filters/DressStyleSection";
import PriceSection from "@/components/shop-page/filters/PriceSection";
import SizeSection from "@/components/shop-page/filters/SizeSection";
import { Button } from "@/components/ui/button";
import type { ShopFilterOptions, ShopFiltersState } from "@/types/filter.types";
import { defaultShopFilterOptions } from "@/types/filter.types";

type FiltersProps = {
  filters: ShopFiltersState;
  onFiltersChange: (filters: ShopFiltersState) => void;
  onApply?: () => void;
  options?: ShopFilterOptions;
};

const COLOR_CLASS_MAP: Record<string, string> = {
  green: "bg-green-600",
  red: "bg-red-600",
  yellow: "bg-yellow-300",
  orange: "bg-orange-600",
  cyan: "bg-cyan-400",
  blue: "bg-blue-600",
  purple: "bg-purple-600",
  pink: "bg-pink-600",
  white: "bg-white",
  black: "bg-black",
};

const toLabel = (value: string) =>
  value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");

const Filters = ({ filters, onFiltersChange, onApply, options }: FiltersProps) => {
  const resolvedOptions = options ?? defaultShopFilterOptions;
  const categories = (
    resolvedOptions.categories.length > 0
      ? resolvedOptions.categories
      : defaultShopFilterOptions.categories
  ).map((value) => ({
    label: toLabel(value),
    value,
  }));

  const dressStyles = (
    resolvedOptions.styles.length > 0 ? resolvedOptions.styles : defaultShopFilterOptions.styles
  ).map((value) => ({
    label: toLabel(value),
    value,
  }));

  const colorOptions = (
    resolvedOptions.colors.length > 0 ? resolvedOptions.colors : defaultShopFilterOptions.colors
  ).map((value) => ({
    value,
    className: COLOR_CLASS_MAP[value.toLowerCase()],
  }));

  const sizeOptions =
    resolvedOptions.sizes.length > 0 ? resolvedOptions.sizes : defaultShopFilterOptions.sizes;

  const handleCategoryChange = (value: string | null) => {
    onFiltersChange({
      ...filters,
      category: value,
    });
  };

  const handlePriceChange = (value: [number, number]) => {
    onFiltersChange({
      ...filters,
      priceRange: value,
    });
  };

  const handleColorChange = (value: string[]) => {
    onFiltersChange({
      ...filters,
      colors: value,
    });
  };

  const handleSizeChange = (value: string[]) => {
    onFiltersChange({
      ...filters,
      sizes: value,
    });
  };

  const handleStyleChange = (value: string[]) => {
    onFiltersChange({
      ...filters,
      styles: value,
    });
  };

  return (
    <>
      <hr className="border-t-black/10" />
      <CategoriesSection
        categories={categories}
        selectedCategory={filters.category}
        onSelectCategory={handleCategoryChange}
      />
      <hr className="border-t-black/10" />
      <PriceSection
        value={filters.priceRange}
        onValueChange={handlePriceChange}
      />
      <hr className="border-t-black/10" />
      <ColorsSection
        colors={colorOptions}
        selectedColors={filters.colors}
        onSelectColors={handleColorChange}
      />
      <hr className="border-t-black/10" />
      <SizeSection
        sizes={sizeOptions}
        selectedSizes={filters.sizes}
        onSelectSizes={handleSizeChange}
      />
      <hr className="border-t-black/10" />
      <DressStyleSection
        styles={dressStyles}
        selectedStyles={filters.styles}
        onSelectStyles={handleStyleChange}
      />
      <Button
        type="button"
        className="bg-black w-full rounded-full text-sm font-medium py-4 h-12"
        onClick={() => onApply?.()}
      >
        Apply Filter
      </Button>
    </>
  );
};

export default Filters;
