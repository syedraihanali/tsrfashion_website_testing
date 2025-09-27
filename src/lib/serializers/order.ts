import type { Order, Prisma } from "@prisma/client";

import type { OrderTimelineStep, OrderTracking } from "@/lib/data/orders";

type OrderWithHistory = Order & {
  statusHistory: Prisma.JsonValue;
};

export const serializeOrder = (order: OrderWithHistory): OrderTracking => {
  const history = (Array.isArray(order.statusHistory)
    ? order.statusHistory
    : []) as OrderTimelineStep[];

  return {
    id: order.orderNumber,
    placedOn: order.placedOn.toISOString(),
    totalAmount: order.totalAmount,
    itemsCount: order.itemsCount,
    status: order.status as OrderTracking["status"],
    paymentMethod: order.paymentMethod,
    estimatedDelivery: order.estimatedDelivery?.toISOString(),
    notes: order.notes ?? undefined,
    shippingAddress: {
      name: order.shippingName,
      phone: order.shippingPhone,
      addressLine1: order.shippingAddress1,
      addressLine2: order.shippingAddress2 ?? undefined,
      city: order.shippingCity,
      postalCode: order.shippingPostal,
    },
    statusHistory: history.map((step) => ({
      ...step,
      date: step.date,
    })),
  };
};
