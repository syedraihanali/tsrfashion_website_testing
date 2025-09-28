import { randomUUID } from "crypto";
import { URL } from "url";
import {
  CreateBucketCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { extension as getExtension, lookup as lookupMimeType } from "mime-types";

const getConfiguration = () => {
  const endpoint = process.env.MINIO_ENDPOINT;
  const accessKeyId = process.env.MINIO_ACCESS_KEY;
  const secretAccessKey = process.env.MINIO_SECRET_KEY;
  const bucket = process.env.MINIO_BUCKET ?? "tsrfashion-products";
  const region = process.env.MINIO_REGION ?? "us-east-1";
  const publicBaseUrl = process.env.MINIO_PUBLIC_URL;

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error("MinIO storage is not fully configured. Please define MINIO_ENDPOINT, MINIO_ACCESS_KEY, and MINIO_SECRET_KEY.");
  }

  const endpointUrl = new URL(endpoint);

  return {
    endpointUrl,
    accessKeyId,
    secretAccessKey,
    bucket,
    region,
    publicBaseUrl,
  };
};

let client: S3Client | null = null;
let bucketReady: Promise<void> | null = null;

const getClient = () => {
  if (!client) {
    const { endpointUrl, region, accessKeyId, secretAccessKey } = getConfiguration();

    client = new S3Client({
      endpoint: endpointUrl.origin,
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true,
    });
  }

  return client;
};

const ensureBucketExists = async () => {
  if (!bucketReady) {
    bucketReady = (async () => {
      const { bucket } = getConfiguration();
      const s3 = getClient();

      try {
        await s3.send(new HeadBucketCommand({ Bucket: bucket }));
      } catch (error) {
        const errorCode = (error as { name?: string; Code?: string }).Code ?? (error as { name?: string }).name;
        const statusCode = (error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode;

        if (statusCode === 404 || errorCode === "NotFound" || errorCode === "NoSuchBucket") {
          await s3.send(new CreateBucketCommand({ Bucket: bucket }));
          return;
        }

        throw error;
      }
    })();
  }

  await bucketReady;
};

export type UploadProductImageParams = {
  buffer: Buffer;
  contentType?: string;
  filename?: string;
  directory?: string;
};

export type UploadProductImageResult = {
  key: string;
  url: string;
  contentType: string;
};

export const uploadProductImage = async ({
  buffer,
  contentType,
  filename,
  directory = "products",
}: UploadProductImageParams): Promise<UploadProductImageResult> => {
  await ensureBucketExists();

  const config = getConfiguration();
  const s3 = getClient();

  const derivedExtension = (() => {
    if (filename) {
      const ext = filename.split(".").pop();
      if (ext && ext.length <= 5) {
        return ext.toLowerCase();
      }
    }

    if (contentType) {
      const ext = getExtension(contentType);
      if (ext) {
        return ext;
      }
    }

    return "bin";
  })();

  const normalizedContentType =
    contentType || lookupMimeType(derivedExtension) || "application/octet-stream";

  const key = `${directory.replace(/\/$/, "")}/${new Date().getUTCFullYear()}/${randomUUID()}.${derivedExtension}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: buffer,
      ContentType: normalizedContentType,
    })
  );

  const baseUrl = config.publicBaseUrl
    ? config.publicBaseUrl.replace(/\/$/, "")
    : `${config.endpointUrl.origin}/${config.bucket}`;

  return {
    key,
    url: `${baseUrl}/${key}`,
    contentType: normalizedContentType,
  };
};
