/**
 * Calculates total flight time from takeoff and landing HH:MM strings.
 * Supports midnight crossing (landing < takeoff).
 */
export function calcFlightTime(takeoff: string, landing: string): string {
  if (!takeoff || !landing) return '0:00';
  const [th, tm] = takeoff.split(':').map(Number);
  const [lh, lm] = landing.split(':').map(Number);
  if (isNaN(th) || isNaN(tm) || isNaN(lh) || isNaN(lm)) return '0:00';

  let totalMinutes = (lh * 60 + lm) - (th * 60 + tm);
  if (totalMinutes < 0) totalMinutes += 24 * 60; // midnight crossing

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Converts a YYYY-MM-DD date string to a BigInt epoch (nanoseconds).
 */
export function dateStringToEpochBigInt(dateStr: string): bigint {
  const date = new Date(dateStr + 'T00:00:00Z');
  return BigInt(date.getTime()) * BigInt(1_000_000);
}

/**
 * Returns today's date as a YYYY-MM-DD string.
 */
export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Formats a decimal hours number as H:MM string.
 */
export function formatHours(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}:${String(m).padStart(2, '0')}`;
}
