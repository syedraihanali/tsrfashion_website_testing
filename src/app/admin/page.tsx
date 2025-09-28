import { redirect } from "next/navigation";

import { getCurrentAdmin } from "@/lib/admin-auth";

export default async function AdminDashboardPage() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <main className="pb-20">
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        <section className="mx-auto mt-10 rounded-[24px] border border-black/10 bg-white p-6 sm:p-10">
          <h1 className="text-3xl font-semibold text-black sm:text-4xl">Admin Dashboard</h1>
          <p className="mt-4 text-base text-black/60">
            Welcome back{admin.email ? `, ${admin.email}` : ""}! This is your
            starting point for managing products, orders and reviews.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-black/10 bg-[#F0F0F0] p-6">
              <p className="text-sm font-medium uppercase tracking-wide text-black/60">
                Quick Overview
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-black">
                Store configuration is ready
              </h2>
              <p className="mt-2 text-sm text-black/60">
                Product catalog, categories and reviews are now stored in the database.
                You can extend this dashboard with analytics, product management and more.
              </p>
            </div>
            <div className="rounded-2xl border border-black/10 bg-[#F0F0F0] p-6">
              <p className="text-sm font-medium uppercase tracking-wide text-black/60">
                Next Steps
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-black/70">
                <li>Review seeded catalog data pulled from the production database.</li>
                <li>Connect order management and inventory workflows.</li>
                <li>Add widgets here to monitor store performance at a glance.</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
