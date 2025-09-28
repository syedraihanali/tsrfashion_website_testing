import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getUsersForAdmin } from "@/lib/admin-dashboard-data";
import { formatCurrency, formatDate } from "@/lib/formatters";

export default async function AdminUsersPage() {
  const { items, isDemo } = await getUsersForAdmin();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">Customer directory</h2>
        <p className="text-sm text-muted-foreground">
          Understand your shoppers, their order history and engagement.
        </p>
      </div>

      {isDemo && (
        <Alert variant="info">
          <AlertTitle>Showing sample customers</AlertTitle>
          <AlertDescription>
            Add a database connection to access real customer accounts. The
            records listed below are mock profiles for onboarding.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Customers</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead className="hidden text-right md:table-cell">
                  Total spend
                </TableHead>
                <TableHead className="hidden text-right lg:table-cell">
                  Joined
                </TableHead>
                <TableHead className="hidden text-right lg:table-cell">
                  Last order
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.fullName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.phone ?? "—"}
                  </TableCell>
                  <TableCell>{user.ordersCount}</TableCell>
                  <TableCell className="hidden text-right font-medium md:table-cell">
                    {formatCurrency(user.totalSpend)}
                  </TableCell>
                  <TableCell className="hidden text-right text-sm text-muted-foreground lg:table-cell">
                    {formatDate(user.joinedOn)}
                  </TableCell>
                  <TableCell className="hidden text-right text-sm text-muted-foreground lg:table-cell">
                    {user.lastOrderDate ? formatDate(user.lastOrderDate) : "—"}
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
