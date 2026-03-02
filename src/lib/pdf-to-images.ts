/**
 * Convert a PDF buffer into an array of base64 JPEG data-URL strings,
 * one per page. Uses pdfjs-dist for parsing and @napi-rs/canvas for rendering.
 *
 * Returns an empty array on any failure so grading can fall back to text-only.
 * @napi-rs/canvas is a native module that may not be available on all platforms
 * (e.g. Vercel serverless), so both imports are dynamic.
 */
export async function pdfToImages(
  buffer: Buffer,
  maxPages = 25,
): Promise<string[]> {
  try {
    const [{ createCanvas }, pdfjsLib] = await Promise.all([
      import("@napi-rs/canvas"),
      import("pdfjs-dist/legacy/build/pdf.mjs"),
    ]);

    const data = new Uint8Array(buffer);
    const doc = await pdfjsLib.getDocument({ data, useSystemFonts: true })
      .promise;

    const pageCount = Math.min(doc.numPages, maxPages);
    const images: string[] = [];

    for (let i = 1; i <= pageCount; i++) {
      const page = await doc.getPage(i);
      const scale = 1.5;
      const viewport = page.getViewport({ scale });

      const canvas = createCanvas(viewport.width, viewport.height);
      const ctx = canvas.getContext("2d");

      // pdfjs expects a browser-like canvas context; @napi-rs/canvas is compatible
      // enough for rendering, but we need to cast through unknown.
      await page.render({
        canvasContext: ctx as unknown as CanvasRenderingContext2D,
        canvas: null,
        viewport,
      }).promise;

      const jpegBuffer = canvas.toBuffer("image/jpeg");
      const base64 = Buffer.from(jpegBuffer).toString("base64");
      images.push(`data:image/jpeg;base64,${base64}`);

      page.cleanup();
    }

    doc.destroy();
    return images;
  } catch (err) {
    console.error(
      "[pdf-to-images] Failed to convert PDF pages to images:",
      err instanceof Error ? err.message : String(err),
    );
    return [];
  }
}
