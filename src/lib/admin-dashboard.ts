import { prisma } from "@/lib/prisma";

export type DashboardMetric = {
  label: string;
  value: number;
  trend?: number;
  helper?: string;
};

export type DashboardOrder = {
  id: string;
  orderNumber: string;
  placedOn: string;
  status: string;
  itemsCount: number;
  totalAmount: number;
  customer?: string;
};

export type DashboardProduct = {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  status: string;
  tags: string[];
  updatedAt: string;
};

export type DashboardSupportMessage = {
  id: string;
  fullName: string;
  email: string;
  subject: string;
  message: string;
  orderNumber?: string | null;
  createdAt: string;
  resolved: boolean;
};

export type DashboardSearchInsight = {
  id: string;
  query: string;
  resultsCount: number;
  searchedAt: string;
};

export type AdminDashboardData = {
  metrics: DashboardMetric[];
  orders: DashboardOrder[];
  products: DashboardProduct[];
  supportMessages: DashboardSupportMessage[];
  searchInsights: DashboardSearchInsight[];
};

export const getAdminDashboardData = async (): Promise<AdminDashboardData> => {
  const [
    revenueAggregate,
    orderCount,
    productCount,
    lowStockCount,
    openSupport,
    recentOrders,
    recentProducts,
    recentSupport,
    recentSearches,
  ] = await Promise.all([
    prisma.order.aggregate({ _sum: { totalAmount: true } }),
    prisma.order.count(),
    prisma.product.count({ where: { status: { not: "ARCHIVED" } } }),
    prisma.product.count({ where: { stock: { lte: 5 }, status: { not: "ARCHIVED" } } }),
    prisma.supportMessage.count({ where: { resolved: false } }),
    prisma.order.findMany({
      orderBy: { placedOn: "desc" },
      take: 8,
      include: { user: true },
    }),
    prisma.product.findMany({
      orderBy: { updatedAt: "desc" },
      take: 8,
      include: {
        tags: { include: { tag: true } },
      },
    }),
    prisma.supportMessage.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.searchLog.findMany({ orderBy: { searchedAt: "desc" }, take: 6 }),
  ]);

  const totalRevenue = revenueAggregate._sum.totalAmount ?? 0;
  const averageOrderValue = orderCount > 0 ? Math.round(totalRevenue / orderCount) : 0;

  return {
    metrics: [
      {
        label: "Total Revenue",
        value: totalRevenue,
        helper: "All time",
      },
      {
        label: "Orders",
        value: orderCount,
        helper: "Completed + in-progress",
      },
      {
        label: "Average Order Value",
        value: averageOrderValue,
        helper: "Revenue / orders",
      },
      {
        label: "Live Products",
        value: productCount,
        helper: lowStockCount ? `${lowStockCount} low stock` : undefined,
      },
      {
        label: "Open Support Tickets",
        value: openSupport,
      },
    ],
    orders: recentOrders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      placedOn: order.placedOn.toISOString(),
      status: order.status,
      itemsCount: order.itemsCount,
      totalAmount: order.totalAmount,
      customer: order.user?.fullName ?? order.shippingName,
    })),
    products: recentProducts.map((product) => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      price: product.salePrice ?? product.price,
      stock: product.stock,
      status: product.status,
      tags: product.tags.map((tag) => tag.tag.label),
      updatedAt: product.updatedAt.toISOString(),
    })),
    supportMessages: recentSupport.map((message) => ({
      id: message.id,
      fullName: message.fullName,
      email: message.email,
      subject: message.subject,
      message: message.message,
      orderNumber: message.orderNumber,
      createdAt: message.createdAt.toISOString(),
      resolved: message.resolved,
    })),
    searchInsights: recentSearches.map((search) => ({
      id: search.id,
      query: search.query,
      resultsCount: search.resultsCount,
      searchedAt: search.searchedAt.toISOString(),
    })),
  };
};
