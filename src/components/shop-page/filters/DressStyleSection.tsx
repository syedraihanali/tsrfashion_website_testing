"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MdKeyboardArrowRight } from "react-icons/md";
import { cn } from "@/lib/utils";

type DressStyle = {
  label: string;
  value: string;
};

type DressStyleSectionProps = {
  styles: DressStyle[];
  selectedStyles: string[];
  onSelectStyles: (styles: string[]) => void;
};

const DressStyleSection = ({
  styles,
  selectedStyles,
  onSelectStyles,
}: DressStyleSectionProps) => {
  const toggleStyle = (value: string) => {
    const exists = selectedStyles.includes(value);
    const next = exists
      ? selectedStyles.filter((style) => style !== value)
      : [...selectedStyles, value];

    onSelectStyles(next);
  };

  return (
    <Accordion type="single" collapsible defaultValue="filter-style">
      <AccordionItem value="filter-style" className="border-none">
        <AccordionTrigger className="text-black font-bold text-xl hover:no-underline p-0 py-0.5">
          Dress Style
        </AccordionTrigger>
        <AccordionContent className="pt-4 pb-0">
          <div className="flex flex-col text-black/60 space-y-0.5">
            {styles.map((style) => {
              const isSelected = selectedStyles.includes(style.value);

              return (
                <button
                  key={style.value}
                  type="button"
                  onClick={() => toggleStyle(style.value)}
                  className={cn(
                    "flex items-center justify-between py-2 text-left transition-colors",
                    isSelected ? "text-black font-medium" : "hover:text-black"
                  )}
                  aria-pressed={isSelected}
                >
                  {style.label}
                  <MdKeyboardArrowRight />
                </button>
              );
            })}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default DressStyleSection;
