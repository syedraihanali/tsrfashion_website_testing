"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

import { getCurrentAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export type AdminActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

const initialState: AdminActionState = { status: "idle" };

const createAdminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function createAdminAction(
  _prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const currentAdmin = await getCurrentAdmin();

  if (!currentAdmin) {
    return { status: "error", message: "You must be signed in as an admin." };
  }

  const parsed = createAdminSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message ?? "Invalid data submitted.";
    return { status: "error", message };
  }

  try {
    const existing = await prisma.admin.findUnique({
      where: { email: parsed.data.email },
    });

    if (existing) {
      return { status: "error", message: "An admin with this email already exists." };
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);

    await prisma.admin.create({
      data: {
        email: parsed.data.email,
        passwordHash,
      },
    });
  } catch (error) {
    console.error("createAdminAction", error);
    return {
      status: "error",
      message:
        "Unable to create admin. Configure DATABASE_URL to enable persistence.",
    };
  }

  revalidatePath("/admin/settings/admins");
  return {
    status: "success",
    message: `Admin ${parsed.data.email} added successfully.`,
  };
}

const deleteAdminSchema = z.object({
  adminId: z.string().min(1, "Admin identifier is required"),
});

export async function deleteAdminAction(
  _prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const currentAdmin = await getCurrentAdmin();

  if (!currentAdmin) {
    return { status: "error", message: "You must be signed in as an admin." };
  }

  const parsed = deleteAdminSchema.safeParse({
    adminId: formData.get("adminId"),
  });

  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message ?? "Invalid request.";
    return { status: "error", message };
  }

  if (parsed.data.adminId === currentAdmin.id) {
    return {
      status: "error",
      message: "You cannot remove your own administrator account.",
    };
  }

  try {
    await prisma.admin.delete({
      where: { id: parsed.data.adminId },
    });
  } catch (error) {
    console.error("deleteAdminAction", error);
    return {
      status: "error",
      message:
        "Unable to remove admin. Ensure DATABASE_URL is configured and the admin exists.",
    };
  }

  revalidatePath("/admin/settings/admins");
  return {
    status: "success",
    message: "Administrator removed successfully.",
  };
}

export const actionInitialState = initialState;
