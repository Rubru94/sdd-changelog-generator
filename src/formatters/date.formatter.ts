import type { DateFormatMode } from '../types/commit.types.js';

export function formatDate(date: string, mode: DateFormatMode): string {
  if (!date) return '';

  switch (mode) {
    case 'date-only':
      return date.slice(0, 10);
    case 'date-time': {
      if (date.length <= 10) return date;
      return `${date.slice(0, 10)} ${date.slice(11, 16)}`;
    }
    case 'iso':
      return date;
    default:
      return date;
  }
}
