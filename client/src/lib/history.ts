export const HISTORY_KEY = "resume-insight-history";

export function parseHistory<T>(raw: string | null): T[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function serializeHistory<T>(items: T[]): string {
  return JSON.stringify(items.slice(0, 12));
}
