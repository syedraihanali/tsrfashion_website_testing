import { NextResponse } from "next/server";

import { getProductFacets } from "@/lib/products";

export async function GET() {
  try {
    const facets = await getProductFacets();
    return NextResponse.json({ facets });
  } catch (error) {
    console.error("Failed to load product facets", error);
    return NextResponse.json(
      { message: "We couldn't load catalogue filters right now." },
      { status: 500 }
    );
  }
}
