/**
 * Calculates total flight time from takeoff and landing times.
 * Handles times that cross midnight.
 * @param takeoff - Time in HH:MM format
 * @param landing - Time in HH:MM format
 * @returns Total time in HH:MM format, or empty string if invalid
 */
export function calcFlightTime(takeoff: string, landing: string): string {
  if (!takeoff || !landing) return '';

  const takeoffMatch = takeoff.match(/^(\d{1,2}):(\d{2})$/);
  const landingMatch = landing.match(/^(\d{1,2}):(\d{2})$/);

  if (!takeoffMatch || !landingMatch) return '';

  const takeoffHours = parseInt(takeoffMatch[1], 10);
  const takeoffMins = parseInt(takeoffMatch[2], 10);
  const landingHours = parseInt(landingMatch[1], 10);
  const landingMins = parseInt(landingMatch[2], 10);

  if (
    takeoffHours > 23 || takeoffMins > 59 ||
    landingHours > 23 || landingMins > 59
  ) return '';

  let totalMins = (landingHours * 60 + landingMins) - (takeoffHours * 60 + takeoffMins);

  // Handle crossing midnight
  if (totalMins < 0) {
    totalMins += 24 * 60;
  }

  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;

  return `${hours}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Converts a date string (YYYY-MM-DD) to epoch nanoseconds as a BigInt.
 */
export function dateToEpochNat(dateStr: string): bigint {
  try {
    const d = new Date(dateStr + 'T00:00:00Z');
    return BigInt(d.getTime()) * BigInt(1_000_000);
  } catch {
    return BigInt(0);
  }
}

/**
 * Formats today's date as YYYY-MM-DD.
 */
export function todayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
