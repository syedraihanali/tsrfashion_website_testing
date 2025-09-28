import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { prisma } from "./prisma";

export const ADMIN_SESSION_COOKIE_NAME = "tsr_admin_session";
const ADMIN_SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

type AdminSessionPayload = {
  adminId: string;
  token: string;
  expiresAt: Date;
};

export const createAdminSession = async (
  adminId: string
): Promise<AdminSessionPayload> => {
  const token = randomUUID().replace(/-/g, "");
  const expiresAt = new Date(Date.now() + ADMIN_SESSION_TTL_MS);

  await prisma.adminSession.create({
    data: {
      token,
      adminId,
      expiresAt,
    },
  });

  return { adminId, token, expiresAt };
};

export const setAdminSessionCookie = ({ token, expiresAt }: AdminSessionPayload) => {
  cookies().set({
    name: ADMIN_SESSION_COOKIE_NAME,
    value: token,
    expires: expiresAt,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
};

export const destroyAdminSession = async () => {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return;
  }

  cookieStore.delete(ADMIN_SESSION_COOKIE_NAME);

  await prisma.adminSession.deleteMany({
    where: { token: sessionToken },
  });
};

export const getCurrentAdmin = async () => {
  const sessionToken = cookies().get(ADMIN_SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return null;
  }

  const session = await prisma.adminSession.findUnique({
    where: { token: sessionToken },
    include: { admin: true },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.adminSession.delete({ where: { token: sessionToken } });
    }

    cookies().delete(ADMIN_SESSION_COOKIE_NAME);
    return null;
  }

  return session.admin;
};

export const requireCurrentAdmin = async () => {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return NextResponse.json(
      { message: "Unauthenticated" },
      { status: 401 }
    );
  }

  return admin;
};
