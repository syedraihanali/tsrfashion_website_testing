import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { serializeOrder } from "@/lib/serializers/order";

export async function GET(
  request: Request,
  { params }: { params: { orderNumber: string } }
) {
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
}
