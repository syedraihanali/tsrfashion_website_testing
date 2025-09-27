import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { OrderTimelineStep } from "@/lib/data/orders";
import { serializeOrder } from "@/lib/serializers/order";

const timelineStepSchema: z.ZodType<OrderTimelineStep> = z.object({
  id: z.string().min(1, "Timeline step ID is required"),
  title: z.string().min(1, "Step title is required"),
  description: z.string().min(1, "Step description is required"),
  date: z.string().datetime().optional(),
  isCompleted: z.boolean(),
});

const shippingSchema = z.object({
  name: z.string().min(1, "Recipient name is required"),
  phone: z.string().min(1, "Recipient phone number is required"),
  addressLine1: z.string().min(1, "Primary address line is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  postalCode: z.string().min(1, "Postal code is required"),
});

const createOrderSchema = z.object({
  orderNumber: z.string().min(1, "Order number is required"),
  placedOn: z.string().datetime().optional(),
  totalAmount: z.number().int().nonnegative(),
  itemsCount: z.number().int().nonnegative(),
  status: z.string().min(1, "Order status is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  estimatedDelivery: z.string().datetime().optional(),
  notes: z.string().max(1000).optional(),
  shippingAddress: shippingSchema,
  statusHistory: z.array(timelineStepSchema).min(1),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const parsed = createOrderSchema.safeParse(body);

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid request";
    return NextResponse.json({ message }, { status: 400 });
  }

  const user = await getCurrentUser();
  const payload = parsed.data;

  try {
    const created = await prisma.order.create({
      data: {
        orderNumber: payload.orderNumber,
        userId: user?.id,
        placedOn: payload.placedOn ? new Date(payload.placedOn) : new Date(),
        totalAmount: payload.totalAmount,
        itemsCount: payload.itemsCount,
        status: payload.status,
        paymentMethod: payload.paymentMethod,
        estimatedDelivery: payload.estimatedDelivery
          ? new Date(payload.estimatedDelivery)
          : null,
        notes: payload.notes ?? null,
        shippingName: payload.shippingAddress.name,
        shippingPhone: payload.shippingAddress.phone,
        shippingAddress1: payload.shippingAddress.addressLine1,
        shippingAddress2: payload.shippingAddress.addressLine2 ?? null,
        shippingCity: payload.shippingAddress.city,
        shippingPostal: payload.shippingAddress.postalCode,
        statusHistory: payload.statusHistory,
      },
    });

    return NextResponse.json({ order: serializeOrder(created) });
  } catch (error) {
    console.error("Failed to create order", error);
    return NextResponse.json(
      { message: "We couldn't save your order. Please try again." },
      { status: 500 }
    );
  }
}
