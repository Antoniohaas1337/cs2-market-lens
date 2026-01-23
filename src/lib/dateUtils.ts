/**
 * Format a date to a relative time string (e.g., "2 hours ago", "3 days ago")
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return 'just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffDays < 30) {
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  } else {
    const diffMonths = Math.floor(diffDays / 30);
    return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
  }
}

/**
 * Filter price points by number of days from now.
 *
 * The backend now returns DAILY data with proper illiquidity handling
 * (carry-forward, outlier removal), so no frontend aggregation is needed.
 * We only filter by the time range.
 */
export function filterPricePointsByDays(
  points: Array<{ timestamp: string; value: number }>,
  days: number
): Array<{ timestamp: string; value: number }> {
  if (points.length === 0) return [];

  const now = new Date();
  const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  // Filter points within the date range
  const filtered = points.filter((point) => {
    const pointDate = new Date(point.timestamp);
    return pointDate >= cutoffDate;
  });

  // Backend already provides daily data, so no aggregation needed
  // Just return the filtered data sorted chronologically
  return filtered.sort((a, b) =>
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
}

/**
 * Filter price points by a custom date range.
 */
export function filterPricePointsByDateRange(
  points: Array<{ timestamp: string; value: number }>,
  from: Date,
  to: Date
): Array<{ timestamp: string; value: number }> {
  if (points.length === 0) return [];

  // Normalize dates to start/end of day
  const fromStart = new Date(from);
  fromStart.setHours(0, 0, 0, 0);

  const toEnd = new Date(to);
  toEnd.setHours(23, 59, 59, 999);

  // Filter points within the date range
  const filtered = points.filter((point) => {
    const pointDate = new Date(point.timestamp);
    return pointDate >= fromStart && pointDate <= toEnd;
  });

  // Return sorted chronologically
  return filtered.sort((a, b) =>
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
}
