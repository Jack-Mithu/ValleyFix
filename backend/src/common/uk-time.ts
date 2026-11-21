/*
 * UK time helpers.
 *
 * Technicians enter working hours as "09:00" in UK local time, but the
 * database stores exact instants in UTC. The UK switches between GMT (UTC+0)
 * and BST (UTC+1), so the conversion must use the real time zone rules, not a
 * fixed offset, or bookings would be an hour out for half the year.
 */

export const UK_TZ = 'Europe/London';

const partsFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: UK_TZ,
  hourCycle: 'h23',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

function ukParts(instant: Date) {
  const parts = partsFormatter.formatToParts(instant);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)!.value);
  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour'),
    minute: get('minute'),
    second: get('second'),
  };
}

/** Minutes the UK is ahead of UTC at a given instant (0 in winter, 60 in summer). */
function ukOffsetMinutes(instant: Date): number {
  const p = ukParts(instant);
  const asIfUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return Math.round((asIfUtc - instant.getTime()) / 60000);
}

/** "2026-11-24" + "09:30" (UK local time) -> the exact UTC instant. */
export function ukToUtc(date: string, time: string): Date {
  const [y, m, d] = date.split('-').map(Number);
  const [h, min] = time.split(':').map(Number);
  const naive = Date.UTC(y, m - 1, d, h, min);
  // Two passes so times right next to a clock change resolve correctly.
  let utc = naive - ukOffsetMinutes(new Date(naive)) * 60000;
  utc = naive - ukOffsetMinutes(new Date(utc)) * 60000;
  return new Date(utc);
}

/** The UK calendar date of an instant, as "YYYY-MM-DD". */
export function ukDate(instant: Date): string {
  const p = ukParts(instant);
  return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
}

/** Day of week of a "YYYY-MM-DD" date: 0 = Sunday ... 6 = Saturday. */
export function dayOfWeek(date: string): number {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** "YYYY-MM-DD" plus n days. */
export function addDays(date: string, days: number): string {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** "09:30" -> 570 */
export const toMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

/** 570 -> "09:30" */
export const fromMinutes = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

/** The UK wall-clock time of an instant, as "HH:mm". */
export function ukTime(instant: Date): string {
  const p = ukParts(instant);
  return `${String(p.hour).padStart(2, '0')}:${String(p.minute).padStart(2, '0')}`;
}
