/**
 * ResQNet Unified Time Formatting Utility
 * Enforces single consistent 24-hour HH:mm:ss format across all dashboards.
 */

/**
 * Format timestamp into 24-hour HH:mm:ss string.
 *
 * @param {string|number|Date} dateInput
 * @returns {string} 24-hour time string e.g. "15:24:27"
 */
export const formatTime24 = (dateInput) => {
  if (!dateInput) return '--:--:--';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '--:--:--';

  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

/**
 * Format timestamp into standard readable date and 24-hour time.
 *
 * @param {string|number|Date} dateInput
 * @returns {string} e.g. "25 Oct 2026, 15:24:27"
 */
export const formatDateTime24 = (dateInput) => {
  if (!dateInput) return '—';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return 'Invalid Date';

  const datePart = date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const timePart = formatTime24(date);
  return `${datePart}, ${timePart}`;
};

export default formatTime24;
