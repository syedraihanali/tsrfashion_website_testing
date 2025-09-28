import { prisma } from "./prisma";
import { allProducts } from "./data/products";
import { sampleOrders } from "./data/orders";
import { sampleUsers } from "./data/users";
import { sampleAdmins } from "./data/admins";

export type AdminProductRow = {
  id: string;
  title: string;
  category: string;
  price: number;
  rating: number | null;
  discountPercentage: number;
  variants: number;
  status: "in-stock" | "low-stock" | "out-of-stock";
  updatedAt: string;
};

export type AdminOrderRow = {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  status: string;
  placedOn: string;
  itemsCount: number;
  paymentMethod: string;
  estimatedDelivery?: string;
};

export type AdminUserRow = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  joinedOn: string;
  ordersCount: number;
  totalSpend: number;
  lastOrderDate?: string;
};

export type AdminAccountRow = {
  id: string;
  email: string;
  createdAt: string;
};

export type DashboardMetrics = {
  totalProducts: number;
  activeOrders: number;
  deliveredOrders: number;
  totalUsers: number;
  revenueThisMonth: number;
  topCategories: { name: string; count: number }[];
  recentOrders: AdminOrderRow[];
  bestSellers: AdminProductRow[];
  usesDemoData: boolean;
};

const FALLBACK_STATUSES: AdminProductRow["status"][] = [
  "in-stock",
  "low-stock",
  "in-stock",
  "in-stock",
  "low-stock",
  "out-of-stock",
];

export const getProductsForAdmin = async (): Promise<{
  items: AdminProductRow[];
  isDemo: boolean;
}> => {
  try {
    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { updatedAt: "desc" },
    });

    const items: AdminProductRow[] = products.map((product) => {
      const variants = product.sizes.length;
      return {
        id: product.id.toString(),
        title: product.title,
        category: product.category?.name ?? "Uncategorised",
        price: Number(product.price),
        rating: product.rating ?? null,
        discountPercentage: product.discountPercentage ?? 0,
        variants,
        status:
          variants === 0
            ? "out-of-stock"
            : variants <= 2
            ? "low-stock"
            : "in-stock",
        updatedAt: product.updatedAt.toISOString(),
      };
    });

    return { items, isDemo: false };
  } catch {
    const uniqueProducts = new Map<number, (typeof allProducts)[number]>();
    allProducts.forEach((product) => {
      uniqueProducts.set(product.id, product);
    });

    const now = Date.now();
    const items: AdminProductRow[] = Array.from(uniqueProducts.values()).map(
      (product, index) => ({
        id: `demo-${product.id}`,
        title: product.title,
        category: product.category,
        price: product.price,
        rating: product.rating ?? null,
        discountPercentage: product.discount?.percentage ?? 0,
        variants: product.sizes.length,
        status: FALLBACK_STATUSES[index % FALLBACK_STATUSES.length],
        updatedAt: new Date(now - index * 86_400_000).toISOString(),
      })
    );

    return { items, isDemo: true };
  }
};

export const getOrdersForAdmin = async (): Promise<{
  items: AdminOrderRow[];
  isDemo: boolean;
}> => {
  try {
    const orders = await prisma.order.findMany({
      include: { user: true },
      orderBy: { placedOn: "desc" },
      take: 50,
    });

    const items: AdminOrderRow[] = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.user?.fullName ?? order.shippingName,
      total: order.totalAmount,
      status: order.status,
      placedOn: order.placedOn.toISOString(),
      itemsCount: order.itemsCount,
      paymentMethod: order.paymentMethod,
      estimatedDelivery: order.estimatedDelivery?.toISOString(),
    }));

    return { items, isDemo: false };
  } catch {
    const items: AdminOrderRow[] = sampleOrders.map((order) => ({
      id: order.id,
      orderNumber: order.id,
      customerName: order.shippingAddress.name,
      total: order.totalAmount,
      status: order.status,
      placedOn: order.placedOn,
      itemsCount: order.itemsCount,
      paymentMethod: order.paymentMethod,
      estimatedDelivery: order.estimatedDelivery,
    }));

    return { items, isDemo: true };
  }
};

export const getUsersForAdmin = async (): Promise<{
  items: AdminUserRow[];
  isDemo: boolean;
}> => {
  try {
    const users = await prisma.user.findMany({
      include: {
        orders: {
          orderBy: { placedOn: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const items: AdminUserRow[] = users.map((user) => {
      const totalSpend = user.orders.reduce((sum, order) => sum + order.totalAmount, 0);
      const lastOrderDate = user.orders[0]?.placedOn?.toISOString();

      return {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone ?? undefined,
        joinedOn: user.createdAt.toISOString(),
        ordersCount: user.orders.length,
        totalSpend,
        lastOrderDate,
      };
    });

    return { items, isDemo: false };
  } catch {
    const items: AdminUserRow[] = sampleUsers.map((user) => ({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      joinedOn: user.joinedOn,
      ordersCount: user.ordersCount,
      totalSpend: user.totalSpend,
      lastOrderDate: user.lastOrderDate,
    }));

    return { items, isDemo: true };
  }
};

export const getAdminsForSettings = async (): Promise<{
  admins: AdminAccountRow[];
  isDemo: boolean;
}> => {
  try {
    const admins = await prisma.admin.findMany({
      orderBy: { createdAt: "asc" },
    });

    return {
      admins: admins.map((admin) => ({
        id: admin.id,
        email: admin.email,
        createdAt: admin.createdAt.toISOString(),
      })),
      isDemo: false,
    };
  } catch {
    return {
      admins: sampleAdmins.map((admin) => ({
        id: admin.id,
        email: admin.email,
        createdAt: admin.createdAt,
      })),
      isDemo: true,
    };
  }
};

export const getDashboardMetrics = async (): Promise<DashboardMetrics> => {
  const [productData, orderData, userData] = await Promise.all([
    getProductsForAdmin(),
    getOrdersForAdmin(),
    getUsersForAdmin(),
  ]);

  const usesDemoData =
    productData.isDemo || orderData.isDemo || userData.isDemo;

  const totalProducts = productData.items.length;
  const activeOrders = orderData.items.filter(
    (order) => !["delivered", "cancelled"].includes(order.status)
  ).length;
  const deliveredOrders = orderData.items.filter(
    (order) => order.status === "delivered"
  ).length;
  const totalUsers = userData.items.length;

  const now = new Date();
  const revenueThisMonth = orderData.items
    .filter((order) => {
      const placed = new Date(order.placedOn);
      return (
        placed.getUTCFullYear() === now.getUTCFullYear() &&
        placed.getUTCMonth() === now.getUTCMonth()
      );
    })
    .reduce((sum, order) => sum + order.total, 0);

  const topCategories = Array.from(
    productData.items.reduce((acc, product) => {
      const current = acc.get(product.category) ?? 0;
      acc.set(product.category, current + 1);
      return acc;
    }, new Map<string, number>())
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => ({ name, count }));

  const recentOrders = orderData.items
    .slice()
    .sort(
      (a, b) =>
        new Date(b.placedOn).getTime() - new Date(a.placedOn).getTime()
    )
    .slice(0, 5);

  const bestSellers = productData.items
    .slice()
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 5);

  return {
    totalProducts,
    activeOrders,
    deliveredOrders,
    totalUsers,
    revenueThisMonth,
    topCategories,
    recentOrders,
    bestSellers,
    usesDemoData,
  };
};
