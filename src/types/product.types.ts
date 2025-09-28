export type Discount = {
  amount: number;
  percentage: number;
};

export type Product = {
  id: string;
  title: string;
  slug: string;
  description: string;
  srcUrl: string;
  gallery: string[];
  price: number;
  salePrice: number | null;
  currency: string;
  discount: Discount;
  rating: number;
  category: string | null;
  style: string | null;
  colors: string[];
  sizes: string[];
  tags: string[];
  tagSlugs: string[];
  stock: number;
};
