import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDashboardMetrics } from "@/lib/admin-dashboard-data";
import { formatCurrency, formatDate } from "@/lib/formatters";

export default async function AdminDashboardPage() {
  const metrics = await getDashboardMetrics();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">Welcome back</h2>
        <p className="text-sm text-muted-foreground">
          Monitor the latest orders, popular products and storefront health.
        </p>
      </div>

      {metrics.usesDemoData && (
        <Alert variant="info">
          <AlertTitle>Using demo data</AlertTitle>
          <AlertDescription>
            Connect a database via <code>DATABASE_URL</code> to see live metrics
            from your storefront. The dashboard currently renders seeded demo
            records.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-foreground">
              {metrics.totalProducts}
            </p>
            <p className="text-sm text-muted-foreground">
              Across all active categories
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-foreground">
              {metrics.activeOrders}
            </p>
            <p className="text-sm text-muted-foreground">
              Awaiting fulfilment or delivery
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-foreground">
              {metrics.totalUsers}
            </p>
            <p className="text-sm text-muted-foreground">
              Registered shopper accounts
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revenue this month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-foreground">
              {formatCurrency(metrics.revenueThisMonth)}
            </p>
            <p className="text-sm text-muted-foreground">
              Based on completed orders
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Recent orders</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Placed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order.orderNumber}
                    </TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(order.total)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={mapOrderStatus(order.status).variant}>
                        {mapOrderStatus(order.status).label}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                      {formatDate(order.placedOn)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Top categories</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {metrics.topCategories.map((category) => (
                <li key={category.name} className="flex items-center justify-between">
                  <span className="font-medium text-foreground">
                    {category.name}
                  </span>
                  <Badge variant="secondary">{category.count} SKUs</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Best rated products</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Variants</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="text-right">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.bestSellers.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.title}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.variants}</TableCell>
                  <TableCell>
                    {product.rating ? product.rating.toFixed(1) : "—"}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(product.price)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function mapOrderStatus(status: string) {
  const normalised = status.toLowerCase();

  if (normalised === "delivered") {
    return { label: "Delivered", variant: "success" as const };
  }

  if (normalised === "cancelled") {
    return { label: "Cancelled", variant: "destructive" as const };
  }

  if (normalised === "processing") {
    return { label: "Processing", variant: "secondary" as const };
  }

  if (normalised === "shipped" || normalised === "out-for-delivery") {
    return { label: "In transit", variant: "info" as const };
  }

  return { label: "Placed", variant: "muted" as const };
}
