import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

const signupSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Enter a valid email address").transform((value) => value.toLowerCase()),
  phone: z.string().min(6).max(20).optional(),
  password: z.string().min(6, "Use at least 6 characters"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Invalid request";
      return NextResponse.json({ message }, { status: 400 });
    }

    const { email, fullName, password, phone } = parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        fullName,
        phone,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("Signup error", error);
    return NextResponse.json(
      { message: "We couldn't complete your registration. Please try again." },
      { status: 500 }
    );
  }
}
