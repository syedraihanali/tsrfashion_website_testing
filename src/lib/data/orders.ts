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

export const sampleOrders: OrderTracking[] = [
  {
    id: "TSR-105284",
    placedOn: "2024-09-21T10:30:00+06:00",
    totalAmount: 420,
    itemsCount: 3,
    status: "shipped",
    paymentMethod: "Cash on Delivery",
    estimatedDelivery: "2024-09-27T00:00:00+06:00",
    notes: "Leave with the security guard if no one answers.",
    shippingAddress: {
      name: "Nadia Rahman",
      phone: "+8801712345678",
      addressLine1: "House 12, Road 7",
      addressLine2: "Dhanmondi",
      city: "Dhaka",
      postalCode: "1205",
    },
    statusHistory: [
      {
        id: "placed",
        title: "Order Placed",
        description: "We have received your order and payment method.",
        date: "2024-09-21T10:30:00+06:00",
        isCompleted: true,
      },
      {
        id: "processing",
        title: "Processing",
        description: "Items are being prepared at the warehouse.",
        date: "2024-09-22T14:00:00+06:00",
        isCompleted: true,
      },
      {
        id: "shipped",
        title: "Shipped",
        description: "Your package has left the warehouse.",
        date: "2024-09-24T09:15:00+06:00",
        isCompleted: true,
      },
      {
        id: "out-for-delivery",
        title: "Out for Delivery",
        description: "Courier is on the way to your address.",
        isCompleted: false,
      },
      {
        id: "delivered",
        title: "Delivered",
        description: "Package delivered to your doorstep.",
        isCompleted: false,
      },
    ],
  },
  {
    id: "TSR-208611",
    placedOn: "2024-08-14T12:05:00+06:00",
    totalAmount: 285,
    itemsCount: 2,
    status: "delivered",
    paymentMethod: "bKash",
    estimatedDelivery: "2024-08-18T00:00:00+06:00",
    notes: "Call before delivery after 5 PM.",
    shippingAddress: {
      name: "Arman Hossain",
      phone: "+8801911223344",
      addressLine1: "Flat B2, Building 23",
      addressLine2: "Agrabad Commercial Area",
      city: "Chattogram",
      postalCode: "4000",
    },
    statusHistory: [
      {
        id: "placed",
        title: "Order Placed",
        description: "We have received your order and payment method.",
        date: "2024-08-14T12:05:00+06:00",
        isCompleted: true,
      },
      {
        id: "processing",
        title: "Processing",
        description: "Items are being prepared at the warehouse.",
        date: "2024-08-15T09:20:00+06:00",
        isCompleted: true,
      },
      {
        id: "shipped",
        title: "Shipped",
        description: "Your package has left the warehouse.",
        date: "2024-08-16T08:45:00+06:00",
        isCompleted: true,
      },
      {
        id: "out-for-delivery",
        title: "Out for Delivery",
        description: "Courier is on the way to your address.",
        date: "2024-08-17T10:10:00+06:00",
        isCompleted: true,
      },
      {
        id: "delivered",
        title: "Delivered",
        description: "Package delivered to your doorstep.",
        date: "2024-08-17T16:40:00+06:00",
        isCompleted: true,
      },
    ],
  },
];
