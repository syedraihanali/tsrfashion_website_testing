import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/auth";

const updateSchema = z
  .object({
    fullName: z
      .string()
      .min(1, "Full name is required")
      .max(255, "Full name is too long")
      .optional(),
    phone: z
      .union([
        z
          .string()
          .min(6, "Enter a valid phone number")
          .max(20, "Enter a valid phone number"),
        z.literal(""),
        z.null(),
      ])
      .optional()
      .transform((value) => {
        if (value === "" || value === null) {
          return null;
        }
        return value;
      }),
  })
  .refine(
    (data) => typeof data.fullName !== "undefined" || typeof data.phone !== "undefined",
    {
      message: "No changes provided",
      path: ["fullName"],
    }
  );

export async function PATCH(request: Request) {
  const maybeUser = await requireCurrentUser();

  if (maybeUser instanceof NextResponse) {
    return maybeUser;
  }

  const body = await request.json().catch(() => null);

  const parsed = updateSchema.safeParse(body);

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const message = issue?.message ?? "Invalid request";
    return NextResponse.json({ message }, { status: 400 });
  }

  const payload = parsed.data;
  const updateData: { fullName?: string; phone?: string | null } = {};

  if (typeof payload.fullName !== "undefined") {
    updateData.fullName = payload.fullName.trim();
  }

  if (typeof payload.phone !== "undefined") {
    updateData.phone = payload.phone ? payload.phone.trim() : null;
  }

  const currentUser = maybeUser;

  const user = await prisma.user.update({
    where: { id: currentUser.id },
    data: updateData,
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ user });
}
