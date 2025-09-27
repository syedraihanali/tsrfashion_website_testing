import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE_NAME, requireCurrentUser } from "@/lib/auth";

const passwordSchema = z
  .object({
    currentPassword: z
      .string({ required_error: "Current password is required" })
      .min(1, "Current password is required"),
    newPassword: z
      .string({ required_error: "New password is required" })
      .min(6, "New password must be at least 6 characters"),
    confirmPassword: z
      .string({ required_error: "Confirm your new password" })
      .min(6, "Confirm password must be at least 6 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function PATCH(request: Request) {
  const maybeUser = await requireCurrentUser();

  if (maybeUser instanceof NextResponse) {
    return maybeUser;
  }

  const body = await request.json().catch(() => null);
  const parsed = passwordSchema.safeParse(body);

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid request";
    return NextResponse.json({ message }, { status: 400 });
  }

  const { currentPassword, newPassword } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { id: maybeUser.id },
    select: { passwordHash: true },
  });

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const matches = await bcrypt.compare(currentPassword, user.passwordHash);

  if (!matches) {
    return NextResponse.json(
      { message: "Your current password is incorrect" },
      { status: 400 }
    );
  }

  const isSamePassword = await bcrypt.compare(newPassword, user.passwordHash);

  if (isSamePassword) {
    return NextResponse.json(
      { message: "Choose a password you haven't used before" },
      { status: 400 }
    );
  }

  const hashed = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: maybeUser.id },
    data: { passwordHash: hashed },
  });

  const currentToken = cookies().get(SESSION_COOKIE_NAME)?.value;

  await prisma.session.deleteMany({
    where: {
      userId: maybeUser.id,
      ...(currentToken
        ? {
            NOT: {
              token: currentToken,
            },
          }
        : {}),
    },
  });

  return NextResponse.json({ message: "Password updated successfully" });
}
