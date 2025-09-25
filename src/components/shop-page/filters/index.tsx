"use client";

import React from "react";
import CategoriesSection from "@/components/shop-page/filters/CategoriesSection";
import ColorsSection from "@/components/shop-page/filters/ColorsSection";
import DressStyleSection from "@/components/shop-page/filters/DressStyleSection";
import PriceSection from "@/components/shop-page/filters/PriceSection";
import SizeSection from "@/components/shop-page/filters/SizeSection";
import { Button } from "@/components/ui/button";
import { ShopFiltersState } from "@/types/filter.types";

type FiltersProps = {
  filters: ShopFiltersState;
  onFiltersChange: (filters: ShopFiltersState) => void;
  onApply?: () => void;
};

const categories = [
  { label: "T-shirts", value: "t-shirts" },
  { label: "Shorts", value: "shorts" },
  { label: "Shirts", value: "shirts" },
  { label: "Hoodie", value: "hoodie" },
  { label: "Jeans", value: "jeans" },
];

const dressStyles = [
  { label: "Casual", value: "casual" },
  { label: "Formal", value: "formal" },
  { label: "Party", value: "party" },
  { label: "Gym", value: "gym" },
];

const colorOptions = [
  { value: "green", className: "bg-green-600" },
  { value: "red", className: "bg-red-600" },
  { value: "yellow", className: "bg-yellow-300" },
  { value: "orange", className: "bg-orange-600" },
  { value: "cyan", className: "bg-cyan-400" },
  { value: "blue", className: "bg-blue-600" },
  { value: "purple", className: "bg-purple-600" },
  { value: "pink", className: "bg-pink-600" },
  { value: "white", className: "bg-white" },
  { value: "black", className: "bg-black" },
];

const sizeOptions = [
  "XX-Small",
  "X-Small",
  "Small",
  "Medium",
  "Large",
  "X-Large",
  "XX-Large",
  "3X-Large",
  "4X-Large",
];

const Filters = ({ filters, onFiltersChange, onApply }: FiltersProps) => {
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
