"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";

type PriceSectionProps = {
  value: [number, number];
  onValueChange: (value: [number, number]) => void;
};

const PriceSection = ({ value, onValueChange }: PriceSectionProps) => {
  return (
    <Accordion type="single" collapsible defaultValue="filter-price">
      <AccordionItem value="filter-price" className="border-none">
        <AccordionTrigger className="text-black font-bold text-xl hover:no-underline p-0 py-0.5">
          Price
        </AccordionTrigger>
        <AccordionContent className="pt-4" contentClassName="overflow-visible">
          <Slider
            value={value}
            min={0}
            max={250}
            step={1}
            label="$"
            onValueChange={onValueChange}
          />
          <div className="flex items-center justify-between text-sm text-black/60 mt-4">
            <span>${value[0]}</span>
            <span>${value[1]}</span>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default PriceSection;
