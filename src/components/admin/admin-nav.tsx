"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  type LucideIcon,
  ClipboardList,
  LayoutDashboard,
  Menu,
  Package,
  Settings2,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export type AdminNavIcon =
  | "dashboard"
  | "products"
  | "orders"
  | "users"
  | "settings";

export type AdminNavItem = {
  href: string;
  label: string;
  description: string;
  icon: AdminNavIcon;
};

const iconComponents: Record<AdminNavIcon, LucideIcon> = {
  dashboard: LayoutDashboard,
  products: Package,
  orders: ClipboardList,
  users: Users,
  settings: Settings2,
};

const isActive = (pathname: string, href: string) => {
  if (href === "/admin") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
};

export function AdminMobileNav({
  items,
}: {
  items: AdminNavItem[];
}) {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="lg:hidden"
          aria-label="Open admin navigation"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <div className="border-b px-6 py-4">
          <p className="text-sm font-semibold">TSR Admin</p>
          <p className="text-xs text-muted-foreground">
            Manage operations and catalog
          </p>
        </div>
        <nav className="flex flex-col gap-1 px-2 py-4">
          {items.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = iconComponents[item.icon];

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

export function AdminSidebar({
  items,
  adminEmail,
}: {
  items: AdminNavItem[];
  adminEmail: string;
}) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 border-r bg-background/70 lg:flex lg:flex-col">
      <div className="border-b px-6 py-6">
        <Link href="/admin" className="text-lg font-semibold">
          TSR Admin
        </Link>
        <p className="mt-1 text-sm text-muted-foreground">
          Tools to run your storefront
        </p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3 py-6">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = iconComponents[item.icon];

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition",
                active
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <div className="flex flex-col">
                <span>{item.label}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {item.description}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>
      <div className="border-t px-6 py-4 text-xs text-muted-foreground">
        Signed in as
        <span className="ml-1 font-medium text-foreground">{adminEmail}</span>
      </div>
    </aside>
  );
}

export function AdminHeader({
  items,
  adminEmail,
}: {
  items: AdminNavItem[];
  adminEmail: string;
}) {
  const pathname = usePathname();

  const activeItem = items.find((item) => isActive(pathname, item.href));

  return (
    <header className="flex items-center justify-between gap-4 border-b bg-background/80 px-4 py-4 shadow-sm lg:px-8">
      <div className="flex items-center gap-3">
        <AdminMobileNav items={items} />
        <div>
          <h1 className="text-lg font-semibold text-foreground">
            {activeItem?.label ?? "Dashboard"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {activeItem?.description ?? "Monitor your store at a glance"}
          </p>
        </div>
      </div>
      <div className="hidden flex-col text-right lg:flex">
        <span className="text-sm font-semibold text-foreground">
          {adminEmail}
        </span>
        <span className="text-xs text-muted-foreground">Administrator</span>
      </div>
    </header>
  );
}
