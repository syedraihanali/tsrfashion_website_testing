import { NextResponse } from "next/server";

import { destroyAdminSession } from "@/lib/admin-auth";

export async function POST() {
  try {
    await destroyAdminSession();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin logout failed", error);
    return NextResponse.json({ message: "Unable to logout" }, { status: 500 });
  }
}
