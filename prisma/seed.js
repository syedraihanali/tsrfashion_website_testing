const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@mail.com";
  const adminPasswordHash = await bcrypt.hash("password12345678", 10);

  await prisma.admin.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      name: "Store Administrator",
      passwordHash: adminPasswordHash,
    },
    update: {
      name: "Store Administrator",
      passwordHash: adminPasswordHash,
    },
  });

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

  const sampleProducts = [
    {
      slug: "t-shirt-with-tape-details",
      name: "T-shirt with Tape Details",
      description:
        "Soft cotton crew neck with subtle tape detailing on the sleeves, designed for everyday comfort.",
      sku: "TSR-TS-001",
      price: 120,
      salePrice: null,
      currency: "USD",
      stock: 140,
      status: "ACTIVE",
      images: [
        { url: "/images/pic1.png", alt: "T-shirt with tape details front" },
        { url: "/images/pic10.png", alt: "T-shirt tape details alternate" },
        { url: "/images/pic11.png", alt: "T-shirt tape details lifestyle" },
      ],
      category: "t-shirts",
      style: "casual",
      colors: ["green", "white"],
      sizes: ["Small", "Medium", "Large", "X-Large"],
      rating: 4.6,
      tagSlugs: ["new-arrival"],
    },
    {
      slug: "skinny-fit-jeans",
      name: "Skinny Fit Jeans",
      description:
        "Classic stretch denim that hugs in all the right places with a mid-rise fit and subtle fading.",
      sku: "TSR-JE-002",
      price: 260,
      salePrice: 208,
      currency: "USD",
      stock: 95,
      status: "ACTIVE",
      images: [{ url: "/images/pic2.png", alt: "Skinny fit jeans" }],
      category: "jeans",
      style: "casual",
      colors: ["blue", "black"],
      sizes: ["Small", "Medium", "Large", "X-Large", "XX-Large"],
      rating: 4.2,
      tagSlugs: ["best-seller"],
    },
    {
      slug: "satin-statement-shirt",
      name: "Satin Statement Shirt",
      description:
        "Bold satin finish shirt with premium buttons and a relaxed drape that easily dresses up or down.",
      sku: "TSR-SH-010",
      price: 140,
      salePrice: 119,
      currency: "USD",
      stock: 60,
      status: "ACTIVE",
      images: [
        { url: "/images/pic10.png", alt: "Satin statement shirt front" },
        { url: "/images/pic11.png", alt: "Satin statement shirt styling" },
      ],
      category: "shirts",
      style: "party",
      colors: ["black", "silver"],
      sizes: ["Small", "Medium", "Large"],
      rating: 4.8,
      tagSlugs: ["best-seller"],
    },
    {
      slug: "oversized-street-hoodie",
      name: "Oversized Street Hoodie",
      description:
        "Heavyweight fleece hoodie with kangaroo pocket and ribbed trims for a relaxed streetwear vibe.",
      sku: "TSR-HD-011",
      price: 175,
      salePrice: null,
      currency: "USD",
      stock: 120,
      status: "ACTIVE",
      images: [{ url: "/images/pic11.png", alt: "Oversized street hoodie" }],
      category: "hoodies",
      style: "casual",
      colors: ["brown", "black"],
      sizes: ["Medium", "Large", "X-Large"],
      rating: 4.7,
      tagSlugs: ["new-arrival", "limited"],
    },
    {
      slug: "vertical-striped-shirt",
      name: "Vertical Striped Shirt",
      description:
        "Breathable cotton shirt with contrasting vertical stripes, tailored fit and buttoned cuffs.",
      sku: "TSR-SH-005",
      price: 232,
      salePrice: 186,
      currency: "USD",
      stock: 80,
      status: "ACTIVE",
      images: [
        { url: "/images/pic5.png", alt: "Vertical striped shirt front" },
        { url: "/images/pic10.png", alt: "Vertical striped shirt alternate" },
      ],
      category: "shirts",
      style: "formal",
      colors: ["blue", "white"],
      sizes: ["Medium", "Large", "X-Large"],
      rating: 4.5,
      tagSlugs: ["limited"],
    },
    {
      slug: "faded-skinny-jeans",
      name: "Faded Skinny Jeans",
      description:
        "Soft washed denim with subtle fading and raw hem finish for an effortless everyday look.",
      sku: "TSR-JE-008",
      price: 210,
      salePrice: null,
      currency: "USD",
      stock: 110,
      status: "ACTIVE",
      images: [{ url: "/images/pic8.png", alt: "Faded skinny jeans" }],
      category: "jeans",
      style: "casual",
      colors: ["blue", "white"],
      sizes: ["Small", "Medium", "Large", "X-Large", "XX-Large"],
      rating: 4.3,
      tagSlugs: ["new-arrival"],
    },
  ];

  for (const product of sampleProducts) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        description: product.description,
        sku: product.sku,
        price: product.price,
        salePrice: product.salePrice,
        currency: product.currency,
        stock: product.stock,
        status: product.status,
        images: product.images,
        category: product.category,
        style: product.style,
        colors: product.colors,
        sizes: product.sizes,
        rating: product.rating,
        tags: {
          deleteMany: {},
          create: product.tagSlugs.map((slug) => ({
            tag: {
              connect: { slug },
            },
          })),
        },
      },
      create: {
        slug: product.slug,
        name: product.name,
        description: product.description,
        sku: product.sku,
        price: product.price,
        salePrice: product.salePrice,
        currency: product.currency,
        stock: product.stock,
        status: product.status,
        images: product.images,
        category: product.category,
        style: product.style,
        colors: product.colors,
        sizes: product.sizes,
        rating: product.rating,
        tags: {
          create: product.tagSlugs.map((slug) => ({
            tag: {
              connect: { slug },
            },
          })),
        },
      },
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
