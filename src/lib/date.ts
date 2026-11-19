import type { DateFormat } from '../types';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Stored dates are `YYYY-MM` (or `YYYY`). Anything unparseable is shown verbatim. */
export function formatMonth(value: string, format: DateFormat): string {
  const raw = value.trim();
  if (!raw) return '';
  const match = /^(\d{4})(?:-(\d{1,2}))?$/.exec(raw);
  if (!match) return raw;
  const year = match[1];
  const monthIndex = match[2] ? Number(match[2]) - 1 : 0;
  if (monthIndex < 0 || monthIndex > 11) return raw;
  const month = MONTHS[monthIndex];
  const mm = String(monthIndex + 1).padStart(2, '0');

  switch (format) {
    case 'MM/YYYY':
      return `${mm}/${year}`;
    case 'DD/MM/YYYY':
      return `01/${mm}/${year}`;
    case 'MM/DD/YYYY':
      return `${mm}/01/${year}`;
    case 'MMM YYYY':
    default:
      return `${month} ${year}`;
  }
}

export function formatRange(
  startDate: string,
  endDate: string,
  current: boolean,
  format: DateFormat,
): string {
  const start = formatMonth(startDate, format);
  const end = current ? 'Present' : formatMonth(endDate, format);
  if (start && end) return `${start} – ${end}`;
  return start || end || '';
}

export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return 'just now';
  const diff = Math.max(0, Date.now() - then);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes === 1) return '1 min ago';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours === 1) return '1 hour ago';
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  return new Date(then).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

/** Suggested `YYYY-MM` value for the current month, used by entry shortcuts. */
export function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}
