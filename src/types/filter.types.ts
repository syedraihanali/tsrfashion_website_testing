export type ShopFiltersState = {
  category: string | null;
  styles: string[];
  colors: string[];
  sizes: string[];
  priceRange: [number, number];
};

export const defaultShopFiltersState: ShopFiltersState = {
  category: null,
  styles: [],
  colors: [],
  sizes: [],
  priceRange: [0, 250],
};
