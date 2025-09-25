"use client";

import React from "react";
import { MdKeyboardArrowRight } from "react-icons/md";
import { cn } from "@/lib/utils";

type Category = {
  label: string;
  value: string;
};

type CategoriesSectionProps = {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (value: string | null) => void;
};

const CategoriesSection = ({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoriesSectionProps) => {
  const handleSelect = (value: string) => {
    if (selectedCategory === value) {
      onSelectCategory(null);
      return;
    }

    onSelectCategory(value);
  };

  return (
    <div className="flex flex-col space-y-0.5 text-black/60">
      {categories.map((category) => (
        <button
          key={category.value}
          type="button"
          onClick={() => handleSelect(category.value)}
          className={cn(
            "flex items-center justify-between py-2 text-left transition-colors",
            selectedCategory === category.value
              ? "text-black font-medium"
              : "hover:text-black"
          )}
        >
          {category.label}
          <MdKeyboardArrowRight />
        </button>
      ))}
    </div>
  );
};

export default CategoriesSection;
