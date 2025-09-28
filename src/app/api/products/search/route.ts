import { NextRequest, NextResponse } from "next/server";

import { getActiveProducts } from "@/lib/products";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? Number.parseInt(limitParam, 10) : undefined;

  if (!query) {
    return NextResponse.json({ products: [] });
  }

  try {
    const products = await getActiveProducts({
      searchQuery: query,
      take: typeof limit === "number" && Number.isFinite(limit) && limit > 0 ? limit : undefined,
    });

    const user = await getCurrentUser();

    await prisma.searchLog.create({
      data: {
        query,
        resultsCount: products.length,
        userId: user?.id ?? null,
      },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Product search failed", error);
    return NextResponse.json(
      { message: "We couldn't search the catalogue right now. Please try again." },
      { status: 500 }
    );
  }
}
