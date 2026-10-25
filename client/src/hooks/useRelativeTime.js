import { useState, useEffect } from 'react';

/**
 * Format a timestamp into relative time string.
 *
 * @param {string|number|Date} dateInput - The timestamp or ISO date
 * @returns {{ relativeTime: string, fullDate: string, minutesAgo: number }}
 */
export const formatRelativeTime = (dateInput) => {
  if (!dateInput) return { relativeTime: '—', fullDate: '—', minutesAgo: 0 };

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) {
    return { relativeTime: '—', fullDate: 'Invalid Date', minutesAgo: 0 };
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const minutesAgo = Math.max(0, Math.floor(diffInSeconds / 60));

  const fullDate = date.toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'medium'
  });

  if (diffInSeconds < 45) {
    return { relativeTime: 'Just now', fullDate, minutesAgo };
  }
  if (diffInSeconds < 90) {
    return { relativeTime: '1m ago', fullDate, minutesAgo: 1 };
  }
  if (diffInSeconds < 3600) {
    return { relativeTime: `${Math.floor(diffInSeconds / 60)}m ago`, fullDate, minutesAgo };
  }
  if (diffInSeconds < 7200) {
    return { relativeTime: '1h ago', fullDate, minutesAgo };
  }
  if (diffInSeconds < 86400) {
    return { relativeTime: `${Math.floor(diffInSeconds / 3600)}h ago`, fullDate, minutesAgo };
  }
  if (diffInSeconds < 172800) {
    return { relativeTime: 'Yesterday', fullDate, minutesAgo };
  }
  const days = Math.floor(diffInSeconds / 86400);
  if (days < 30) {
    return { relativeTime: `${days}d ago`, fullDate, minutesAgo };
  }
  return {
    relativeTime: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    fullDate,
    minutesAgo
  };
};

/**
 * Custom hook to get a live updating relative time string for a timestamp.
 *
 * @param {string|number|Date} timestamp - The date to format
 * @param {number} updateIntervalMs - Recompute interval in ms (default 30000ms)
 * @returns {{ relativeTime: string, fullDate: string, minutesAgo: number }}
 */
export const useRelativeTime = (timestamp, updateIntervalMs = 30000) => {
  const [formatted, setFormatted] = useState(() => formatRelativeTime(timestamp));

  useEffect(() => {
    setFormatted(formatRelativeTime(timestamp));

    if (!timestamp) return;

    const interval = setInterval(() => {
      setFormatted(formatRelativeTime(timestamp));
    }, updateIntervalMs);

    return () => clearInterval(interval);
  }, [timestamp, updateIntervalMs]);

  return formatted;
};

export default useRelativeTime;
