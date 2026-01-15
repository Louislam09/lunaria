/**
 * Helper functions for converting between TinyBase format and app format
 */

/**
 * Convert integer (0/1) to boolean
 */
export function intToBool(value: number | null | undefined): boolean {
  return value === 1;
}

/**
 * Convert boolean to integer (0/1)
 */
export function boolToInt(value: boolean | null | undefined): number {
  if (value === null || value === undefined) return 0;
  return value ? 1 : 0;
}

/**
 * Parse JSON string to array, return empty array if invalid
 */
export function parseJsonArray<T>(value: string | null | undefined): T[] {
  if (!value) return [];
  try {
    return JSON.parse(value) as T[];
  } catch {
    return [];
  }
}

/**
 * Stringify array to JSON string
 */
export function stringifyJsonArray<T>(value: T[] | null | undefined): string {
  return JSON.stringify(value || []);
}

/**
 * Parse JSON string to object, return null if invalid
 */
export function parseJsonObject<T>(value: string | null | undefined): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

/**
 * Stringify object to JSON string
 */
export function stringifyJsonObject<T>(value: T | null | undefined): string {
  return JSON.stringify(value || {});
}
