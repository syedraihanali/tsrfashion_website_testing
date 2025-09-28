import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { serializeOrder } from "@/lib/serializers/order";

export async function GET(
  _request: NextRequest,
  { params }: { params: { orderNumber: string } }
) {
  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber: params.orderNumber },
    });

    if (!order) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ order: serializeOrder(order) });
  } catch (error) {
    console.error("Failed to lookup order", error);
    return NextResponse.json(
      { message: "We couldn't check our records right now. Please try again." },
      { status: 500 }
    );
  }
}
