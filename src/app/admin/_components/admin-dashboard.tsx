"use client";

import { useMemo, useState, useTransition } from "react";
import type { Admin } from "@prisma/client";
import { LogOut, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AdminDashboardData, DashboardMetric } from "@/lib/admin-dashboard";
import { formatCurrency, formatDate } from "@/lib/utils";

const metricAccent: Record<number, string> = {
  0: "bg-gradient-to-br from-[#111827] via-[#1f2937] to-[#111827] text-white",
  1: "bg-gradient-to-br from-[#d97706] via-[#f59e0b] to-[#d97706] text-white",
  2: "bg-gradient-to-br from-[#0f766e] via-[#14b8a6] to-[#0f766e] text-white",
  3: "bg-gradient-to-br from-[#2563eb] via-[#3b82f6] to-[#2563eb] text-white",
  4: "bg-gradient-to-br from-[#7c3aed] via-[#a855f7] to-[#7c3aed] text-white",
};

const getStatusBadgeVariant = (status: string) => {
  const normalized = status.toLowerCase();

  if (normalized.includes("deliver") || normalized.includes("complete")) {
    return "success" as const;
  }

  if (normalized.includes("cancel")) {
    return "destructive" as const;
  }

  if (normalized.includes("ship") || normalized.includes("process")) {
    return "secondary" as const;
  }

  return "outline" as const;
};

type AdminDashboardProps = {
  admin: Pick<Admin, "id" | "email" | "name">;
  initialData: AdminDashboardData;
};

export const AdminDashboard = ({ admin, initialData }: AdminDashboardProps) => {
  const [dashboardData, setDashboardData] = useState<AdminDashboardData>(initialData);
  const [isRefreshing, startRefresh] = useTransition();
  const [isSigningOut, startSignOut] = useTransition();

  const greeting = useMemo(() => {
    const base = admin.name?.split(" ")[0] ?? admin.email.split("@")[0];
    return `Welcome back, ${base.charAt(0).toUpperCase()}${base.slice(1)}`;
  }, [admin.email, admin.name]);

  const handleRefresh = () => {
    startRefresh(async () => {
      try {
        const response = await fetch("/api/admin/dashboard", { credentials: "include" });
        if (!response.ok) {
          toast.error("Unable to refresh dashboard data.");
          return;
        }
        const payload = (await response.json()) as { data: AdminDashboardData };
        setDashboardData(payload.data);
        toast.success("Dashboard updated");
      } catch (error) {
        console.error("Failed to refresh admin dashboard", error);
        toast.error("Unable to refresh dashboard data.");
      }
    });
  };

  const handleLogout = () => {
    startSignOut(async () => {
      try {
        const response = await fetch("/api/admin/logout", {
          method: "POST",
          credentials: "include",
        });

        if (!response.ok) {
          toast.error("Unable to sign out. Please try again.");
          return;
        }

        toast.info("Signed out");
        window.location.href = "/admin";
      } catch (error) {
        console.error("Failed to sign out", error);
        toast.error("Unable to sign out. Please try again.");
      }
    });
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">{greeting}</h1>
          <p className="text-sm text-muted-foreground">
            Monitor TSR Fashion performance, manage the catalog, and respond to customer needs in real time.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className="h-4 w-4" /> {isRefreshing ? "Refreshing" : "Refresh"}
          </Button>
          <Button variant="secondary" className="gap-2" onClick={handleLogout} disabled={isSigningOut}>
            <LogOut className="h-4 w-4" /> {isSigningOut ? "Signing out" : "Sign out"}
          </Button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {dashboardData.metrics.map((metric, index) => (
          <Card
            key={metric.label}
            className={index <= 4 ? metricAccent[index] ?? "" : "bg-white"}
          >
            <CardHeader className="p-6">
              <CardDescription className={index <= 4 ? "text-white/80" : undefined}>{metric.label}</CardDescription>
              <CardTitle className="text-3xl font-semibold">
                {formatMetricValue(metric)}
              </CardTitle>
              {metric.helper ? (
                <p className={index <= 4 ? "text-sm text-white/70" : "text-sm text-muted-foreground"}>{metric.helper}</p>
              ) : null}
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Track the latest customer purchases and order health.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-6">Order #</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Items</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboardData.orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="px-6 text-center text-muted-foreground">
                      No orders yet. Start promoting products to drive sales.
                    </TableCell>
                  </TableRow>
                ) : (
                  dashboardData.orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="px-6 font-medium">
                        <div className="flex flex-col">
                          <span>{order.orderNumber}</span>
                          <span className="text-xs text-muted-foreground">{formatDate(order.placedOn)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(order.status)} className="capitalize">
                          {order.status.replace(/-/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>{order.customer ?? "Guest"}</TableCell>
                      <TableCell className="text-right">{order.itemsCount}</TableCell>
                      <TableCell className="text-right">{formatCurrency(order.totalAmount)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Support Messages</CardTitle>
            <CardDescription>Latest customer communications needing attention.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {dashboardData.supportMessages.length === 0 ? (
              <p className="text-sm text-muted-foreground">No messages at the moment. You’re all caught up!</p>
            ) : (
              dashboardData.supportMessages.map((message) => (
                <div key={message.id} className="rounded-lg border border-border bg-muted/20 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-foreground">{message.fullName}</p>
                      <p className="text-xs text-muted-foreground">{message.email}</p>
                    </div>
                    <Badge variant={message.resolved ? "muted" : "secondary"}>
                      {message.resolved ? "Resolved" : "Open"}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm font-medium text-foreground">{message.subject}</p>
                  <p className="mt-1 max-h-24 overflow-hidden text-sm text-muted-foreground">{message.message}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatDate(message.createdAt)}</span>
                    {message.orderNumber ? <span>Order: {message.orderNumber}</span> : null}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Product Management</CardTitle>
            <CardDescription>Review inventory, availability, and merchandising tags.</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-6">Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-center">Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tags</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboardData.products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="px-6 text-center text-muted-foreground">
                      No products synced yet. Import your catalog to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  dashboardData.products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="px-6">
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{product.name}</span>
                          <span className="text-xs text-muted-foreground">
                            Last updated {formatDate(product.updatedAt)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{product.sku}</TableCell>
                      <TableCell className="text-center">{product.stock}</TableCell>
                      <TableCell>
                        <Badge variant={product.status === "ACTIVE" ? "success" : product.status === "DRAFT" ? "muted" : "secondary"}>
                          {product.status.toLowerCase().replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <div className="flex flex-wrap gap-1">
                          {product.tags.length === 0 ? (
                            <span className="text-xs text-muted-foreground">No tags</span>
                          ) : (
                            product.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-[11px] uppercase tracking-wide">
                                {tag}
                              </Badge>
                            ))
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Top Searches</CardTitle>
            <CardDescription>Understand what shoppers are looking for right now.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboardData.searchInsights.length === 0 ? (
              <p className="text-sm text-muted-foreground">No on-site searches recorded yet.</p>
            ) : (
              dashboardData.searchInsights.map((search) => (
                <div key={search.id} className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-foreground">{search.query}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(search.searchedAt)}</p>
                  </div>
                  <Badge variant="outline">{search.resultsCount} results</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

const formatMetricValue = (metric: DashboardMetric) => {
  if (metric.label.toLowerCase().includes("revenue") || metric.label.toLowerCase().includes("value")) {
    return formatCurrency(metric.value);
  }

  return new Intl.NumberFormat().format(metric.value);
};
