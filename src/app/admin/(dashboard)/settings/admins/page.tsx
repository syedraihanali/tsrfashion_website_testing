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
import { AddAdminForm } from "@/components/admin/add-admin-form";
import { DeleteAdminForm } from "@/components/admin/delete-admin-form";
import { getAdminsForSettings } from "@/lib/admin-dashboard-data";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { formatDate } from "@/lib/formatters";

export default async function AdminSettingsPage() {
  const [{ admins, isDemo }, currentAdmin] = await Promise.all([
    getAdminsForSettings(),
    getCurrentAdmin(),
  ]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">
          Administrator access
        </h2>
        <p className="text-sm text-muted-foreground">
          Invite new teammates or revoke credentials for former staff members.
        </p>
      </div>

      {isDemo && (
        <Alert variant="info">
          <AlertTitle>Changes are not persisted</AlertTitle>
          <AlertDescription>
            Configure the Prisma datasource to manage administrators. Without a
            database connection, this view shows example accounts only.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add a new administrator</CardTitle>
          </CardHeader>
          <CardContent>
            <AddAdminForm />
            <p className="mt-3 text-xs text-muted-foreground">
              New admins receive the provided password. Ask them to update it on
              first login.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current administrators</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead className="hidden text-right sm:table-cell">
                    Added on
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">{admin.email}</TableCell>
                    <TableCell className="hidden text-right text-sm text-muted-foreground sm:table-cell">
                      {formatDate(admin.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DeleteAdminForm
                        adminId={admin.id}
                        disabled={admin.id === currentAdmin?.id}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
