import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { createSession, setSessionCookie } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address").transform((value) => value.toLowerCase()),
  password: z.string().min(6, "Password must be at least 6 characters"),
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

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Incorrect email or password. Please try again." },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      return NextResponse.json(
        { message: "Incorrect email or password. Please try again." },
        { status: 401 }
      );
    }

    const session = await createSession(user.id);
    setSessionCookie(session);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Login error", error);
    return NextResponse.json(
      { message: "We couldn't sign you in. Please try again later." },
      { status: 500 }
    );
  }
}
