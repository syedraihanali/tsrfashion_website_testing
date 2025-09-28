export type OrderStatus =
  | "placed"
  | "processing"
  | "shipped"
  | "out-for-delivery"
  | "delivered"
  | "cancelled";

export type OrderTimelineStep = {
  id: string;
  title: string;
  description: string;
  date?: string;
  isCompleted: boolean;
};

export type OrderTracking = {
  id: string;
  placedOn: string;
  totalAmount: number;
  itemsCount: number;
  status: OrderStatus;
  paymentMethod: string;
  estimatedDelivery?: string;
  notes?: string;
  shippingAddress: {
    name: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    postalCode: string;
  };
  statusHistory: OrderTimelineStep[];
};

export const ORDER_STORAGE_KEY = "tsr-fashion-orders";
