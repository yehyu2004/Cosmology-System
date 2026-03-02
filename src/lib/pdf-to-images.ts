/**
 * Convert a PDF buffer into an array of base64 PNG data-URL strings,
 * one per page. Uses mupdf WASM for rendering — works on Vercel serverless
 * (no native dependencies).
 *
 * Returns an empty array on any failure so grading can fall back to text-only.
 */
export async function pdfToImages(
  buffer: Buffer,
  maxPages = 25,
): Promise<string[]> {
  try {
    const mupdf = await import("mupdf");

    const doc = mupdf.Document.openDocument(buffer, "application/pdf");
    const pageCount = Math.min(doc.countPages(), maxPages);
    const images: string[] = [];

    for (let i = 0; i < pageCount; i++) {
      const page = doc.loadPage(i);
      const pixmap = page.toPixmap(
        mupdf.Matrix.scale(2, 2),
        mupdf.ColorSpace.DeviceRGB,
        false,
        true,
      );
      const pngBytes = pixmap.asPNG();
      const base64 = Buffer.from(pngBytes).toString("base64");
      images.push(`data:image/png;base64,${base64}`);
    }

    return images;
  } catch (err) {
    console.error(
      "[pdf-to-images] Failed to convert PDF pages to images:",
      err instanceof Error ? err.message : String(err),
    );
    return [];
  }
}
