import { FollowUpTask } from '../types/medical';

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function formatIcsDateOnly(d: Date): string {
  return `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}`;
}

function formatIcsUtcStamp(d: Date): string {
  return `${d.getUTCFullYear()}${pad2(d.getUTCMonth() + 1)}${pad2(d.getUTCDate())}T${pad2(
    d.getUTCHours(),
  )}${pad2(d.getUTCMinutes())}${pad2(d.getUTCSeconds())}Z`;
}

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,');
}

/**
 * Parses common user-entered target dates (YYYY-MM-DD, DD.MM.YYYY, YYYY-MM).
 * Falls back to 7 days from now if no concrete date is provided.
 */
function resolveTaskStartDate(rawDate: string): Date {
  const trimmed = rawDate.trim();

  // YYYY-MM-DD
  const isoFull = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoFull) {
    const [, y, m, d] = isoFull;
    const candidate = new Date(Number(y), Number(m) - 1, Number(d));
    if (!Number.isNaN(candidate.getTime())) return candidate;
  }

  // DD.MM.YYYY
  const euFull = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (euFull) {
    const [, d, m, y] = euFull;
    const candidate = new Date(Number(y), Number(m) - 1, Number(d));
    if (!Number.isNaN(candidate.getTime())) return candidate;
  }

  // YYYY-MM -> 1st day of that month
  const isoMonth = trimmed.match(/^(\d{4})-(\d{1,2})$/);
  if (isoMonth) {
    const [, y, m] = isoMonth;
    const candidate = new Date(Number(y), Number(m) - 1, 1);
    if (!Number.isNaN(candidate.getTime())) return candidate;
  }

  // MM.YYYY -> 1st day of that month
  const euMonth = trimmed.match(/^(\d{1,2})\.(\d{4})$/);
  if (euMonth) {
    const [, m, y] = euMonth;
    const candidate = new Date(Number(y), Number(m) - 1, 1);
    if (!Number.isNaN(candidate.getTime())) return candidate;
  }

  // Fallback: reminder in 7 days
  const fallback = new Date();
  fallback.setHours(9, 0, 0, 0);
  fallback.setDate(fallback.getDate() + 7);
  return fallback;
}

export function downloadFollowUpIcs(task: FollowUpTask, descriptionPrefix: string): void {
  const startDate = resolveTaskStartDate(task.targetDate);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 1);

  const now = new Date();
  const uid = `${task.id.replace(/[^a-zA-Z0-9_-]/g, '')}@mymed-archive.local`;
  const summary = escapeIcsText(task.title);
  const descParts = [descriptionPrefix];
  if (task.targetDate.trim()) {
    descParts.push(task.targetDate.trim());
  }
  const description = escapeIcsText(descParts.join(' · '));

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MyMed Archive//Follow-up Plan//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatIcsUtcStamp(now)}`,
    `DTSTART;VALUE=DATE:${formatIcsDateOnly(startDate)}`,
    `DTEND;VALUE=DATE:${formatIcsDateOnly(endDate)}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${summary}`,
    'TRIGGER:-P1D',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  const icsContent = `${lines.join('\r\n')}\r\n`;
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const safeSlug =
    task.title
      .toLowerCase()
      .replace(/[^a-z0-9а-яіїєґ]+/gi, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 32) || 'followup';

  const link = document.createElement('a');
  link.href = url;
  link.download = `mymed_${safeSlug}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
