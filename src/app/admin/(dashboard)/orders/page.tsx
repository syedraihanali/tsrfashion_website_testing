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
import { getOrdersForAdmin } from "@/lib/admin-dashboard-data";
import { formatCurrency, formatDate } from "@/lib/formatters";

export default async function AdminOrdersPage() {
  const { items, isDemo } = await getOrdersForAdmin();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">Order management</h2>
        <p className="text-sm text-muted-foreground">
          Track recent purchases, payment methods and fulfilment progress.
        </p>
      </div>

      {isDemo && (
        <Alert variant="info">
          <AlertTitle>Demo orders loaded</AlertTitle>
          <AlertDescription>
            Connect your production database to review real order activity. The
            table currently shows illustrative records only.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Latest orders</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="hidden text-right md:table-cell">
                  Placed on
                </TableHead>
                <TableHead className="hidden text-right xl:table-cell">
                  ETA
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    {order.orderNumber}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusToVariant(order.status)}>
                      {statusToLabel(order.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {order.paymentMethod}
                  </TableCell>
                  <TableCell>{order.itemsCount}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(order.total)}
                  </TableCell>
                  <TableCell className="hidden text-right text-sm text-muted-foreground md:table-cell">
                    {formatDate(order.placedOn)}
                  </TableCell>
                  <TableCell className="hidden text-right text-sm text-muted-foreground xl:table-cell">
                    {order.estimatedDelivery ? formatDate(order.estimatedDelivery) : "—"}
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

function statusToVariant(status: string) {
  const normalised = status.toLowerCase();

  if (normalised === "delivered") return "success" as const;
  if (normalised === "cancelled") return "destructive" as const;
  if (normalised === "processing") return "secondary" as const;
  if (normalised === "shipped" || normalised === "out-for-delivery")
    return "info" as const;
  return "muted" as const;
}

function statusToLabel(status: string) {
  const normalised = status.toLowerCase();

  switch (normalised) {
    case "delivered":
      return "Delivered";
    case "cancelled":
      return "Cancelled";
    case "processing":
      return "Processing";
    case "shipped":
      return "Shipped";
    case "out-for-delivery":
      return "Out for delivery";
    default:
      return "Placed";
  }
}
