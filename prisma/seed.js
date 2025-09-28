const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@tsrfashion.app";
  const existingAdmin = await prisma.admin.findUnique({ where: { email: adminEmail } });

  const passwordHash = await bcrypt.hash("Admin1122#", 10);

  if (!existingAdmin) {
    await prisma.admin.create({
      data: {
        email: adminEmail,
        name: "Site Administrator",
        passwordHash,
      },
    });
  } else if (existingAdmin.passwordHash !== passwordHash) {
    await prisma.admin.update({
      where: { email: adminEmail },
      data: { passwordHash },
    });
  }

  // Ensure baseline tags for catalog management
  const defaultTags = [
    { label: "New Arrival", slug: "new-arrival" },
    { label: "Best Seller", slug: "best-seller" },
    { label: "Limited", slug: "limited" },
  ];

  for (const tag of defaultTags) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      create: tag,
      update: tag,
    });
  }
}

main()
  .catch((error) => {
    console.error("Seeding failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
