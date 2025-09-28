import { NextResponse } from "next/server";

import { getCurrentAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
    }

    return NextResponse.json({
      admin: {
        id: admin.id,
        email: admin.email,
        createdAt: admin.createdAt,
      },
    });
  } catch (error) {
    console.error("Admin session lookup failed", error);
    return NextResponse.json(
      { message: "Unable to verify session" },
      { status: 500 }
    );
  }
}
