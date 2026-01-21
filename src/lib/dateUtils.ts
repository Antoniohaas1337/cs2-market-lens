/**
 * Format a date to a relative time string (e.g., "vor 2 Stunden", "vor 3 Tagen")
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return 'gerade eben';
  } else if (diffMinutes < 60) {
    return `vor ${diffMinutes} ${diffMinutes === 1 ? 'Minute' : 'Minuten'}`;
  } else if (diffHours < 24) {
    return `vor ${diffHours} ${diffHours === 1 ? 'Stunde' : 'Stunden'}`;
  } else if (diffDays < 30) {
    return `vor ${diffDays} ${diffDays === 1 ? 'Tag' : 'Tagen'}`;
  } else {
    const diffMonths = Math.floor(diffDays / 30);
    return `vor ${diffMonths} ${diffMonths === 1 ? 'Monat' : 'Monaten'}`;
  }
}

/**
 * Filter price points by number of days from now
 */
export function filterPricePointsByDays(
  points: Array<{ timestamp: string; value: number }>,
  days: number
): Array<{ timestamp: string; value: number }> {
  if (points.length === 0) return [];

  const now = new Date();
  const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  return points.filter((point) => {
    const pointDate = new Date(point.timestamp);
    return pointDate >= cutoffDate;
  });
}
