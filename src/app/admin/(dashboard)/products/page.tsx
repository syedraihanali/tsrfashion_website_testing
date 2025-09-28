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
import { getProductsForAdmin } from "@/lib/admin-dashboard-data";
import { formatCurrency, formatDate } from "@/lib/formatters";

export default async function AdminProductsPage() {
  const { items, isDemo } = await getProductsForAdmin();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">Product management</h2>
        <p className="text-sm text-muted-foreground">
          Review catalogue performance, discounting and stock health.
        </p>
      </div>

      {isDemo && (
        <Alert variant="info">
          <AlertTitle>Demo catalog in use</AlertTitle>
          <AlertDescription>
            Configure a live database to update products directly. The table
            below reflects seeded storefront data for demonstration purposes.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Catalogue overview</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Variants</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="hidden text-right lg:table-cell">
                  Updated
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.title}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(product.status)}>
                      {statusLabel(product.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {product.discountPercentage > 0
                      ? `${product.discountPercentage}%`
                      : "—"}
                  </TableCell>
                  <TableCell>{product.variants}</TableCell>
                  <TableCell>
                    {product.rating ? product.rating.toFixed(1) : "—"}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(product.price)}
                  </TableCell>
                  <TableCell className="hidden text-right text-sm text-muted-foreground lg:table-cell">
                    {formatDate(product.updatedAt)}
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

type ProductStatus = "in-stock" | "low-stock" | "out-of-stock";

function statusVariant(status: ProductStatus) {
  switch (status) {
    case "in-stock":
      return "success" as const;
    case "low-stock":
      return "warning" as const;
    case "out-of-stock":
      return "destructive" as const;
    default:
      return "muted" as const;
  }
}

function statusLabel(status: ProductStatus) {
  switch (status) {
    case "in-stock":
      return "In stock";
    case "low-stock":
      return "Low stock";
    case "out-of-stock":
      return "Out of stock";
    default:
      return "Unknown";
  }
}
