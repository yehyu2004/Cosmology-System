import { put, del, get } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";

const useBlob = !!process.env.BLOB_READ_WRITE_TOKEN;

const LOCAL_STORAGE_DIR = path.join(process.cwd(), "storage");

export async function uploadToR2(
  buffer: Buffer,
  key: string,
  contentType: string,
): Promise<string> {
  if (useBlob) {
    const blob = await put(key, buffer, {
      access: "private",
      contentType,
      addRandomSuffix: false,
    });
    return blob.url;
  } else {
    const filePath = path.join(LOCAL_STORAGE_DIR, key);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, buffer);
    return key;
  }
}

export async function getFromR2(key: string): Promise<Buffer> {
  if (useBlob && key.startsWith("http")) {
    const res = await get(key, { access: "private" });
    if (!res || res.statusCode === 304) {
      throw new Error(`Blob not found: ${key}`);
    }
    const reader = res.stream.getReader();
    const chunks: Uint8Array[] = [];
    let done = false;
    while (!done) {
      const result = await reader.read();
      done = result.done;
      if (result.value) chunks.push(result.value);
    }
    return Buffer.concat(chunks);
  } else if (!useBlob) {
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
  } else {
    throw new Error(`Cannot fetch non-URL key without local storage: ${key}`);
  }
}

export async function deleteFromStorage(key: string): Promise<void> {
  if (useBlob) {
    await del(key);
  } else {
    const filePath = path.join(LOCAL_STORAGE_DIR, key);
    await fs.unlink(filePath).catch(() => {});
  }
}
