/**
 * Convert a stored file reference (local key or Vercel Blob URL)
 * to the authenticated API URL for the frontend.
 */
export function toFileApiUrl(storedKey: string): string {
  // Vercel Blob URLs are full https:// URLs — pass as query param
  // Use "_blob" as the [key] segment so it matches the dynamic route
  if (storedKey.startsWith("http")) {
    return `/api/files/_blob?url=${encodeURIComponent(storedKey)}`;
  }
  // Local storage key like "submissions/1234-report.pdf"
  const filename = storedKey.replace(/^submissions\//, "");
  return `/api/files/${encodeURIComponent(filename)}`;
}
