/**
 * Convert a stored R2 key (e.g. "submissions/1234-report.pdf")
 * to the authenticated API URL for the frontend.
 */
export function toFileApiUrl(storedKey: string): string {
  // Strip the "submissions/" prefix to get just the filename
  const filename = storedKey.replace(/^submissions\//, "");
  return `/api/files/${encodeURIComponent(filename)}`;
}
