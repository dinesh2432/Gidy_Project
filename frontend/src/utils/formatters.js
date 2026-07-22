import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';

dayjs.extend(relativeTime);
dayjs.extend(utc);

/**
 * Format an ISO timestamp to a readable date-time string.
 * Example: "14 Jun 2025, 08:32 UTC"
 */
export const formatTimestamp = (ts) => {
  if (!ts) return '—';
  return dayjs.utc(ts).format('DD MMM YYYY, HH:mm [UTC]');
};

/**
 * Format timestamp as a short date string.
 * Example: "14 Jun 2025"
 */
export const formatDate = (ts) => {
  if (!ts) return '—';
  return dayjs.utc(ts).format('DD MMM YYYY');
};

/**
 * Returns a relative time string.
 * Example: "3 hours ago"
 */
export const formatRelativeTime = (ts) => {
  if (!ts) return '—';
  return dayjs.utc(ts).fromNow();
};

/**
 * Severity sort order for display purposes.
 */
export const SEVERITY_ORDER = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };

/**
 * Format a number with thousands separators.
 * Example: 10000 → "10,000"
 */
export const formatNumber = (n) => {
  if (n === null || n === undefined) return '0';
  return Number(n).toLocaleString('en-US');
};

/**
 * Truncate a string to a max length with ellipsis.
 */
export const truncate = (str, maxLen = 40) => {
  if (!str) return '—';
  return str.length > maxLen ? `${str.slice(0, maxLen)}…` : str;
};

/**
 * Copy text to clipboard and return a promise.
 */
export const copyToClipboard = (text) => {
  return navigator.clipboard.writeText(text);
};
