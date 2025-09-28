import { NextRequest, NextResponse } from "next/server";

import { getActiveProducts } from "@/lib/products";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const tagParams = searchParams.getAll("tag");
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? Number.parseInt(limitParam, 10) : undefined;

  try {
    const products = await getActiveProducts({
      tagSlugs: tagParams.length > 0 ? tagParams : undefined,
      take: typeof limit === "number" && Number.isFinite(limit) && limit > 0 ? limit : undefined,
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Failed to load products", error);
    return NextResponse.json(
      { message: "We couldn't load products right now. Please try again later." },
      { status: 500 }
    );
  }
}
