import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_ADMIN_EMAIL = "admin@tsr-fashion.com";
const DEFAULT_ADMIN_PASSWORD = "Admin123!";
const DEFAULT_ADMIN_NAME = "Site Administrator";

const resolveEnv = (key: string, fallback: string) =>
  process.env[key] && process.env[key]!.trim().length > 0
    ? process.env[key]!.trim()
    : fallback;

async function main() {
  const email = resolveEnv("ADMIN_EMAIL", DEFAULT_ADMIN_EMAIL).toLowerCase();
  const password = resolveEnv("ADMIN_PASSWORD", DEFAULT_ADMIN_PASSWORD);
  const fullName = resolveEnv("ADMIN_FULL_NAME", DEFAULT_ADMIN_NAME);

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      fullName,
      passwordHash,
      role: Role.ADMIN,
    },
    create: {
      email,
      fullName,
      passwordHash,
      role: Role.ADMIN,
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
    },
  });

  console.log("Admin user ready:");
  console.log(`  Email: ${admin.email}`);
  console.log(`  Password: ${password}`);
  console.log(`  Name: ${admin.fullName}`);
}

main()
  .catch((error) => {
    console.error("Seeding admin user failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
