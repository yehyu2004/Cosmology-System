import type { Canvas } from "canvas";

/**
 * Convert a PDF buffer into an array of base64 JPEG data-URL strings,
 * one per page. Uses pdfjs-dist for parsing and node-canvas for rendering.
 *
 * Returns an empty array on any failure so grading can fall back to text-only.
 */
export async function pdfToImages(
  buffer: Buffer,
  maxPages = 25,
): Promise<string[]> {
  try {
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const { createCanvas } = await import("canvas");

    const data = new Uint8Array(buffer);
    const doc = await pdfjsLib.getDocument({ data, useSystemFonts: true })
      .promise;

    const pageCount = Math.min(doc.numPages, maxPages);
    const images: string[] = [];

    for (let i = 1; i <= pageCount; i++) {
      const page = await doc.getPage(i);
      const scale = 1.5;
      const viewport = page.getViewport({ scale });

      const canvas: Canvas = createCanvas(viewport.width, viewport.height);
      const ctx = canvas.getContext("2d");

      // pdfjs expects a browser-like canvas context; node-canvas is compatible
      // enough for rendering, but we need to cast through unknown.
      await page.render({
        canvasContext: ctx as unknown as CanvasRenderingContext2D,
        canvas: null,
        viewport,
      }).promise;

      const jpegBuffer = canvas.toBuffer("image/jpeg", { quality: 0.8 });
      const base64 = jpegBuffer.toString("base64");
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
