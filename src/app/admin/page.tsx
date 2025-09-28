import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Clock,
  DollarSign,
  PackageSearch,
  ShoppingBag,
  Users,
} from "lucide-react";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (value: Date) =>
  new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);

const formatStatus = (status: string) => {
  if (!status) {
    return "Unknown";
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
};

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/admin");
  }

  if (user.role !== "ADMIN") {
    redirect("/");
  }

  const [customerCount, orderCount, pendingOrderCount, revenueAggregate, latestOrder] =
    await prisma.$transaction([
      prisma.user.count(),
      prisma.order.count(),
      prisma.order.count({
        where: {
          status: {
            in: ["pending", "processing"],
          },
        },
      }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
      }),
      prisma.order.findFirst({
        orderBy: { placedOn: "desc" },
        select: {
          orderNumber: true,
          totalAmount: true,
          status: true,
          placedOn: true,
          shippingName: true,
        },
      }),
    ]);

  const totalRevenue = revenueAggregate._sum.totalAmount ?? 0;

  const stats = [
    {
      label: "Registered customers",
      value: customerCount.toLocaleString("en-US"),
      description: "Unique shopper accounts",
      icon: Users,
    },
    {
      label: "Total orders",
      value: orderCount.toLocaleString("en-US"),
      description: "Orders placed all-time",
      icon: ShoppingBag,
    },
    {
      label: "Awaiting fulfilment",
      value: pendingOrderCount.toLocaleString("en-US"),
      description: "Pending or processing",
      icon: Clock,
    },
    {
      label: "Total revenue",
      value: formatCurrency(totalRevenue),
      description: "Lifetime order value",
      icon: DollarSign,
    },
  ] as const;

  return (
    <main className="pb-20">
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        <header className="pt-8 pb-10 sm:pb-12">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-black/60">
            Admin overview
          </p>
          <h1 className="mt-4 text-3xl font-bold text-black sm:text-[40px]">
            Welcome back, {user.fullName.split(" ")[0] ?? "Admin"}
          </h1>
          <p className="mt-3 max-w-2xl text-base text-black/60">
            Quickly review how TSR Fashion is performing and jump into the tools
            you use most to run the store.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild className="h-[48px] rounded-full bg-black px-6 text-sm font-semibold text-white hover:bg-black/90">
              <Link href="/shop">View storefront</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-[48px] rounded-full border-black/15 bg-white px-6 text-sm font-semibold text-black hover:border-black"
            >
              <Link href="/profile">Manage account</Link>
            </Button>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col justify-between gap-6 rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_12px_40px_-20px_rgba(15,23,42,0.2)]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-black/50">{stat.label}</p>
                  <p className="mt-3 text-3xl font-semibold text-black sm:text-[34px]">
                    {stat.value}
                  </p>
                </div>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white">
                  <stat.icon className="h-6 w-6" />
                </span>
              </div>
              <p className="text-sm text-black/50">{stat.description}</p>
            </div>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <div className="rounded-[28px] border border-black/10 bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-black">Latest order</h2>
              <PackageSearch className="h-5 w-5 text-black/60" />
            </div>
            {latestOrder ? (
              <dl className="mt-6 space-y-4 text-sm text-black/70">
                <div className="flex items-center justify-between">
                  <dt className="text-black/60">Order</dt>
                  <dd className="font-semibold text-black">
                    #{latestOrder.orderNumber}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-black/60">Customer</dt>
                  <dd className="font-medium text-black">
                    {latestOrder.shippingName}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-black/60">Placed</dt>
                  <dd className="font-medium text-black">
                    {formatDate(latestOrder.placedOn)}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-black/60">Status</dt>
                  <dd className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-black/70">
                    {formatStatus(latestOrder.status)}
                  </dd>
                </div>
                <div className="flex items-center justify-between border-t border-dashed border-black/10 pt-4">
                  <dt className="text-black/60">Order total</dt>
                  <dd className="text-base font-semibold text-black">
                    {formatCurrency(latestOrder.totalAmount)}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="mt-6 text-sm text-black/60">
                There are no orders yet. Once customers start placing orders,
                you&rsquo;ll see the most recent one here.
              </p>
            )}
          </div>

          <div className="rounded-[28px] border border-black/10 bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-black">Quick actions</h2>
              <Clock className="h-5 w-5 text-black/60" />
            </div>
            <div className="mt-6 space-y-4">
              <Button
                asChild
                className="h-[48px] w-full justify-between rounded-2xl bg-black px-4 text-sm font-semibold text-white hover:bg-black/90"
              >
                <Link href="/order-tracking">
                  Review order tracking
                  <span aria-hidden>&rarr;</span>
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-[48px] w-full justify-between rounded-2xl border-black/15 bg-white px-4 text-sm font-semibold text-black hover:border-black"
              >
                <Link href="/support">
                  View support inbox
                  <span aria-hidden>&rarr;</span>
                </Link>
              </Button>
            </div>
            <p className="mt-5 text-xs text-black/50">
              Need to perform something more advanced? You can always reach out
              to the engineering team to extend the dashboard with additional
              admin tools.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
