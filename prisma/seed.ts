import path from "node:path";
import { promises as fs } from "node:fs";

import { Prisma, PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Client as MinioClient } from "minio";

import {
  allProducts,
  productCategories,
  reviewsData,
} from "../src/lib/data/products";

const prisma = new PrismaClient();

const ADMIN_EMAIL = "admin@tsrfashiop.app";
const ADMIN_PASSWORD = "12345678";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

type ImageUploadResult = Map<string, string>;

const parseEndpointConfig = (rawEndpoint: string) => {
  const trimmed = rawEndpoint.trim();
  const hasScheme = /^https?:\/\//i.test(trimmed);
  const candidate = hasScheme ? trimmed : `http://${trimmed}`;

  try {
    const url = new URL(candidate);

    if (url.pathname !== "/" || url.search || url.hash) {
      throw new Error("MinIO endpoint must not contain path, search, or hash components.");
    }

    return {
      host: url.hostname,
      port: url.port ? Number.parseInt(url.port, 10) : undefined,
      useSSL: hasScheme ? url.protocol === "https:" : undefined,
    };
  } catch (error) {
    throw new Error(`Invalid MinIO endpoint URL: ${rawEndpoint}`);
  }
};

const createMinioClient = () => {
  const endpointRaw = process.env.MINIO_ENDPOINT;
  const accessKey = process.env.MINIO_ACCESS_KEY;
  const secretKey = process.env.MINIO_SECRET_KEY;

  if (!endpointRaw || !accessKey || !secretKey) {
    throw new Error(
      "Missing MinIO configuration. Please set MINIO_ENDPOINT, MINIO_ACCESS_KEY and MINIO_SECRET_KEY."
    );
  }

  const endpointConfig = parseEndpointConfig(endpointRaw);
  const port =
    Number.parseInt(process.env.MINIO_PORT ?? "", 10) ||
    endpointConfig.port ||
    9000;
  const useSSL =
    (process.env.MINIO_USE_SSL ?? "") !== ""
      ? (process.env.MINIO_USE_SSL ?? "false").toLowerCase() === "true"
      : endpointConfig.useSSL ?? false;

  return new MinioClient({
    endPoint: endpointConfig.host,
    port,
    useSSL,
    accessKey,
    secretKey,
  });
};

const ensureBucket = async (client: MinioClient, bucket: string) => {
  const exists = await client.bucketExists(bucket).catch(() => false);

  if (!exists) {
    await client.makeBucket(bucket);
    console.log(`Created MinIO bucket: ${bucket}`);
  }

  const policy = {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Principal: { AWS: ["*"] },
        Action: ["s3:GetObject"],
        Resource: [`arn:aws:s3:::${bucket}/*`],
      },
    ],
  };

  try {
    await client.setBucketPolicy(bucket, JSON.stringify(policy));
  } catch (error) {
    console.warn("Failed to set bucket policy", error);
  }
};

const uploadProductImages = async (): Promise<ImageUploadResult> => {
  const bucket = process.env.MINIO_BUCKET ?? "tsrfashion-products";
  const endpointRaw = process.env.MINIO_ENDPOINT;

  if (!endpointRaw) {
    throw new Error("MINIO_ENDPOINT must be set to upload product images.");
  }

  const endpointConfig = parseEndpointConfig(endpointRaw);
  const port =
    Number.parseInt(process.env.MINIO_PORT ?? "", 10) ||
    endpointConfig.port ||
    9000;
  const client = createMinioClient();
  await ensureBucket(client, bucket);

  const scheme =
    (process.env.MINIO_USE_SSL ?? "") !== ""
      ? (process.env.MINIO_USE_SSL ?? "false").toLowerCase() === "true"
        ? "https"
        : "http"
      : endpointConfig.useSSL
      ? "https"
      : "http";
  const publicBase =
    process.env.MINIO_PUBLIC_URL ??
    `${scheme}://${endpointConfig.host}:${port}`;

  const imagePaths = new Set<string>();
  allProducts.forEach((product) => {
    const gallery = product.gallery && product.gallery.length > 0
      ? product.gallery
      : [product.srcUrl];
    gallery.forEach((path) => imagePaths.add(path));
  });

  const uploads: ImageUploadResult = new Map();

  for (const imagePath of Array.from(imagePaths)) {
    const objectPath = imagePath.replace(/^\/+/, "");
    const localPath = path.join(process.cwd(), "public", objectPath);

    try {
      await fs.access(localPath);
    } catch (error) {
      console.warn(`Image file not found for upload: ${localPath}`);
      continue;
    }

    const metaData = { "Content-Type": "image/png" };

    await client.fPutObject(bucket, objectPath, localPath, metaData);
    const url = `${publicBase.replace(/\/$/, "")}/${bucket}/${objectPath}`;
    uploads.set(imagePath, url);
  }

  console.log(`Uploaded ${uploads.size} product images to MinIO bucket ${bucket}`);

  return uploads;
};

const seedAdmin = async () => {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  await prisma.admin.upsert({
    where: { email: ADMIN_EMAIL },
    update: { passwordHash },
    create: {
      email: ADMIN_EMAIL,
      passwordHash,
    },
  });

  console.log(`Ensured admin account for ${ADMIN_EMAIL}`);
};

const seedCatalog = async (imageUploads: ImageUploadResult) => {
  await prisma.review.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  const categories = new Map<string, { id: number }>();

  for (const categoryName of productCategories) {
    const category = await prisma.category.create({
      data: {
        name: categoryName,
        slug: slugify(categoryName),
        description: `Explore our collection of ${categoryName} products.`,
      },
    });

    categories.set(categoryName, category);
  }

  const products = [] as Array<{ id: number }>;

  for (const product of allProducts) {
    const gallery = product.gallery && product.gallery.length > 0
      ? product.gallery
      : [product.srcUrl];
    const uniqueGallery = Array.from(new Set(gallery));

    const category = categories.get(product.category);
    if (!category) {
      throw new Error(`Missing category for product ${product.title}`);
    }

    const created = await prisma.product.create({
      data: {
        title: product.title,
        slug: slugify(product.title),
        price: new Prisma.Decimal(product.price),
        rating: product.rating,
        discountAmount: product.discount.amount,
        discountPercentage: product.discount.percentage,
        colors: product.colors,
        sizes: product.sizes,
        style: product.style,
        categoryId: category.id,
        images: {
          create: uniqueGallery.map((image, index) => ({
            url:
              imageUploads.get(image) ??
              imageUploads.get(product.srcUrl) ??
              image,
            isPrimary: index === 0,
          })),
        },
      },
    });

    products.push(created);
  }

  console.log(`Seeded ${products.length} products`);

  if (products.length === 0) {
    return;
  }

  await Promise.all(
    reviewsData.map(async (review, index) => {
      const product = products[index % products.length];
      const parsedDate = new Date(review.date);

      await prisma.review.create({
        data: {
          user: review.user,
          content: review.content,
          rating: review.rating,
          reviewedAt: Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate,
          productId: product.id,
        },
      });
    })
  );

  console.log(`Seeded ${reviewsData.length} reviews`);
};

async function main() {
  const uploads = await uploadProductImages();
  await seedAdmin();
  await seedCatalog(uploads);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Database seeding completed.");
  })
  .catch(async (error) => {
    console.error("Seeding failed", error);
    await prisma.$disconnect();
    process.exit(1);
  });
