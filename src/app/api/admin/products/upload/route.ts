import { NextRequest, NextResponse } from "next/server";

import { requireCurrentAdmin } from "@/lib/admin-auth";
import { uploadProductImage } from "@/lib/storage/minio";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(request: NextRequest) {
  const adminOrResponse = await requireCurrentAdmin();

  if (adminOrResponse instanceof NextResponse) {
    return adminOrResponse;
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { message: "Upload requires a valid image file." },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json(
      { message: "Image exceeds the 10MB upload limit." },
      { status: 413 }
    );
  }

  const directory = formData.get("directory");

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await uploadProductImage({
      buffer,
      contentType: file.type,
      filename: file.name,
      directory: typeof directory === "string" && directory.length > 0 ? directory : undefined,
    });

    return NextResponse.json({ image: result });
  } catch (error) {
    console.error("Failed to upload product image", error);
    return NextResponse.json(
      { message: "We could not upload this file right now. Please try again." },
      { status: 500 }
    );
  }
}
