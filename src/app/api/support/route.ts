import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const supportSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Enter a valid email address"),
  subject: z.string().min(1, "Subject is required").max(150, "Subject is too long"),
  message: z
    .string()
    .min(1, "Message is required")
    .max(2000, "Message must be 2000 characters or less"),
  orderNumber: z.string().min(1).optional(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const parsed = supportSchema.safeParse(body);

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid request";
    return NextResponse.json({ message }, { status: 400 });
  }

  const user = await getCurrentUser();
  const payload = parsed.data;

  try {
    await prisma.supportMessage.create({
      data: {
        userId: user?.id,
        fullName: payload.fullName,
        email: payload.email,
        subject: payload.subject,
        message: payload.message,
        orderNumber: payload.orderNumber,
      },
    });

    return NextResponse.json({ message: "Your message has been received" });
  } catch (error) {
    console.error("Failed to store support message", error);
    return NextResponse.json(
      { message: "We couldn't submit your request. Please try again." },
      { status: 500 }
    );
  }
}
