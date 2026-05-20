export function createPublicId(prefix: string, sourceId: string, digits: number) {
  const numeric = Number.parseInt(sourceId.slice(-12), 16);
  const max = 10 ** digits;
  const value = Number.isFinite(numeric) ? Math.abs(numeric % max) : 0;
  return `${prefix}_${String(value).padStart(digits, "0")}`;
}
