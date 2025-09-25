"use client";

import React, { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { IoMdCheckmark } from "react-icons/io";
import { cn } from "@/lib/utils";

type ColorOption = {
  value: string;
  className: string;
};

type ColorsSectionProps = {
  colors: ColorOption[];
  selectedColors: string[];
  onSelectColors: (colors: string[]) => void;
};

const ColorsSection = ({
  colors,
  selectedColors,
  onSelectColors,
}: ColorsSectionProps) => {
  const [selected, setSelected] = useState<string[]>(selectedColors);

  const toggleColor = (value: string) => {
    setSelected((prev) => {
      const exists = prev.includes(value);
      const next = exists
        ? prev.filter((color) => color !== value)
        : [...prev, value];

      onSelectColors(next);
      return next;
    });
  };

  React.useEffect(() => {
    setSelected(selectedColors);
  }, [selectedColors]);

  return (
    <Accordion type="single" collapsible defaultValue="filter-colors">
      <AccordionItem value="filter-colors" className="border-none">
        <AccordionTrigger className="text-black font-bold text-xl hover:no-underline p-0 py-0.5">
          Colors
        </AccordionTrigger>
        <AccordionContent className="pt-4 pb-0">
          <div className="flex space-2.5 flex-wrap md:grid grid-cols-5 gap-2.5">
            {colors.map((color) => {
              const isSelected = selected.includes(color.value);
              const checkmarkClass = color.value === "white" ? "text-black" : "text-white";

              return (
                <button
                  key={color.value}
                  type="button"
                  className={cn([
                    color.className,
                    "rounded-full w-9 sm:w-10 h-9 sm:h-10 flex items-center justify-center border border-black/20",
                    isSelected && "ring-2 ring-offset-2 ring-black",
                  ])}
                  onClick={() => toggleColor(color.value)}
                  aria-pressed={isSelected}
                >
                  {isSelected && (
                    <IoMdCheckmark className={cn("text-base", checkmarkClass)} />
                  )}
                </button>
              );
            })}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default ColorsSection;
