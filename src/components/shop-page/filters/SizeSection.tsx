"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

type SizeSectionProps = {
  sizes: string[];
  selectedSizes: string[];
  onSelectSizes: (sizes: string[]) => void;
};

const SizeSection = ({
  sizes,
  selectedSizes,
  onSelectSizes,
}: SizeSectionProps) => {
  const toggleSize = (value: string) => {
    const exists = selectedSizes.includes(value);
    const next = exists
      ? selectedSizes.filter((size) => size !== value)
      : [...selectedSizes, value];

    onSelectSizes(next);
  };

  return (
    <Accordion type="single" collapsible defaultValue="filter-size">
      <AccordionItem value="filter-size" className="border-none">
        <AccordionTrigger className="text-black font-bold text-xl hover:no-underline p-0 py-0.5">
          Size
        </AccordionTrigger>
        <AccordionContent className="pt-4 pb-0">
          <div className="flex items-center flex-wrap">
            {sizes.map((size) => {
              const isSelected = selectedSizes.includes(size);

              return (
                <button
                  key={size}
                  type="button"
                  className={cn([
                    "bg-[#F0F0F0] m-1 flex items-center justify-center px-5 py-2.5 text-sm rounded-full max-h-[39px] transition-colors",
                    isSelected && "bg-black font-medium text-white",
                  ])}
                  onClick={() => toggleSize(size)}
                  aria-pressed={isSelected}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default SizeSection;
