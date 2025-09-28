import { NextResponse } from "next/server";

import { getAdminDashboardData } from "@/lib/admin-dashboard";
import { requireCurrentAdmin } from "@/lib/admin-auth";

export async function GET() {
  const admin = await requireCurrentAdmin();

  if (admin instanceof NextResponse) {
    return admin;
  }

  try {
    const data = await getAdminDashboardData();
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Failed to load admin dashboard", error);
    return NextResponse.json(
      { message: "Failed to load dashboard data" },
      { status: 500 }
    );
  }
}
