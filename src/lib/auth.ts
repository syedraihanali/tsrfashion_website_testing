import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "./prisma";

export const SESSION_COOKIE_NAME = "tsr_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

type SessionPayload = {
  userId: string;
  token: string;
  expiresAt: Date;
};

export const createSession = async (userId: string): Promise<SessionPayload> => {
  const token = randomUUID().replace(/-/g, "");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await prisma.session.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  return { userId, token, expiresAt };
};

export const setSessionCookie = ({ token, expiresAt }: SessionPayload) => {
  cookies().set({
    name: SESSION_COOKIE_NAME,
    value: token,
    expires: expiresAt,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
};

export const destroySession = async () => {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return;
  }

  cookieStore.delete(SESSION_COOKIE_NAME);

  await prisma.session.deleteMany({
    where: { token: sessionToken },
  });
};

export const getCurrentUser = async () => {
  const sessionToken = cookies().get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { token: sessionToken },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { token: sessionToken } });
    }
    cookies().delete(SESSION_COOKIE_NAME);
    return null;
  }

  return session.user;
};

export const requireCurrentUser = async () => {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { message: "Unauthenticated" },
      { status: 401 }
    );
  }

  return user;
};
