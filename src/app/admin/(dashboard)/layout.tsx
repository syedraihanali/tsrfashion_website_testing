import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import {
  ClipboardList,
  LayoutDashboard,
  Package,
  Settings2,
  Users,
} from "lucide-react";

import { AdminHeader, AdminSidebar, type AdminNavItem } from "@/components/admin/admin-nav";
import { getCurrentAdmin } from "@/lib/admin-auth";

const navItems: AdminNavItem[] = [
  {
    href: "/admin",
    label: "Dashboard",
    description: "Snapshot of store performance",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/products",
    label: "Products",
    description: "Manage catalog and availability",
    icon: Package,
  },
  {
    href: "/admin/orders",
    label: "Orders",
    description: "Track fulfilment progress",
    icon: ClipboardList,
  },
  {
    href: "/admin/users",
    label: "Customers",
    description: "Review shopper accounts",
    icon: Users,
  },
  {
    href: "/admin/settings/admins",
    label: "Settings",
    description: "Administration preferences",
    icon: Settings2,
  },
];

export default async function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-muted/40">
      <AdminSidebar items={navItems} adminEmail={admin.email} />
      <div className="flex flex-1 flex-col">
        <AdminHeader items={navItems} adminEmail={admin.email} />
        <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
