import { AdminLoginCard } from "./_components/admin-login-card";
import { AdminDashboard } from "./_components/admin-dashboard";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { getAdminDashboardData } from "@/lib/admin-dashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-200 via-white to-slate-200 p-6">
        <div className="backdrop-blur-sm">
          <AdminLoginCard />
        </div>
      </main>
    );
  }

  const dashboardData = await getAdminDashboardData();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-100">
      <AdminDashboard admin={admin} initialData={dashboardData} />
    </main>
  );
}
