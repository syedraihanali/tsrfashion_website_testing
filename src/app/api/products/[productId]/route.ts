import { NextRequest, NextResponse } from "next/server";

import { getProductById, getRelatedProducts } from "@/lib/products";

export async function GET(
  _request: NextRequest,
  { params }: { params: { productId: string } }
) {
  const product = await getProductById(params.productId);

  if (!product) {
    return NextResponse.json(
      { message: "Product not found" },
      { status: 404 }
    );
  }

  const related = await getRelatedProducts(product, { take: 6 });

  return NextResponse.json({ product, related });
}
