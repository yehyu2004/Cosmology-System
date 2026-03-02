import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { promises as fs } from "fs";
import path from "path";

const useR2 = !!(
  process.env.R2_ACCOUNT_ID &&
  process.env.R2_ACCESS_KEY_ID &&
  process.env.R2_SECRET_ACCESS_KEY &&
  process.env.R2_BUCKET_NAME
);

const LOCAL_STORAGE_DIR = path.join(process.cwd(), "storage");

function getS3() {
  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

export async function uploadToR2(
  buffer: Buffer,
  key: string,
  contentType: string,
): Promise<void> {
  if (useR2) {
    await getS3().send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }),
    );
  } else {
    const filePath = path.join(LOCAL_STORAGE_DIR, key);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, buffer);
  }
}

export async function getFromR2(key: string): Promise<Buffer> {
  if (useR2) {
    const res = await getS3().send(
      new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: key,
      }),
    );
    const bytes = await res.Body!.transformToByteArray();
    return Buffer.from(bytes);
  } else {
    // New uploads go to storage/submissions/...
    const filePath = path.join(LOCAL_STORAGE_DIR, key);
    try {
      return await fs.readFile(filePath);
    } catch {
      // Legacy files stored in public/uploads/ before R2 migration
      if (key.startsWith("/uploads/")) {
        return fs.readFile(path.join(process.cwd(), "public", key));
      }
      throw new Error(`File not found: ${key}`);
    }
  }
}
