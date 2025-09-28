import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import {
  createAdminSession,
  setAdminSessionCookie,
} from "@/lib/admin-auth";

const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Enter a valid email address")
    .transform((value) => value.toLowerCase()),
  password: z
    .string({ required_error: "Password is required" })
    .min(6, "Password must be at least 6 characters"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Invalid request";
      return NextResponse.json({ message }, { status: 400 });
    }

    const { email, password } = parsed.data;

    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      return NextResponse.json(
        { message: "Incorrect email or password. Please try again." },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, admin.passwordHash);

    if (!passwordMatch) {
      return NextResponse.json(
        { message: "Incorrect email or password. Please try again." },
        { status: 401 }
      );
    }

    const session = await createAdminSession(admin.id);
    setAdminSessionCookie(session);

    return NextResponse.json({
      admin: {
        id: admin.id,
        email: admin.email,
        createdAt: admin.createdAt,
      },
    });
  } catch (error) {
    console.error("Admin login error", error);
    return NextResponse.json(
      { message: "We couldn't sign you in. Please try again later." },
      { status: 500 }
    );
  }
}
