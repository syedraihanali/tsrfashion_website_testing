import { execSync } from "node:child_process";

const run = (command, options = {}) => {
  execSync(command, {
    stdio: "inherit",
    ...options,
  });
};

try {
  run("npx prisma generate");
} catch (error) {
  console.error("prisma generate failed during postinstall.");
  throw error;
}

const shouldSkipMigrate = process.env.SKIP_PRISMA_MIGRATE === "true";

if (shouldSkipMigrate) {
  console.log("SKIP_PRISMA_MIGRATE=true, skipping prisma migrate deploy.");
  process.exit(0);
}

if (!process.env.DATABASE_URL) {
  console.warn(
    "DATABASE_URL is not set; skipping prisma migrate deploy during postinstall."
  );
  process.exit(0);
}

try {
  run("npx prisma migrate deploy");
} catch (error) {
  console.error("prisma migrate deploy failed during postinstall.");
  throw error;
}
