import type { Prisma } from "@prisma/client";

import type { Product } from "@/types/product.types";
import { prisma } from "@/lib/prisma";

export type PrismaProductWithTags = Prisma.ProductGetPayload<{
  include: {
    tags: {
      include: {
        tag: true;
      };
    };
  };
}>;

const PLACEHOLDER_IMAGE = "/images/placeholder-product.png";

const normalizeImageGallery = (images: Prisma.JsonValue | null): string[] => {
  if (!images) {
    return [];
  }

  if (Array.isArray(images)) {
    const urls = images
      .map((entry) => {
        if (typeof entry === "string") {
          return entry;
        }

        if (entry && typeof entry === "object" && "url" in entry) {
          const urlValue = (entry as { url?: unknown }).url;
          if (typeof urlValue === "string" && urlValue.length > 0) {
            return urlValue;
          }
        }

        return null;
      })
      .filter((value): value is string => typeof value === "string" && value.length > 0);

    return urls;
  }

  if (typeof images === "object" && images && "url" in images) {
    const urlValue = (images as { url?: unknown }).url;
    if (typeof urlValue === "string" && urlValue.length > 0) {
      return [urlValue];
    }
  }

  return [];
};

export const serializeProduct = (product: PrismaProductWithTags): Product => {
  const gallery = normalizeImageGallery(product.images);
  const srcUrl = gallery[0] ?? PLACEHOLDER_IMAGE;

  const hasSale = typeof product.salePrice === "number" && product.salePrice > 0 && product.salePrice < product.price;
  const discountAmount = hasSale ? product.price - (product.salePrice ?? product.price) : 0;
  const discountPercentage = hasSale ? Math.round((discountAmount / product.price) * 100) : 0;

  return {
    id: product.id,
    title: product.name,
    slug: product.slug,
    description: product.description,
    srcUrl,
    gallery,
    price: product.price,
    salePrice: hasSale ? product.salePrice ?? product.price : null,
    currency: product.currency,
    discount: {
      amount: discountAmount,
      percentage: discountPercentage,
    },
    rating: product.rating ?? 0,
    category: product.category ?? null,
    style: product.style ?? null,
    colors: product.colors ?? [],
    sizes: product.sizes ?? [],
    tags: product.tags.map((tag) => tag.tag.label),
    tagSlugs: product.tags.map((tag) => tag.tag.slug),
    stock: product.stock,
  };
};

export const getActiveProducts = async (options: {
  take?: number;
  tagSlugs?: string[];
  excludeId?: string;
  searchQuery?: string;
} = {}): Promise<Product[]> => {
  const { take, tagSlugs, excludeId, searchQuery } = options;

  const where: Prisma.ProductWhereInput = {
    status: "ACTIVE",
  };

  if (excludeId) {
    where.id = { not: excludeId };
  }

  if (tagSlugs && tagSlugs.length > 0) {
    where.tags = {
      some: {
        tag: {
          slug: {
            in: tagSlugs,
          },
        },
      },
    };
  }

  if (searchQuery && searchQuery.trim().length > 0) {
    const normalized = searchQuery.trim();
    where.OR = [
      { name: { contains: normalized, mode: "insensitive" } },
      { description: { contains: normalized, mode: "insensitive" } },
      { sku: { contains: normalized, mode: "insensitive" } },
      { category: { contains: normalized, mode: "insensitive" } },
      { style: { contains: normalized, mode: "insensitive" } },
      {
        tags: {
          some: {
            tag: {
              label: {
                contains: normalized,
                mode: "insensitive",
              },
            },
          },
        },
      },
    ];
  }

  try {
    const products = await prisma.product.findMany({
      where,
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take,
    });

    return products.map(serializeProduct);
  } catch (error) {
    console.error("Failed to load products", error);
    return [];
  }
};

export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!product) {
      return null;
    }

    return serializeProduct(product);
  } catch (error) {
    console.error("Failed to load product", error);
    return null;
  }
};

export const getProductBySlug = async (slug: string): Promise<Product | null> => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!product) {
      return null;
    }

    return serializeProduct(product);
  } catch (error) {
    console.error("Failed to load product", error);
    return null;
  }
};

export const getProductFacets = async () => {
  try {
    const products = await prisma.product.findMany({
      where: {
        status: "ACTIVE",
      },
      select: {
        category: true,
        style: true,
        colors: true,
        sizes: true,
      },
    });

    const categorySet = new Set<string>();
    const styleSet = new Set<string>();
    const colorSet = new Set<string>();
    const sizeSet = new Set<string>();

    products.forEach((product) => {
      if (product.category) {
        categorySet.add(product.category);
      }

      if (product.style) {
        styleSet.add(product.style);
      }

      (product.colors ?? []).forEach((color) => {
        if (color) {
          colorSet.add(color);
        }
      });

      (product.sizes ?? []).forEach((size) => {
        if (size) {
          sizeSet.add(size);
        }
      });
    });

    return {
      categories: Array.from(categorySet).sort((a, b) => a.localeCompare(b)),
      styles: Array.from(styleSet).sort((a, b) => a.localeCompare(b)),
      colors: Array.from(colorSet).sort((a, b) => a.localeCompare(b)),
      sizes: Array.from(sizeSet).sort((a, b) => a.localeCompare(b)),
    };
  } catch (error) {
    console.error("Failed to load product facets", error);
    return {
      categories: [],
      styles: [],
      colors: [],
      sizes: [],
    };
  }
};

export const getRelatedProducts = async (
  product: Product,
  options: { take?: number } = {}
): Promise<Product[]> => {
  const tagSlugs = product.tagSlugs;

  const related = await getActiveProducts({
    excludeId: product.id,
    take: options.take ?? 8,
    tagSlugs: tagSlugs.length > 0 ? tagSlugs : undefined,
  });

  if (related.length > 0) {
    return related;
  }

  return getActiveProducts({ excludeId: product.id, take: options.take ?? 8 });
};
