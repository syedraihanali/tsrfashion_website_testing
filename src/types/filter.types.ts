export type ShopFiltersState = {
  category: string | null;
  styles: string[];
  colors: string[];
  sizes: string[];
  priceRange: [number, number];
};

export type ShopFilterOptions = {
  categories: string[];
  styles: string[];
  colors: string[];
  sizes: string[];
};

export const defaultShopFilterOptions: ShopFilterOptions = {
  categories: ["t-shirts", "shorts", "shirts", "hoodies", "jeans"],
  styles: ["casual", "formal", "party", "gym"],
  colors: [
    "green",
    "red",
    "yellow",
    "orange",
    "cyan",
    "blue",
    "purple",
    "pink",
    "white",
    "black",
  ],
  sizes: [
    "XX-Small",
    "X-Small",
    "Small",
    "Medium",
    "Large",
    "X-Large",
    "XX-Large",
    "3X-Large",
    "4X-Large",
  ],
};

export const defaultShopFiltersState: ShopFiltersState = {
  category: null,
  styles: [],
  colors: [],
  sizes: [],
  priceRange: [0, 250],
};
