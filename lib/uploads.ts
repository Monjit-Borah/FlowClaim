import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export async function saveUploadedFile(file: File) {
  const bytes = Buffer.from(await file.arrayBuffer());
  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, safeName);
  await writeFile(filePath, bytes);

  return {
    fileName: safeName,
    fileUrl: `/uploads/${safeName}`,
    mimeType: file.type,
    size: file.size
  };
}
